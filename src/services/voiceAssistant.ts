// 🎙️ Multilingual Farmer Voice Assistant & Telephony Dispatch Engine
// Designed for illiterate and regional farmers who communicate via voice calls (Telugu, Hindi, English)

export interface FarmerVoiceScript {
  telugu: string;
  hindi: string;
  english: string;
}

export type VoiceLanguage = 'te' | 'hi' | 'en';

export const CALL_SCENARIOS = {
  TRANSIT_SAFE: {
    title: 'Safe Transit & Temperature Check',
    script: {
      telugu:
        'నమస్కారం రైతు సోదరుడా! మీ టమాటా లోడ్ ప్రస్తుతం కర్నూలు జాతీయ రహదారి వద్ద ఉంది. లోపల ఉష్ణోగ్రత నాలుగు పాయింట్ రెండు డిగ్రీలు చాలా అనుకూలంగా ఉంది. మీ సరుకు సాయంత్రం నాలుగు గంటలకు సురక్షితంగా మార్కెట్‌కు చేరుకుంటుంది, మీరు ఎటువంటి ఆందోళన చెందవద్దు!',
      hindi:
        'नमस्ते किसान भाई! आपका टमाटर का ट्रक अभी कर्नूल हाईवे पर है। अंदर का तापमान 4.2 डिग्री बहुत सुरक्षित है। आपका माल शाम 4 बजे तक मंडी पहुंच जाएगा, बिल्कुल चिंता न करें!',
      english:
        'Hello respected farmer! Your tomato shipment is currently on the Kurnool Highway. The internal temperature is 4.2 degrees Celsius, perfectly safe. It will reach the mandi safely by 4:00 PM today. No need to worry!',
    },
  },
  TEMP_SPIKE_ALERT: {
    title: 'Temperature Spike & Reefer Warning',
    script: {
      telugu:
        'అత్యవసర హెచ్చరిక! మీ వాహనం లోపల ఉష్ణోగ్రత ఎనిమిది పాయింట్ నాలుగు డిగ్రీలకు పెరిగింది. మేము డ్రైవర్‌ను వెంటనే రిఫ్రిజిరేషన్ పెంచమని ఆదేశించాము. మీ పంట పాడవకుండా మేము నిరంతరం పర్యవేక్షిస్తున్నాము.',
      hindi:
        'सावधान! आपके ट्रक का तापमान 8.4 डिग्री तक बढ़ गया है। हमने ड्राइवर को तुरंत कूलिंग तेज करने का निर्देश दिया है। हम लगातार नजर रखे हुए हैं।',
      english:
        'Urgent Warning! The inside temperature has risen to 8.4 degrees Celsius. We have dispatched an automated instruction to the driver to boost cooling immediately. We are actively protecting your produce.',
    },
  },
  CROP_DISEASE_DIAGNOSIS: {
    title: 'Leaf Damage & Treatment Prescription',
    script: {
      telugu:
        'రైతు సోదరుడా, మీ ఆకు ఫోటోను పరిశీలించాము. ముప్పై ఐదు శాతం ఆకు మాత్రమే దెబ్బతిన్నది. వెంటనే వేపనూనె లేదా కాపర్ ఆక్సిక్లోరైడ్ పిచికారీ చేయండి, మీ పంటను వంద శాతం కాపాడుకోవచ్చు!',
      hindi:
        'किसान भाई, आपकी पत्ती की जांच हो गई है। सिर्फ 35 प्रतिशत पत्ती प्रभावित है। तुरंत नीम का तेल छिड़कें, आपकी फसल पूरी तरह बच जाएगी!',
      english:
        'Respected farmer, your leaf photo has been analyzed. 35 percent of the leaf surface is affected. Spray neem oil or copper oxychloride immediately to save 100 percent of your crop yield!',
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

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  
  if (lang === 'te') {
    utterance.lang = 'te-IN';
  } else if (lang === 'hi') {
    utterance.lang = 'hi-IN';
  } else {
    utterance.lang = 'en-IN';
  }

  utterance.rate = 0.92; // Slightly slower for clear rural understanding
  utterance.pitch = 1.0;

  // Try to find a regional voice if available in OS
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find((v) =>
    lang === 'te'
      ? v.lang.includes('te')
      : lang === 'hi'
      ? v.lang.includes('hi')
      : v.lang.includes('en-IN') || v.lang.includes('en')
  );

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

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
