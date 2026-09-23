// AI Academic Study Assistant Service for RAVS Smart School
// Powered by Multi-Engine LLM architecture (Free Fast LLM + Google Gemini + Offline Smart Syllabus)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * Intelligent Offline Tutor Fallback (for zero-connectivity offline usage)
 */
function generateOfflineResponse(question) {
  const qLower = (question || '').toLowerCase();
  let overview = `Here is the step-by-step academic breakdown for: "${question}".`;
  let steps = [
    `1. Concept Definition: "${question}" is an essential concept in your syllabus. Focus on fundamental principles, definitions, and equations.`,
    `2. Logical Steps: Break complex questions into sub-parts, write standard formulas clearly, and verify units or historical dates.`,
    `3. Exam Strategy: Draw neat, labeled diagrams and write bulleted points with underlined keywords to score maximum marks.`
  ];
  let tip = "State Board Exam Tip: Always highlight key scientific terms, define units (SI units), and show calculation steps clearly.";

  if (qLower.includes('photosynthesis')) {
    overview = "Photosynthesis (प्रकाशसंश्लेषण) is the biological process where green plants convert sunlight into chemical energy stored as glucose.";
    steps = [
      "1. Chemical Equation: 6CO₂ + 6H₂O + Sunlight (Chlorophyll) → C₆H₁₂O₆ + 6O₂.",
      "2. Light Phase: Chlorophyll in thylakoids traps sunlight and splits water into Hydrogen and Oxygen.",
      "3. Dark Phase (Calvin Cycle): CO₂ is fixed into Glucose (C₆H₁₂O₆) in the stroma."
    ];
    tip = "Board Exam Tip: Draw the chloroplast diagram, label Stroma and Thylakoid, and write the balanced chemical reaction.";
  } else if (qLower.includes('quadratic') || qLower.includes('equation')) {
    overview = "A Quadratic Equation (वर्गसमीकरण) is a 2nd-degree polynomial equation: ax² + bx + c = 0 (where a ≠ 0).";
    steps = [
      "1. Quadratic Formula: x = [-b ± √(b² - 4ac)] / (2a).",
      "2. Discriminant (Δ = b² - 4ac): Δ > 0 (two real roots), Δ = 0 (equal roots), Δ < 0 (no real roots).",
      "3. Factoring Method: Split middle term 'bx' into factors whose product is 'a × c'."
    ];
    tip = "Board Exam Tip: List values of a, b, c first, calculate the discriminant Δ, then substitute into the formula.";
  } else if (qLower.includes('newton') || qLower.includes('motion') || qLower.includes('force')) {
    overview = "Newton's Laws of Motion (न्यूटनचे गतीचे नियम) govern the relationship between physical forces and body acceleration.";
    steps = [
      "1. First Law (Inertia): An object remains at rest or in uniform motion unless acted upon by an external net force.",
      "2. Second Law (F = ma): Rate of change of momentum is proportional to applied force. Force = mass × acceleration (Unit: Newton).",
      "3. Third Law: To every action force, there is an equal and opposite reaction force."
    ];
    tip = "Board Exam Tip: Always write SI units (N for Force, m/s² for Acceleration) and mention practical examples like rocket propulsion.";
  } else if (qLower.includes('gravity') || qLower.includes('gravitation')) {
    overview = "Gravitation (गुरुत्वाकर्षण) is the universal attractive force between any two masses in the cosmos.";
    steps = [
      "1. Universal Law: F = G × (m₁ × m₂) / r² (where G = 6.67 × 10⁻¹¹ N·m²/kg²).",
      "2. Acceleration due to gravity: g = GM / R² ≈ 9.8 m/s² on Earth's surface.",
      "3. Difference between Mass and Weight: Mass is scalar (kg, constant everywhere), Weight is force (W = mg, in Newtons, varies with gravity)."
    ];
    tip = "Board Exam Tip: Differentiate Mass vs Weight in tabular format with SI units for guaranteed full marks.";
  }

  const rawText = `${overview}\n\n${steps.join('\n')}\n\nExam Tip: ${tip}`;
  return {
    title: `Academic Guide: ${question.slice(0, 45)}${question.length > 45 ? '...' : ''}`,
    steps,
    examTip: tip,
    text: rawText,
    modelUsed: 'offline-smart-tutor',
    isGeminiLive: false
  };
}

