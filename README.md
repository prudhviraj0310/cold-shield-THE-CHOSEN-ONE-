# 🛡️ Cold Shield — Agricultural Cold-Chain & Farm Intelligence System

> **Team**: The Chosen One  
> **Project**: Cold Shield  
> **Mission**: From Soil to Safety — Real-time physical IoT monitoring, AI crop pathology, and cold-chain intelligence for farmers and supply chains.

---

## 🌟 Executive Summary

Over **30% of harvested agricultural produce** in developing nations is lost before reaching consumers due to post-harvest thermal drift, transit delays, and unmonitored cold storage. 

**Cold Shield** bridges the gap between field harvest and safe consumer delivery through a **dual-experience architecture**:
1. **The Story (`/`)**: A high-contrast, 60Hz/120Hz VSync scrollytelling cinematic film depicting the life cycle of produce from a single seed to protected delivery.
2. **The Machine (`/dashboard`)**: A real-time light-theme operations dashboard integrating physical IoT sensor telemetry (ThingSpeak), AI crop disease diagnostics (Google Gemini), live Indian Mandi wholesale rates (data.gov.in), smart route weather advisory (OpenWeatherMap + Google Maps), and an interactive 2G feature-phone simulator for rural farmers.

---

## 🚀 Key Features & Modules

### 1. 🎬 Fullscreen 60Hz Cinematic Story (`/`)
- **Native 60Hz/120Hz VSync Render Engine**: Hardware-decoded `ImageBitmap` buffers with Lenis momentum smooth scrolling.
- **Exact 5-Chapter Timeline Scrubbing**:
  - **Stage 01 (0s–1s)**: *The Seed* — Biological foundation in fertile soil.
  - **Stage 02 (2s–3s)**: *Plant Growth* — Germination and vegetative health.
  - **Stage 03 (3s–4s)**: *Packaging & Harvest* — Handling produce into crates.
  - **Stage 04 (5s–7s)**: *Cold Room Storage* — Industrial refrigeration and thermal custody.
  - **Stage 05 (8s–10s)**: *Transport & Centered Delivery Arrival* — Transition to the operational machine.

### 2. 🧊 IoT Cold Chain Monitoring (Live ThingSpeak Channel #3474082)
- **Live Physical Sensor Feeds**: Streams real-time temperature (`field1`) and relative humidity (`field2`) from ESP32 + DHT11 nodes.
- **Dynamic Circular SVG Gauges**: Color-coded safety zones (Normal `#166534`, Warning `#b45309`, Critical `#b91c1c`).
- **Configurable Thresholds**: LocalStorage-persisted min/max boundaries for temperature and humidity.
- **Historical Telemetry Chart**: 100-entry continuous historical trend curve with safe range corridors.

### 3. 🚨 Incident Simulator & 2G Feature-Phone Interface
- **Thermal Spike Simulator**: One-click test to spike temperature to 8.4°C, triggering risk detection, automated alert `JRN-2048`, and SMS dispatch.
- **Monochrome LCD Keypad Simulator**: Realistic 2G feature-phone emulator with authentic Web Audio API DTMF dual tones:
  - `Press 1`: Live Status Inquiry (`Inside: 8.4°C`, `Outside: 31.7°C`).
  - `Press 2`: Acknowledge Alert (Transmits ACK packet to central dispatch).
  - `Press 3`: Emergency Dispatch Line.

### 4. 🍃 Crop Doctor — Multimodal AI Disease Diagnostics
- **Powered by Google Gemini 1.5 Flash**: Drag-and-drop crop leaf photos (JPG, PNG, WebP) for instant diagnostic analysis.
- **Structured Pathology Output**:
  - Identified disease name, severity rating, and confidence score.
  - Biological causes & observed symptom breakdown.
  - Action protocol & step-by-step treatment plan.
  - 100% Organic remedies & future prevention strategy.
  - Plain-language farmer summary.
- **Scan History**: Local storage of previous diagnostic runs with image thumbnails.

### 5. 📊 Live Mandi Market Prices (data.gov.in API)
- **Real-Time Government Price Feeds**: Live wholesale rates across 28 Indian States and 30+ commodities (Tomato, Onion, Potato, etc.).
- **Best Price Recommendation**: Automatic recommendation engine highlighting the highest-paying market in the region.
- **Dual Views**: Sortable tabular view + comparative mandi price charts.

### 6. 🚛 Smart Farm-to-Market Route Planner & Weather Advisor
- **Google Maps Directions**: Embedded driving route between farm origin and destination mandi.
- **Dual Weather Telemetry**: Real-time ambient conditions (temperature, humidity, wind speed, precipitation, visibility) from OpenWeatherMap.
- **Agricultural Travel Advisor Algorithm**: Calculates safety score (0–100) with protection tips against thunderstorms, rain, heat, and high winds for perishables.

### 7. 🔌 Embedded Hardware Firmware
- Complete C++ Arduino firmware (`esp32_dht11_thingspeak.ino`) available directly in the dashboard with a 1-click copy button.
- Microcontroller Pinout: ESP32 DevKit V1 with DHT11/DHT22 on GPIO Pin D15.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript, React 19 |
| **Styling** | Tailwind CSS v4, Vanilla CSS Design Tokens |
| **Visuals & Charts** | Recharts (Area/Bar Charts), HTML5 Canvas, SVG Gauges |
| **Animation & Scroll** | GSAP ScrollTrigger, Lenis Smooth Scroll, VSync `requestAnimationFrame` |
| **Audio** | Web Audio API (DTMF Synthesizer & SMS Chimes) |
| **AI Engine** | Google Gemini 1.5 Flash Multimodal API |
| **IoT Cloud** | ThingSpeak REST Feeds API |
| **Government Data** | data.gov.in National Agriculture Market API |
| **Weather & Maps** | OpenWeatherMap API, Google Maps Embed API |
| **Embedded Hardware** | ESP32 Microcontroller, DHT11/DHT22 Sensors, Arduino C++ |

---

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/prudhviraj0310/cold-shield.git
cd cold-shield
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory (or copy from `.env.example`):
```env
# ThingSpeak IoT (Cold Chain Monitoring)
NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID=3474082
NEXT_PUBLIC_THINGSPEAK_READ_API_KEY=DQY5SZKH0RMIEKWA

# Google Gemini (Crop Doctor AI)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Google Maps (Route Planning)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OpenWeatherMap (Weather & Travel Advisor)
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key_here

# data.gov.in (Live Mandi Prices)
NEXT_PUBLIC_DATAGOV_API_KEY=your_datagov_api_key_here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to enter the Cinematic Story, or navigate directly to [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to explore the Operational Machine.

### 5. Build for Production
```bash
npm run build
npm run start
```

---

## ⚡ Hardware Wiring Diagram (ESP32 + DHT11)

```
DHT11 Breakout Module Pin   | ESP32 DevKit Pin
----------------------------|------------------
VCC / (+)                   | 3V3
GND / (-)                   | GND
DATA / (OUT)                | GPIO 15 (D15)
```

The C++ sketch is located at `public/hardware/esp32_dht11_thingspeak.ino`.

---

## 👥 Team: The Chosen One

Built with precision for the Agricultural IoT & Cold-Chain Hackathon.
