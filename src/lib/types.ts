export interface TelemetryPoint {
  time: string;
  timestamp: number;
  internalTemp: number;
  ambientTemp: number;
  humidity: number;
  doorOpen: boolean;
  status: 'safe' | 'warning' | 'critical';
  eventNote?: string;
}

export interface ColdChainBatch {
  id: string;
  commodity: string;
  variety: string;
  origin: string;
  destination: string;
  harvestTime: string;
  crates: number;
  weightKg: number;
  safeMinTemp: number;
  safeMaxTemp: number;
  currentInternalTemp: number;
  currentAmbientTemp: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
  shelfLifeGainDays: number;
  thermalIntegrityScore: number;
  loraSignalDbm: number;
  batteryPercent: number;
  driverName: string;
  farmerName: string;
  farmerPhone: string;
}

export interface AlertLogItem {
  id: string;
  time: string;
  channel: 'SMS' | 'USSD' | 'IVR_VOICE' | 'BLE_MESH';
  recipient: string;
  message: string;
  status: 'DELIVERED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'PENDING';
  severity: 'info' | 'warning' | 'critical';
}

export type PhoneScreenState = 
  | 'STANDBY'
  | 'INCOMING_ALERT'
  | 'DETAILS_VIEW'
  | 'ACKNOWLEDGED'
  | 'USSD_MENU'
  | 'CALL_ACTIVE'
  | 'COMPRESSOR_REBOOT';