/**
 * Ask Free Public LLM Endpoint (Pollinations AI with OpenAI / Llama-3 / Mistral)
 * 100% Free, No API Key Required, Fast and High Quality
 */
async function askFreePublicLLM(question) {
  const systemPrompt = `You are the expert RAVS Smart School AI Study Assistant for school students (Grades 5th to 12th, Semi-English Medium / Maharashtra State Board & CBSE).
Explain concepts simply and clearly. Where helpful, include Marathi or Hindi terms in brackets.
Format your answer with clear markdown headings:
- **💡 Concept Overview**
- **📝 Step-by-Step Explanation & Key Formulas**
- **🌍 Real-World Example**
- **🎯 Board Exam Tip** (how to write in exam, key keywords, diagrams to draw).`;

  const payload = {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ],
    model: "openai",
    seed: 42
  };

  const response = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Public LLM responded with status ${response.status}`);
  }

  const rawText = await response.text();
  if (!rawText || rawText.trim().length < 10) {
    throw new Error("Empty response from Public LLM");
  }

  const cleanText = rawText.trim();
  const paragraphs = cleanText.split('\n\n').filter(p => p.trim().length > 0);

  let examTip = "";
  const tipIdx = paragraphs.findIndex(p => 
    p.toLowerCase().includes('board exam tip') || 
    p.toLowerCase().includes('exam tip') || 
    p.toLowerCase().includes('🎯')
  );
  if (tipIdx !== -1) {
    examTip = paragraphs[tipIdx].replace(/[*#]/g, '').trim();
  }

  return {
    title: `AI Study Guide: ${question.slice(0, 40)}${question.length > 40 ? '...' : ''}`,
    steps: paragraphs.length > 1 ? paragraphs : [cleanText],
    examTip: examTip || "Board Exam Tip: Highlight scientific definitions, state SI units, and underline key formulas.",
    text: cleanText,
    modelUsed: 'Free Public AI (Llama 3.3 / GPT)',
    isGeminiLive: true
  };
}

/**
 * Ask Google Gemini API (if valid key is provided)
 */
async function askGeminiOfficial(question, apiKey) {
  const prompt = `You are the expert RAVS Smart School AI Study Assistant for school students (Grades 5th to 12th, Semi-English Medium, State Board / CBSE).
Student Question: "${question}"
Provide a structured, crystal-clear explanation:
1. Concept Overview (simple English with Marathi/Hindi terms in brackets where helpful)
2. Step-by-step breakdown or formulas
3. Real-world example
4. Board Exam Tip for high marks.`;

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
        title: `Gemini Study Guide: ${question.slice(0, 40)}${question.length > 40 ? '...' : ''}`,
        steps: lines.length > 1 ? lines : [rawText],
        examTip: examTip || "State Board Exam Tip: Write clear steps, define scientific terms, and draw neat diagrams.",
        text: rawText,
        modelUsed: `Google ${model}`,
        isGeminiLive: true
      };
    } catch {
      // Continue to next model
    }
  }

  throw new Error("Gemini API key rejected or models unavailable");
}

/**
 * Universal Ask AI Tutor entry point
 * 1. Checks Free Public LLM (Always available, 0 config)
 * 2. Checks Google Gemini (if user provided API key)
 * 3. Graceful fallback to Offline Smart Syllabus Engine
 */
export async function askGeminiTutor(question, customApiKey = "") {
  const cleanQ = (question || '').trim();
  if (!cleanQ) {
    return generateOfflineResponse("General Doubt");
  }

  // 1. Try Free Public LLM first for instant zero-config response
  try {
    const publicResult = await askFreePublicLLM(cleanQ);
    if (publicResult && publicResult.text) {
      return publicResult;
    }
  } catch (pubErr) {
    console.warn('Public LLM attempt notice:', pubErr.message);
  }

  // 2. Try Google Gemini API if a valid key exists (starts with AIza...)
  const apiKey = (customApiKey && customApiKey.trim().length > 10) 
    ? customApiKey.trim() 
    : (GEMINI_API_KEY.startsWith('AIza') ? GEMINI_API_KEY : '');

  if (apiKey) {
    try {
      const geminiResult = await askGeminiOfficial(cleanQ, apiKey);
      if (geminiResult && geminiResult.text) {
        return geminiResult;
      }
    } catch (gemErr) {
      console.warn('Gemini API attempt notice:', gemErr.message);
    }
  }

  // 3. Fallback to smart offline tutor
  return generateOfflineResponse(cleanQ);
}
