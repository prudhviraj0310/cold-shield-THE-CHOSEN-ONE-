// 🎙️ Multilingual Farmer Voice Assistant & Telephony Dispatch Engine
// Reflects Autonomous Edge AI Cooling & Direct Real-Time Telephony

export interface FarmerVoiceScript {
  telugu: string;
  hindi: string;
  english: string;
}

export type VoiceLanguage = 'te' | 'hi' | 'en';

export const CALL_SCENARIOS = {
  TRANSIT_SAFE: {
    title: 'Routine Transit & Temperature Status',
    script: {
      telugu:
        'నమస్కారం రైతు సోదరుడా! మీ టమాటా లోడ్ ప్రస్తుతం కర్నూలు హైవే వద్ద ప్రయాణిస్తోంది. లోపల ఉష్ణోగ్రత 4.2 డిగ్రీలు చాలా క్షేమంగా ఉంది. మన ఇంటెలిజెంట్ AI సిస్టమ్ నిరంతరం కూలింగ్‌ను సరిచేస్తూ మీ పంటను కాపాడుతోంది. సరుకు సాయంత్రం 4 గంటలకు సురక్షితంగా మార్కెట్‌కు చేరుకుంటుంది, మీరు ఎటువంటి ఆందోళన చెందవద్దు!',
      hindi:
        'नमस्ते किसान भाई! आपका टमाटर का लोड अभी कर्नूल हाईवे पर है। अंदर का तापमान 4.2 डिग्री बिल्कुल सही है। रास्पबेरी पाई AI सिस्टम खुद ब खुद तापमान नियंत्रित कर रहा है। माल शाम 4 बजे सुरक्षित पहुंचेगा, बिल्कुल निश्चिंत रहें!',
      english:
        'Hello respected farmer! Your produce shipment is on Kurnool Highway. Internal temperature is 4.2 degrees Celsius, completely safe. The onboard AI system automatically regulates refrigeration. Arrival is on schedule at 4:00 PM today.',
    },
  },
  TEMP_SPIKE_AUTONOMOUS_FIX: {
    title: 'Thermal Spike — AI Automatic Cooling Engaged',
    script: {
      telugu:
        'రైతు సోదరుడా గమనించండి! వాహనం లోపల ఎండ వేడికి ఉష్ణోగ్రత పెరిగిన వెంటనే, మన రాస్ప్‌బెర్రీ పై AI సిస్టమ్ ఆటోమేటిక్‌గా రిఫ్రిజిరేషన్ కూలింగ్‌ను పెంచి ఉష్ణోగ్రతను 4.2 డిగ్రీలకు స్థిరీకరించింది. మీ పంట ఎటువంటి నష్టం లేకుండా నూరు శాతం తాజాగా ఉంది!',
      hindi:
        'किसान भाई ध्यान दें! गर्मी से तापमान बढ़ते ही AI सिस्टम ने खुद ब खुद कूलिंग बढ़ाकर तापमान को 4.2 डिग्री पर सुरक्षित कर दिया है। आपकी फसल 100 प्रतिशत सुरक्षित और ताज़ा है!',
      english:
        'Notice to farmer! As ambient heat rose, the onboard AI automatically engaged boosted compressor cooling, restoring temperature to 4.2 degrees Celsius. Produce freshness is 100 percent preserved.',
    },
  },
  CROP_DIAGNOSIS_ADVICE: {
    title: 'Leaf Pathology Prescription',
    script: {
      telugu:
        'రైతు సోదరుడా, మీ ఆకు ఫోటోను పరిశీలించాము. 35 శాతం ఆకు మాత్రమే దెబ్బతిన్నది. వెంటనే వేపనూనె పిచికారీ చేయండి, మీ పంటను వంద శాతం కాపాడుకోవచ్చు!',
      hindi:
        'किसान भाई, आपकी पत्ती की जांच पूरी हुई। 35 प्रतिशत पत्ती प्रभावित है। तुरंत नीम तेल का छिड़काव करें, फसल पूरी तरह बच जाएगी!',
      english:
        'Respected farmer, analysis complete. 35 percent leaf surface affected. Apply neem oil spray immediately to protect 100 percent of your crop yield.',
    },
  },
};

/**
 * Speaks text using Web Speech API with language detection
 */
export function speakFarmerAudio(
  text: string,
  lang: VoiceLanguage = 'te',
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis not supported in this browser environment.');
    if (onEnd) onEnd();
    return null;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  if (lang === 'te') utterance.lang = 'te-IN';
  else if (lang === 'hi') utterance.lang = 'hi-IN';
  else utterance.lang = 'en-IN';

  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) =>
    lang === 'te'
      ? v.lang.includes('te')
      : lang === 'hi'
      ? v.lang.includes('hi')
      : v.lang.includes('en-IN') || v.lang.includes('en')
  );

  if (matchedVoice) utterance.voice = matchedVoice;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopFarmerAudio() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
