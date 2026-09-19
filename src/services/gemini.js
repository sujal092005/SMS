// Google Gemini AI API Service for RAVS Smart School
// Provides intelligent CBSE & K-12 AI tutoring with step-by-step explanations

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * Ask Google Gemini AI model for academic help, problem solving, or syllabus doubt resolution.
 * @param {string} question - The student's academic question
 * @param {string} customApiKey - Optional user-provided API key from settings
 * @returns {Promise<{title: string, steps: string[], examTip: string, text: string}>}
 */
export async function askGeminiTutor(question, customApiKey = "") {
  const apiKey = (customApiKey && customApiKey.trim().length > 5) 
    ? customApiKey.trim() 
    : GEMINI_API_KEY;

  if (!apiKey) {
    console.info("ℹ️ Gemini API key not found in env. Running in intelligent built-in academic engine mode.");
    return null; // Signals context to use intelligent knowledge base
  }

  const systemInstruction = `You are the RAVS Smart School AI Study Assistant for CBSE secondary students (Grade 5 to 12).
Provide high quality, structured, clear explanations formatted as JSON with the following structure:
{
  "title": "Short title describing the topic",
  "steps": [
    "**1. Concept Overview**: Explain fundamental concept clearly.",
    "**2. Step-by-Step / Formula**: Provide exact formulas, reactions, or steps.",
    "**3. Key Examples / Solution**: Concrete calculation or example.",
    "**4. Summary**: Core takeaway."
  ],
  "examTip": "A high-yield pro exam tip for scoring full marks in board/school exams."
}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `${systemInstruction}\n\nStudent Question: "${question}"\n\nReturn strictly valid JSON only.`
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1000
    }
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.warn("Gemini API returned error status:", response.status, errData);
      return null;
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) return null;

    // Parse JSON safely
    const cleanJson = candidateText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      title: parsed.title || `Guide: ${question}`,
      steps: Array.isArray(parsed.steps) ? parsed.steps : [parsed.steps || candidateText],
      examTip: parsed.examTip || "Practice writing structured point-wise answers for full marks in exams.",
      text: `Here is your structured AI breakdown for: **${question}**`
    };
  } catch (err) {
    console.warn("Gemini API request failed or invalid JSON returned, falling back to local engine:", err.message);
    return null;
  }
}
