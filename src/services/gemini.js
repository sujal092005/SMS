// Google Gemini AI API Service for RAVS Smart School
// Connected to Gemini Flash models for instant academic responses (Semi-English medium syllabus)

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
    console.info("ℹ️ Gemini API key not found in env.");
    return null;
  }

  const prompt = `You are the expert RAVS Smart School AI Study Assistant for Semi-English Medium school students (Maharashtra State Board, Grades 5th to 12th).
In Semi-English Medium schools, Science and Mathematics are taught in English, while other subjects and explanations often bridge English, Marathi, and Hindi.
Student Question: "${question}"

Provide a structured, crystal-clear, and encouraging explanation suitable for a semi-English student.
Format your answer with:
1. Concept Overview (explain in simple English, mentioning Marathi / Hindi terminology in brackets where helpful)
2. Step-by-step explanation or formula derivation
3. Real-world example or daily-life application
4. A pro Board Exam Tip for scoring high marks.`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1200
    }
  };

  const modelsToTry = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
  ];

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) continue;

      // Split into paragraphs or steps for rich card UI
      const lines = rawText.split('\n\n').filter(p => p.trim().length > 0);

      let examTip = "";
      const tipIndex = lines.findIndex(l => l.toLowerCase().includes('exam tip') || l.toLowerCase().includes('board exam'));
      if (tipIndex !== -1) {
        examTip = lines[tipIndex].replace(/[*#]/g, '').trim();
        lines.splice(tipIndex, 1);
      }

      return {
        title: `Semi-English Study Guide: ${question.slice(0, 45)}${question.length > 45 ? '...' : ''}`,
        steps: lines.length > 1 ? lines : [rawText],
        examTip: examTip || "State Board Exam Tip: Write clear steps, define scientific terms, and draw neat diagrams.",
        text: rawText,
        modelUsed: model
      };
    } catch (err) {
      console.warn(`Failed model ${model}:`, err.message);
    }
  }

  return null;
}
