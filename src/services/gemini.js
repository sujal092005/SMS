// Google Gemini AI API Service for RAVS Smart School
// Connected to Gemini Flash models for instant academic responses (Semi-English medium syllabus)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * Ask Google Gemini AI model for academic help, problem solving, or syllabus doubt resolution.
 * @param {string} question - The student's academic question
 * @param {string} customApiKey - Optional user-provided API key from settings
 * @returns {Promise<{title: string, steps: string[], examTip: string, text: string}>}
 */
function generateFallbackResponse(question) {
  const qLower = question.toLowerCase();
  let overview = `Here is the step-by-step academic explanation for: "${question}".`;
  let steps = [
    `1. Concept Definition: "${question}" is a key topic in your State Board / Semi-English Medium syllabus.`,
    `2. Key Principle: Understand the underlying definitions, formulas, or historical context. Break complex problems into smaller logical steps.`,
    `3. Daily Practice: Review textbook exercises, draw neat diagrams, and verify all numerical units before writing final answers.`
  ];
  let tip = "Board Exam Tip: Always highlight key terms, write step-by-step solutions, and state units or labeled diagrams clearly for full marks.";

  if (qLower.includes('photosynthesis')) {
    overview = "Photosynthesis (प्रकाशसंश्लेषण) is the process by which green plants convert light energy into chemical energy stored in glucose.";
    steps = [
      "1. Balanced Chemical Equation: 6CO₂ + 6H₂O + Sunlight → C₆H₁₂O₆ + 6O₂ (in presence of Chlorophyll).",
      "2. Light Reactions: Sunlight is absorbed by Chlorophyll in the thylakoids, splitting H₂O into Hydrogen and Oxygen.",
      "3. Dark Reactions (Calvin Cycle): CO₂ is converted into Glucose (C₆H₁₂O₆) in the chloroplast stroma."
    ];
    tip = "Board Exam Tip: Draw the chloroplast diagram, label Stroma and Thylakoid, and write the balanced equation to score maximum marks.";
  } else if (qLower.includes('quadratic') || qLower.includes('equation')) {
    overview = "A Quadratic Equation (वर्गसमीकरण) is a second-degree equation of the form ax² + bx + c = 0 (where a ≠ 0).";
    steps = [
      "1. Quadratic Formula: x = [-b ± √(b² - 4ac)] / (2a).",
      "2. Discriminant (Δ = b² - 4ac): Δ > 0 (two distinct real roots), Δ = 0 (equal roots), Δ < 0 (no real roots).",
      "3. Factoring Method: Split the middle term 'bx' into two factors whose product equals 'a × c'."
    ];
    tip = "Board Exam Tip: Write values of a, b, c clearly at the beginning and show substitution steps explicitly.";
  } else if (qLower.includes('newton')) {
    overview = "Newton's Laws of Motion (न्यूटनचे गतीचे नियम) explain how forces cause acceleration in physical objects.";
    steps = [
      "1. First Law (Inertia): An object remains at rest or in uniform motion unless acted upon by an external net force.",
      "2. Second Law (F = ma): Force equals mass times acceleration. Unit of force is Newton (N).",
      "3. Third Law (Action & Reaction): To every action force, there is an equal and opposite reaction force."
    ];
    tip = "Board Exam Tip: Always state SI units (Force in Newtons, Acceleration in m/s²) and provide a real-world example like rocket propulsion.";
  }

  const rawText = `${overview}\n\n${steps.join('\n')}\n\nExam Tip: ${tip}`;

  return {
    title: `Semi-English Study Guide: ${question.slice(0, 45)}${question.length > 45 ? '...' : ''}`,
    steps,
    examTip: tip,
    text: rawText,
    modelUsed: 'offline-smart-tutor'
  };
}

/**
 * Ask Google Gemini AI model for academic help, problem solving, or syllabus doubt resolution.
 * @param {string} question - The student's academic question
 * @param {string} customApiKey - Optional user-provided API key from settings
 * @returns {Promise<{title: string, steps: string[], examTip: string, text: string, modelUsed: string}>}
 */
export async function askGeminiTutor(question, customApiKey = "") {
  const apiKey = (customApiKey && customApiKey.trim().length > 5) 
    ? customApiKey.trim() 
    : GEMINI_API_KEY;

  if (apiKey && apiKey.startsWith("AIzaSy")) {
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
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1200 }
    };

    const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
          }
        );

        if (!response.ok) continue;

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) continue;

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
  }

  // Fallback to high quality offline study tutor if API key is invalid/missing/offline
  return generateFallbackResponse(question);
}

