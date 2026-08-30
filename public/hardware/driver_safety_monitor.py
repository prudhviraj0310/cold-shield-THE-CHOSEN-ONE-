#!/usr/bin/env python3
"""
🛡️ Cold Shield — Driver Safety Monitor (Raspberry Pi)
======================================================
Uses Pi Camera + GPS to detect:
  1. Drowsiness (Eye Aspect Ratio)
  2. Yawning (Mouth Aspect Ratio)
  3. Head drooping (Face tilt angle)
  4. Rash driving (GPS speed anomalies)
  5. Over-speeding (>80 km/h)

Runs alongside coldshield_node.py. Sends alerts to dashboard.

Requirements:
  pip3 install mediapipe opencv-python-headless numpy requests
"""

import time
import json
import os
import sys
import math
import datetime
import urllib.request
import urllib.parse
from collections import deque

# ============================================================
# CONFIG
# ============================================================
THINGSPEAK_WRITE_API_KEY = "XKR0V0DA4T18LG55"
ALERT_COOLDOWN_SECONDS = 30  # Don't spam alerts faster than this
SPEED_LIMIT_KMH = 80         # Over-speeding threshold
RASH_ACCELERATION = 20        # km/h change in 5 seconds = rash
EAR_THRESHOLD = 0.21          # Eye closed if EAR < this
EAR_CONSEC_FRAMES = 15        # Eyes closed for 15 frames = drowsy
MAR_THRESHOLD = 0.65          # Mouth open if MAR > this (yawning)
HEAD_TILT_THRESHOLD = 25      # Degrees — head drooping

# ============================================================
# IMPORTS (with graceful fallback)
# ============================================================
CV2_AVAILABLE = False
MP_AVAILABLE = False

try:
    import cv2
    CV2_AVAILABLE = True
    print("✅ OpenCV loaded")
except ImportError:
    print("⚠️  OpenCV not installed. Run: pip3 install opencv-python-headless")

try:
    import mediapipe as mp
    MP_AVAILABLE = True
    print("✅ MediaPipe loaded")
except ImportError:
    print("⚠️  MediaPipe not installed. Run: pip3 install mediapipe")

try:
    import numpy as np
except ImportError:
    print("⚠️  NumPy not installed. Run: pip3 install numpy")

# GPS (reuse from coldshield_node)
GPS_AVAILABLE = False
gps_serial = None
try:
    import serial
    import pynmea2
    gps_serial = serial.Serial('/dev/serial0', baudrate=9600, timeout=1)
    GPS_AVAILABLE = True
    print("✅ GPS initialized for speed monitoring")
except:
    print("⚠️  GPS not available for speed monitoring")


# ============================================================
# EYE ASPECT RATIO (EAR) — Drowsiness Detection
# ============================================================
# MediaPipe Face Mesh landmark indices for eyes
# Left eye: [362, 385, 387, 263, 373, 380]
# Right eye: [33, 160, 158, 133, 153, 144]

LEFT_EYE = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33, 160, 158, 133, 153, 144]
MOUTH_TOP = 13
MOUTH_BOTTOM = 14
MOUTH_LEFT = 78
MOUTH_RIGHT = 308
NOSE_TIP = 1
CHIN = 199
LEFT_EYE_OUTER = 33
RIGHT_EYE_OUTER = 263


def euclidean(p1, p2):
    """Calculate Euclidean distance between two landmarks."""
    return math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2)


def eye_aspect_ratio(landmarks, eye_indices):
    """
    Compute the Eye Aspect Ratio (EAR).
    EAR ≈ 0.3 when eyes open, drops below 0.21 when closed.
    """
    # Vertical distances
    v1 = euclidean(landmarks[eye_indices[1]], landmarks[eye_indices[5]])
    v2 = euclidean(landmarks[eye_indices[2]], landmarks[eye_indices[4]])
    # Horizontal distance
    h = euclidean(landmarks[eye_indices[0]], landmarks[eye_indices[3]])
    
    if h == 0:
        return 0.3
    
    ear = (v1 + v2) / (2.0 * h)
    return ear


def mouth_aspect_ratio(landmarks):
    """
    Compute Mouth Aspect Ratio (MAR).
    MAR > 0.65 indicates yawning.
    """
    vertical = euclidean(landmarks[MOUTH_TOP], landmarks[MOUTH_BOTTOM])
    horizontal = euclidean(landmarks[MOUTH_LEFT], landmarks[MOUTH_RIGHT])
    
    if horizontal == 0:
        return 0
    
    return vertical / horizontal


