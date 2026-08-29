import { API_CONFIG } from '@/config/api';

export interface DiagnosisData {
  disease_name: string;
  confidence: string;
  severity: 'Mild' | 'Moderate' | 'Severe' | 'Healthy';
  crop_type: string;
  leaf_damage_percentage: number; // e.g. 35% leaf destroyed
  healthy_tissue_percentage: number; // e.g. 65% intact
  can_be_saved: boolean;
  yield_impact_forecast: string;
  symptoms: string[];
  causes: string;
  treatment: string[];
  organic_remedies: string[];
  prevention: string[];
  recommended_pesticides: string[];
  summary: string;
  farmer_voice_telugu: string;
  farmer_voice_hindi: string;
  farmer_voice_english: string;
}

export interface ScanRecord {
  id: number;
  date: string;
  time: string;
  image: string;
  disease: string;
  severity: string;
  crop: string;
  leaf_damage_percentage: number;
}

/**
 * Diagnoses a crop disease from a 3MP camera / base64 image using Google Gemini Multimodal API
 * Calculates exact percentage of leaf destroyed and actionable farmer voice advice.
 */
export async function diagnoseCropImage(
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<DiagnosisData> {
  const prompt = `You are an expert agricultural plant pathologist, agronomist, and farmer advisor. 
Analyze this plant/leaf photo captured by an IoT camera (ESP32-CAM / Raspberry Pi).

Measure the exact visual surface damage percentage of the leaf/crop.

Respond ONLY in this exact JSON format (no markdown, no code fences):
{
  "disease_name": "Name of the disease or 'Healthy Crop'",
  "confidence": "High/Medium/Low",
  "severity": "Mild/Moderate/Severe",
  "crop_type": "Identified crop/plant type",
  "leaf_damage_percentage": 35,
  "healthy_tissue_percentage": 65,
  "can_be_saved": true,
  "yield_impact_forecast": "Expected 10-15% yield reduction if untreated within 3 days",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "causes": "Brief scientific and environmental cause",
  "treatment": [
    "Treatment step 1",
    "Treatment step 2",
    "Treatment step 3"
  ],
  "organic_remedies": [
    "Neem oil / natural remedy 1",
    "Organic remedy 2"
  ],
  "prevention": [
    "Preventative soil / water tip 1",
    "Preventative tip 2"
  ],
  "recommended_pesticides": ["Pesticide name and dilution dosage"],
  "summary": "Simple 2-sentence summary for the farmer.",
  "farmer_voice_telugu": "రైతుకు తెలుగులో సులభమైన మాటలలో సలహా (ఉదాహరణకు: మీ పంటకు ఆకుమచ్చ తెగులు సోకింది, 35 శాతం ఆకు దెబ్బతిన్నది. వేపనూనె పిచికారీ చేయండి, పంటను కాపాడుకోవచ్చు)",
  "farmer_voice_hindi": "किसान के लिए सरल हिंदी में संदेश",
  "farmer_voice_english": "Simple spoken English voice update for the farmer."
}`;

  const cleanBase64 = base64Image.includes('base64,')
    ? base64Image.split('base64,')[1]
    : base64Image;

  const response = await fetch(API_CONFIG.gemini.baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: cleanBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gemini API returned error ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No diagnostic content returned from AI model.');
  }

  let jsonStr = text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  const result: DiagnosisData = JSON.parse(jsonStr);
  return result;
}
