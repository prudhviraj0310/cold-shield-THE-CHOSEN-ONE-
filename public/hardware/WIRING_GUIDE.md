# 🛡️ Cold Shield — Raspberry Pi Plug & Play Wiring Guide

> **Print this page. Follow the diagram. Plug at 1 PM. It works.**

---

## 📋 Current Status

| Component | Status | What's Left |
|---|---|---|
| Raspberry Pi 4B | ✅ Booting, WiFi connected | Run setup script |
| DHT11 Sensor | ✅ Working (temp + humidity) | Wire to GPIO 4 |
| NEO-6M GPS | ❌ Not configured | Wire to UART + run setup |
| Pi Camera | ❌ Not configured | Plug CSI cable + run setup |

---

## 🔌 STEP 1: Wiring Diagram (Do This at 1 PM)

```
                    RASPBERRY PI 4B (GPIO Header)
                    ┌─────────────────────────────┐
                    │  (Pin 1)  3.3V    5V (Pin 2)│──── GPS VCC (Red)
    DHT11 VCC ─────│  (Pin 1)  3.3V              │
                    │  (Pin 3)  GPIO 2  5V (Pin 4)│
                    │  (Pin 5)  GPIO 3  GND(Pin 6)│──── DHT11 GND (Black)
    DHT11 DATA ────│  (Pin 7)  GPIO 4            │
                    │           GPIO 14 TXD(Pin 8)│──── GPS RX (Yellow)
                    │  (Pin 9)  GND               │──── GPS GND (Black)
    GPS TX ────────│  (Pin 10) GPIO 15 RXD       │
                    │  (Pin 11) GPIO 17           │
                    │  (Pin 12) GPIO 18           │
                    │  ...                        │
                    └─────────────────────────────┘
                          │
                          │ CSI Ribbon Cable
                          ▼
                    ┌─────────────┐
                    │  Pi Camera  │
                    └─────────────┘
```

### DHT11 Wiring (3 wires):
```
DHT11 Pin    →    Raspberry Pi Pin
─────────────────────────────────
VCC (+)      →    Pin 1  (3.3V)
DATA         →    Pin 7  (GPIO 4)
GND (-)      →    Pin 6  (GND)
```

### NEO-6M GPS Wiring (4 wires):
```
GPS Pin      →    Raspberry Pi Pin
─────────────────────────────────
VCC          →    Pin 2  (5V)         ⚠️ GPS needs 5V, not 3.3V!
GND          →    Pin 9  (GND)
TX           →    Pin 10 (GPIO 15 / RXD)   ← GPS TX goes to Pi RX
RX           →    Pin 8  (GPIO 14 / TXD)   ← GPS RX goes to Pi TX
```
> ⚠️ **CRITICAL**: GPS TX → Pi RX (Pin 10). GPS RX → Pi TX (Pin 8). They CROSS!

### Pi Camera (1 ribbon cable):
```
1. Lift the black clip on the CSI port (between HDMI and audio jack)
2. Insert ribbon cable with blue side facing the USB ports
3. Push clip back down firmly
```

---

## 💻 STEP 2: Run Setup Script on Raspberry Pi (Do This NOW from Laptop)

### Option A: SSH from your laptop
```bash
# SSH into your Pi (replace with your Pi's IP)
ssh pi@<YOUR_PI_IP>

# Download the setup files
mkdir -p ~/coldshield
cd ~/coldshield

# Copy files from your laptop (run this ON YOUR LAPTOP):
scp /Users/prudhviraj/Downloads/hackthons/public/hardware/setup_raspberry_pi.sh pi@<PI_IP>:~/coldshield/
scp /Users/prudhviraj/Downloads/hackthons/public/hardware/coldshield_node.py pi@<PI_IP>:~/coldshield/

# Then SSH back into Pi and run:
ssh pi@<PI_IP>
cd ~/coldshield
chmod +x setup_raspberry_pi.sh
sudo ./setup_raspberry_pi.sh

# Reboot after setup
sudo reboot
```

### Option B: Direct on Pi (if you have keyboard/monitor)
```bash
cd ~/coldshield
chmod +x setup_raspberry_pi.sh
sudo ./setup_raspberry_pi.sh
sudo reboot
```

---

## 🔄 STEP 3: After Reboot — Verify Everything

```bash
# Check Cold Shield is running:
sudo systemctl status coldshield

# Watch live sensor data:
sudo journalctl -u coldshield -f

# You should see output like:
# [08:45:12] Cycle #1
#   🌡️  Temp: 4.2°C | 💧 Humidity: 68%
#   🛰️  GPS: 15.828100°N, 78.037300°E | Speed: 0.0 km/h | Sats: 6
#   ✅ ThingSpeak Entry #1234 uploaded successfully

# Check GPS separately:
gpsmon
# (You should see satellite data flowing)

# Test camera:
rpicam-still -o test.jpg
# (Should save a photo)
```

---

## 🎯 STEP 4: At 1 PM — Plug & Play Sequence

```
1. Power OFF Raspberry Pi

2. Wire DHT11:
   - Red    → Pin 1  (3.3V)
   - Yellow → Pin 7  (GPIO 4)
   - Black  → Pin 6  (GND)

3. Wire GPS:
   - Red    → Pin 2  (5V)
   - Black  → Pin 9  (GND)
   - Green (TX) → Pin 10 (RXD)
   - Yellow (RX) → Pin 8  (TXD)

4. Plug Camera ribbon into CSI port

5. Power ON Raspberry Pi

6. Wait 60 seconds for boot

7. Open dashboard: localhost:3000/dashboard
   → Data flows automatically! ✅
```

---

## 🔧 Troubleshooting (Quick Fixes)

| Problem | Fix |
|---|---|
| No temperature data | Check DHT11 DATA wire is on Pin 7 (GPIO 4) |
| GPS shows 0,0 | Take Pi near a window. GPS needs sky view. First fix takes 2-5 min |
| GPS TX/RX swapped | Swap the Green and Yellow wires |
| Camera not detected | Re-seat ribbon cable. Blue side faces USB ports |
| ThingSpeak shows 0 | Wait 15s between readings (free tier rate limit) |
| Service not starting | Run: `sudo journalctl -u coldshield -f` to see errors |
| "Permission denied" on serial | Run: `sudo usermod -aG dialout pi && sudo reboot` |

---

## ⏰ Timeline

| Time | Action |
|---|---|
| **NOW** | SSH into Pi → Run `setup_raspberry_pi.sh` → Reboot |
| **After reboot** | Verify: `sudo systemctl status coldshield` |
| **1:00 PM** | Plug DHT11 + GPS + Camera → Power on |
| **1:02 PM** | Data appears on dashboard automatically |