def head_tilt_angle(landmarks):
    """
    Estimate head tilt by comparing nose tip to chin angle.
    If head droops, the angle increases beyond threshold.
    """
    nose = landmarks[NOSE_TIP]
    chin = landmarks[CHIN]
    
    dx = chin.x - nose.x
    dy = chin.y - nose.y
    
    # Angle from vertical (0 = upright, >25 = drooping)
    angle = abs(math.degrees(math.atan2(dx, dy)))
    return angle


# ============================================================
# GPS SPEED MONITORING
# ============================================================
speed_history = deque(maxlen=10)  # Last 10 speed readings


def read_gps_speed():
    """Read current speed from GPS module."""
    if not GPS_AVAILABLE or gps_serial is None:
        return 0.0
    
    for _ in range(30):
        try:
            line = gps_serial.readline().decode('ascii', errors='replace').strip()
            if line.startswith('$GPRMC'):
                msg = pynmea2.parse(line)
                if hasattr(msg, 'spd_over_grnd') and msg.spd_over_grnd:
                    return round(float(msg.spd_over_grnd) * 1.852, 1)  # knots → km/h
        except:
            continue
    return 0.0


def check_rash_driving(current_speed):
    """Detect rash driving by analyzing speed changes."""
    speed_history.append(current_speed)
    
    alerts = []
    
    # Over-speeding
    if current_speed > SPEED_LIMIT_KMH:
        alerts.append({
            'type': 'OVERSPEEDING',
            'severity': 'critical',
            'message': f'⚠️ OVER-SPEEDING: {current_speed} km/h (Limit: {SPEED_LIMIT_KMH} km/h)',
            'speed': current_speed
        })
    
    # Sudden acceleration/braking
    if len(speed_history) >= 3:
        recent_change = abs(speed_history[-1] - speed_history[-3])
        if recent_change > RASH_ACCELERATION:
            alert_type = 'HARD_BRAKE' if speed_history[-1] < speed_history[-3] else 'RASH_ACCELERATION'
            alerts.append({
                'type': alert_type,
                'severity': 'warning',
                'message': f'⚠️ {alert_type}: Speed changed by {recent_change:.1f} km/h in last readings',
                'speed': current_speed
            })
    
    return alerts


# ============================================================
# ALERT SENDER
# ============================================================
last_alert_time = {}

def send_alert(alert_type, message, severity='warning'):
    """Send alert to ThingSpeak field7 (driver safety alerts)."""
    now = time.time()
    
    # Cooldown check
    if alert_type in last_alert_time:
        if now - last_alert_time[alert_type] < ALERT_COOLDOWN_SECONDS:
            return
    
    last_alert_time[alert_type] = now
    
    timestamp = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"\n  🚨 [{timestamp}] ALERT: {message}")
    
    # Upload alert to ThingSpeak field7
    try:
        alert_data = json.dumps({
            'type': alert_type,
            'severity': severity,
            'message': message,
            'time': timestamp
        })
        
        params = urllib.parse.urlencode({
            'api_key': THINGSPEAK_WRITE_API_KEY,
            'field7': alert_type,
            'field8': message[:255],  # ThingSpeak field limit
        })
        
        url = f"https://api.thingspeak.com/update?{params}"
        req = urllib.request.Request(url, headers={'User-Agent': 'ColdShield-DriverSafety'})
        urllib.request.urlopen(req, timeout=5)
        print(f"  📡 Alert sent to ThingSpeak")
    except Exception as e:
        print(f"  ⚠️  Could not send alert: {e}")
    
    # Also play buzzer/alarm sound on Pi
    try:
        if severity == 'critical':
            os.system("aplay /usr/share/sounds/alsa/Front_Center.wav 2>/dev/null &")
    except:
        pass


