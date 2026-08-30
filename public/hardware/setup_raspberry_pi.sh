#!/bin/bash
# ============================================================
# 🛡️ Cold Shield — Raspberry Pi One-Click Setup Script
# ============================================================
# Run this ONCE on the Raspberry Pi to install everything.
# After this, just plug sensors and reboot. It auto-starts.
#
# Usage: 
#   chmod +x setup_raspberry_pi.sh
#   sudo ./setup_raspberry_pi.sh
# ============================================================

set -e
echo ""
echo "============================================================"
echo "🛡️  COLD SHIELD — Raspberry Pi Auto-Setup"
echo "============================================================"
echo ""

# 1. System Update
echo "[1/7] 📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Install Python packages
echo "[2/7] 🐍 Installing Python dependencies..."
sudo apt-get install -y python3-pip python3-venv python3-serial python3-pil gpsd gpsd-clients python3-gps libgpiod2

# Create virtual environment
python3 -m venv /home/$(whoami)/coldshield_env --system-site-packages
source /home/$(whoami)/coldshield_env/bin/activate

pip3 install --break-system-packages adafruit-circuitpython-dht gTTS requests pynmea2 picamera2 2>/dev/null || \
pip3 install adafruit-circuitpython-dht gTTS requests pynmea2 picamera2 2>/dev/null || true

# 3. Enable interfaces
echo "[3/7] 🔧 Enabling Serial (UART) for GPS & Camera..."
sudo raspi-config nonint do_serial_hw 0      # Enable Serial Hardware (for GPS)
sudo raspi-config nonint do_serial_cons 1     # Disable Serial Console (frees UART for GPS)
sudo raspi-config nonint do_camera 0          # Enable Camera
sudo raspi-config nonint do_i2c 0             # Enable I2C (for future sensors)

# 4. Configure GPS daemon
echo "[4/7] 🛰️ Configuring GPS daemon (gpsd)..."
sudo systemctl stop gpsd.socket 2>/dev/null || true
sudo systemctl disable gpsd.socket 2>/dev/null || true

# GPS on /dev/serial0 (GPIO 14 TX, GPIO 15 RX on Pi)
cat <<EOF | sudo tee /etc/default/gpsd
START_DAEMON="true"
GPSD_OPTIONS="-n"
DEVICES="/dev/serial0"
USBAUTO="false"
GPSD_SOCKET="/var/run/gpsd.sock"
EOF

sudo systemctl enable gpsd
sudo systemctl start gpsd || true

# 5. Copy the main Cold Shield script
echo "[5/7] 📋 Installing Cold Shield main service script..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
sudo mkdir -p /opt/coldshield
sudo cp "${SCRIPT_DIR}/coldshield_node.py" /opt/coldshield/coldshield_node.py
sudo chmod +x /opt/coldshield/coldshield_node.py

# 6. Create systemd service (auto-start on boot)
echo "[6/7] ⚙️ Creating systemd auto-start service..."
cat <<EOF | sudo tee /etc/systemd/system/coldshield.service
[Unit]
Description=Cold Shield Agricultural IoT Node
After=network-online.target gpsd.service
Wants=network-online.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=/opt/coldshield
ExecStart=/usr/bin/python3 /opt/coldshield/coldshield_node.py
Restart=always
RestartSec=10
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable coldshield.service
sudo systemctl start coldshield.service || true

# 7. Done
echo ""
echo "[7/7] ✅ SETUP COMPLETE!"
echo ""
echo "============================================================"
echo "  🎉 Cold Shield is now installed and will auto-start"
echo "  on every boot. Just plug sensors and power on."
echo ""
echo "  📡 Service status:  sudo systemctl status coldshield"
echo "  📋 Live logs:       sudo journalctl -u coldshield -f"
echo "  🔄 Restart:         sudo systemctl restart coldshield"
echo "  ❌ Stop:            sudo systemctl stop coldshield"
echo ""
echo "  WIRING REMINDER:"
echo "  ┌──────────────────────────────────────────┐"
echo "  │  DHT11 DATA  ──► GPIO 4  (Pin 7)        │"
echo "  │  DHT11 VCC   ──► 3.3V    (Pin 1)        │"
echo "  │  DHT11 GND   ──► GND     (Pin 6)        │"
echo "  │                                          │"
echo "  │  GPS TX      ──► GPIO 15 / RXD (Pin 10) │"
echo "  │  GPS RX      ──► GPIO 14 / TXD (Pin 8)  │"
echo "  │  GPS VCC     ──► 5V      (Pin 2)        │"
echo "  │  GPS GND     ──► GND     (Pin 9)        │"
echo "  │                                          │"
echo "  │  Camera      ──► CSI Ribbon Cable        │"
echo "  └──────────────────────────────────────────┘"
echo "============================================================"
echo ""
echo "⚠️  REBOOT REQUIRED to activate Serial/Camera."
echo "    Run: sudo reboot"
echo ""
