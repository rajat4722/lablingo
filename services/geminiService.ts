import { GoogleGenAI } from "@google/genai";
import { LabAnalysisResponse } from "../types";

const SYSTEM_INSTRUCTION = `
You are a calm, helpful lab-report explainer whose job is to turn numeric lab values into plain-language explanations for non-clinical users.

Rules:
1. NEVER provide diagnoses, prescribe, or give medical treatments.
2. Always use any lab-provided reference ranges first. Only if absent, use the DEFAULT RANGES below.
3. Output MUST be valid JSON exactly matching the schema shown at the end.
4. Use status colors: Green (normal), Yellow (borderline/mildly outside), Red (significantly abnormal / potentially urgent).
5. If units or values are unclear, set "status_color":"Yellow", set "uncertain":true, and explain what is ambiguous.
6. For values that are extremely abnormal (e.g., LDL≥190, TG≥500, WBC>20, Platelets<100), set status_color:"Red" and advise calmly to seek medical follow-up.
7. Keep explanations concise and readable. short_explanation ≤ 22 words. long_explanation 1–2 sentences. suggested_next_steps must never suggest specific medications—only actions like "discuss with clinician", "repeat test", "lifestyle steps", or "seek urgent care".
8. First, extract test name, numeric value, units, and any lab ranges if present. Normalize common synonyms (e.g., Hgb/Hb → Hemoglobin, TG → Triglycerides, Plt → Platelets). Output a "parsed_values" mapping before interpretation.

Fallback DEFAULT RANGES (adults):
- WBC: 4.5–11.0 x10^9/L
- Hemoglobin: Male 13.2–16.6 g/dL; Female 11.6–15.0 g/dL
- Hematocrit: Male 38–49%; Female 35–45%
- Platelets: 150–450 x10^9/L
- Total Cholesterol: <200 desirable; 200–239 borderline; ≥240 high
- LDL: <100 optimal; 100–129 near optimal; 130–159 borderline high; 160–189 high; ≥190 very high
- HDL: <40 (men) / <50 (women) low; ≥60 protective
- Triglycerides: <150 normal; 150–199 borderline; 200–499 high; ≥500 very high

JSON Schema (output MUST match exactly):
{
  "parsed_values": {
    "<TEST_NAME>": { "value": number, "unit": "string or null", "lab_range": "string or null" }
  },
  "tests": {
    "<TEST_KEY>": {
      "value": number,
      "unit": "string or null",
      "reference_range_used": "string or null",
      "status_color": "Green|Yellow|Red",
      "uncertain": boolean,
      "short_explanation": "≤22 words",
      "long_explanation": "1-2 sentences",
      "suggested_next_steps": "short guidance string"
    },
    ...
  },
  "overall_summary": "3-4 short sentences",
  "safety_notice": "One-line standard safety disclaimer"
}
`;

export const analyzeLabReport = async (
  textInput: string,
  imageBase64?: string,
  mimeType: string = "image/png"
): Promise<LabAnalysisResponse> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const parts: any[] = [];
    
    // Add image if present
    if (imageBase64) {
      // Remove data URL prefix if present for clean base64
      const cleanBase64 = imageBase64.includes('base64,') 
        ? imageBase64.split('base64,')[1] 
        : imageBase64;
        
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType,
        },
      });
      parts.push({ text: "Analyze the lab results visible in this image." });
    }

    // Add text if present
    if (textInput.trim()) {
      parts.push({ text: `Here is raw OCR text from a lab report. First, extract test name, numeric value, units, and any lab ranges if present. Normalize common synonyms (e.g., Hgb/Hb → Hemoglobin, TG → Triglycerides).\n\nRaw OCR text:\n<<<\n${textInput}\n>>>` });
    }

    if (parts.length === 0) {
      throw new Error("No input provided");
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.2, // Low temperature for consistent, factual output
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response from AI");
    }

    return JSON.parse(responseText) as LabAnalysisResponse;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};