# ============================================================
# MAIN LOOP
# ============================================================
def main():
    print("")
    print("=" * 60)
    print("🛡️ COLD SHIELD — Driver Safety Monitor ACTIVE")
    print("=" * 60)
    print(f"  Camera:  {'✅ READY' if CV2_AVAILABLE and MP_AVAILABLE else '⚠️ NOT AVAILABLE'}")
    print(f"  GPS:     {'✅ SPEED MONITORING' if GPS_AVAILABLE else '⚠️ DISABLED'}")
    print(f"  Drowsiness EAR threshold:  < {EAR_THRESHOLD}")
    print(f"  Yawning MAR threshold:     > {MAR_THRESHOLD}")
    print(f"  Head tilt threshold:        > {HEAD_TILT_THRESHOLD}°")
    print(f"  Speed limit:                {SPEED_LIMIT_KMH} km/h")
    print("=" * 60)
    print("")
    
    if not CV2_AVAILABLE or not MP_AVAILABLE:
        print("❌ Cannot start vision monitoring without OpenCV + MediaPipe.")
        print("   Install: pip3 install mediapipe opencv-python-headless numpy")
        print("   Falling back to GPS-only speed monitoring...")
        
        # GPS-only mode
        while True:
            speed = read_gps_speed()
            alerts = check_rash_driving(speed)
            for alert in alerts:
                send_alert(alert['type'], alert['message'], alert['severity'])
            
            now = datetime.datetime.now().strftime("%H:%M:%S")
            print(f"  [{now}] Speed: {speed} km/h | GPS-only mode")
            time.sleep(2)
        return
    
    # Initialize MediaPipe Face Mesh
    mp_face_mesh = mp.solutions.face_mesh
    face_mesh = mp_face_mesh.FaceMesh(
        max_num_faces=1,
        refine_landmarks=True,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    
    # Initialize camera
    cap = cv2.VideoCapture(0)  # Pi Camera via V4L2
    if not cap.isOpened():
        print("❌ Cannot open camera. Check connection.")
        return
    
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    cap.set(cv2.CAP_PROP_FPS, 15)
    
    print("📹 Camera stream started. Monitoring driver...")
    
    eye_closed_counter = 0
    yawn_counter = 0
    frame_count = 0
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                time.sleep(0.1)
                continue
            
            frame_count += 1
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process face
            results = face_mesh.process(rgb_frame)
            
            if results.multi_face_landmarks:
                landmarks = results.multi_face_landmarks[0].landmark
                
                # 1. EYE ASPECT RATIO — Drowsiness
                left_ear = eye_aspect_ratio(landmarks, LEFT_EYE)
                right_ear = eye_aspect_ratio(landmarks, RIGHT_EYE)
                avg_ear = (left_ear + right_ear) / 2.0
                
                if avg_ear < EAR_THRESHOLD:
                    eye_closed_counter += 1
                    if eye_closed_counter >= EAR_CONSEC_FRAMES:
                        send_alert(
                            'DROWSINESS',
                            f'😴 DROWSINESS DETECTED! Eyes closed for {eye_closed_counter} frames (EAR: {avg_ear:.3f})',
                            'critical'
                        )
                else:
                    eye_closed_counter = 0
                
                # 2. MOUTH ASPECT RATIO — Yawning
                mar = mouth_aspect_ratio(landmarks)
                if mar > MAR_THRESHOLD:
                    yawn_counter += 1
                    if yawn_counter >= 10:  # Sustained yawn
                        send_alert(
                            'YAWNING',
                            f'🥱 YAWNING DETECTED! MAR: {mar:.3f} — Driver may be fatigued',
                            'warning'
                        )
                else:
                    yawn_counter = 0
                
                # 3. HEAD TILT — Drooping
                tilt = head_tilt_angle(landmarks)
                if tilt > HEAD_TILT_THRESHOLD:
                    send_alert(
                        'HEAD_DROOP',
                        f'😵 HEAD DROOPING! Tilt: {tilt:.1f}° — Driver nodding off',
                        'critical'
                    )
                
                # Log every 30 frames
                if frame_count % 30 == 0:
                    now = datetime.datetime.now().strftime("%H:%M:%S")
                    status = "👁️ ALERT" if avg_ear < EAR_THRESHOLD else "👁️ OK"
                    print(f"  [{now}] EAR: {avg_ear:.3f} {status} | MAR: {mar:.3f} | Tilt: {tilt:.1f}°")
            
            else:
                # No face detected
                if frame_count % 60 == 0:
                    send_alert(
                        'NO_FACE',
                        '❓ Driver face not detected — camera may be blocked or driver absent',
                        'warning'
                    )
            
            # 4. GPS SPEED CHECK (every 30 frames ≈ every 2 seconds)
            if frame_count % 30 == 0:
                speed = read_gps_speed()
                speed_alerts = check_rash_driving(speed)
                for alert in speed_alerts:
                    send_alert(alert['type'], alert['message'], alert['severity'])
            
            # Small delay to not overload CPU
            time.sleep(0.033)  # ~30 FPS cap
    
    except KeyboardInterrupt:
        print("\n🛑 Driver Safety Monitor stopped.")
    finally:
        cap.release()
        face_mesh.close()


if __name__ == "__main__":
    main()
