import { API_CONFIG } from '@/config/api';

export interface DiagnosisData {
  disease_name: string;
  confidence: string;
  severity: string;
  crop_type: string;
  symptoms: string[];
  causes: string;
  treatment: string[];
  organic_remedies: string[];
  prevention: string[];
  recommended_pesticides: string[];
  summary: string;
}

export interface ScanRecord {
  id: number;
  date: string;
  time: string;
  image: string;
  disease: string;
  severity: string;
  crop: string;
}

/**
 * Diagnoses a crop disease from a base64 encoded image using Google Gemini Multimodal API
 */
export async function diagnoseCropImage(
  base64Image: string,
  mimeType: string = 'image/jpeg'
): Promise<DiagnosisData> {
  const prompt = `You are an expert agricultural plant pathologist and agronomist. Analyze this leaf/plant image carefully.

Respond ONLY in this exact JSON format (no markdown, no code fences):
{
  "disease_name": "Name of the disease or 'Healthy' if no disease",
  "confidence": "High/Medium/Low",
  "severity": "Mild/Moderate/Severe or N/A if healthy",
  "crop_type": "Identified crop/plant type",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "causes": "Brief explanation of what causes this disease",
  "treatment": [
    "Treatment step 1",
    "Treatment step 2",
    "Treatment step 3"
  ],
  "organic_remedies": [
    "Natural/organic remedy 1",
    "Natural/organic remedy 2"
  ],
  "prevention": [
    "Prevention tip 1",
    "Prevention tip 2"
  ],
  "recommended_pesticides": ["Pesticide name 1", "Pesticide name 2"],
  "summary": "2-3 sentence summary for the farmer in simple language"
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

  // Parse JSON response safely
  let jsonStr = text.trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  const result: DiagnosisData = JSON.parse(jsonStr);
  return result;
}
