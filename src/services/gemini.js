// AI Academic Study Assistant Service for RAVS Smart School
// Powered by Multi-Engine LLM Architecture:
// 1. Free Fast Public AI Engine (GPT / Llama 3.3 / Mistral - No Key Required)
// 2. Google Gemini API (if user enters a key)
// 3. Offline Smart Knowledge Engine

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * Intelligent Offline Tutor Fallback (for zero-connectivity offline usage)
 */
function generateOfflineResponse(question) {
  const qLower = (question || '').toLowerCase();
  let overview = `Here is the comprehensive explanation for: "${question}".`;
  let steps = [
    `1. Definition & Core Concept: "${question}" is an important topic. Focus on its key principles, real-world utility, and structured explanation.`,
    `2. Key Components: Break down the concept into major parts, functions, and standard formulas or terminology.`,
    `3. Exam Strategy: Write clear bullet points, underline key terminology, and provide practical examples for maximum marks.`
  ];
  let tip = "Academic Exam Tip: Always define fundamental terms clearly, provide examples, and draw neat diagrams where applicable.";

  if (qLower.includes('google')) {
    overview = "Google is the world's leading technology company and internet search engine founded in 1998 by Larry Page and Sergey Brin.";
    steps = [
      "1. Search Engine: Google indexes billions of web pages using web crawlers (Googlebot) and PageRank algorithms to deliver instant, relevant search results.",
      "2. Core Ecosystem: Includes Android OS, Chrome browser, YouTube, Google Maps, Gmail, Google Drive, and Cloud Services.",
      "3. Technology & AI: Google develops advanced Artificial Intelligence (Gemini, DeepMind, Tensor Processing Units) and quantum computing technologies."
    ];
    tip = "Computer Science Tip: For tech questions, mention the founding year, primary purpose (indexing & information retrieval), and key services.";
  } else if (qLower.includes('photosynthesis')) {
    overview = "Photosynthesis (प्रकाशसंश्लेषण) is the biological process where green plants convert sunlight, carbon dioxide, and water into chemical energy (glucose) and oxygen.";
    steps = [
      "1. Balanced Chemical Reaction: 6CO₂ + 6H₂O + Sunlight (in Chlorophyll) → C₆H₁₂O₆ + 6O₂.",
      "2. Light Reactions: Sunlight is absorbed in the thylakoid membranes, photolyzing H₂O and generating ATP and NADPH.",
      "3. Dark Reactions (Calvin Cycle): CO₂ is fixed into Glucose in the chloroplast stroma."
    ];
    tip = "Board Exam Tip: Draw the chloroplast diagram, label Stroma and Thylakoid, and write the balanced chemical equation.";
  } else if (qLower.includes('quadratic') || qLower.includes('equation')) {
    overview = "A Quadratic Equation (वर्गसमीकरण) is a second-degree polynomial equation in standard form: ax² + bx + c = 0 (where a ≠ 0).";
    steps = [
      "1. Quadratic Formula: x = [-b ± √(b² - 4ac)] / (2a).",
      "2. Discriminant (Δ = b² - 4ac): If Δ > 0 (two distinct real roots), Δ = 0 (equal roots), Δ < 0 (complex roots).",
      "3. Factorisation: Split the middle term 'bx' into two factors that multiply to give 'a × c'."
    ];
    tip = "Board Exam Tip: Explicitly state a, b, c values, compute the discriminant Δ first, then substitute into the formula.";
  } else if (qLower.includes('newton') || qLower.includes('motion') || qLower.includes('force')) {
    overview = "Newton's Laws of Motion (न्यूटनचे नियम) describe the relationship between physical forces acting on a body and its motion.";
    steps = [
      "1. First Law (Inertia): An object remains at rest or in uniform motion unless acted upon by a net external force.",
      "2. Second Law (F = ma): The acceleration of an object is directly proportional to net force and inversely proportional to mass (Unit: Newton, N).",
      "3. Third Law: Every action force has an equal and opposite reaction force."
    ];
    tip = "Board Exam Tip: Always state SI units (Force in Newtons, Acceleration in m/s²) and provide everyday examples.";
  }

  const rawText = `${overview}\n\n${steps.join('\n')}\n\nExam Tip: ${tip}`;
  return {
    title: `Academic Guide: ${question.slice(0, 45)}${question.length > 45 ? '...' : ''}`,
    steps,
    examTip: tip,
    text: rawText,
    modelUsed: 'Smart Syllabus Knowledge Base',
    isGeminiLive: true
  };
}

/**
 * Ask Free Fast Public LLM Engine via CORS-friendly GET endpoints
 * Supports OpenAI GPT, Llama 3.3, and Mistral models with zero API key requirement
 */
async function askFreePublicLLM(question) {
  const systemPrompt = `You are the expert RAVS Smart School AI Study Assistant for school students (Grades 5-12, State Board & CBSE).
Explain concepts simply, accurately, and thoroughly.
Structure your answer clearly with:
- Summary Overview
- Step-by-step points or key details
- Real-world application
- Exam Tip for scoring high marks.`;

  const endpoints = [
    // 1. GET with OpenAI model
    `https://text.pollinations.ai/${encodeURIComponent(question)}?model=openai&system=${encodeURIComponent(systemPrompt)}`,
    // 2. GET with Mistral model
    `https://text.pollinations.ai/${encodeURIComponent(question)}?model=mistral&system=${encodeURIComponent(systemPrompt)}`,
    // 3. Direct GET simple endpoint
    `https://text.pollinations.ai/${encodeURIComponent(question + ' - explain clearly for a student with examples and key points')}`
  ];

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout per endpoint

      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const rawText = await response.text();
      if (!rawText || rawText.trim().length < 20) continue;

      const cleanText = rawText.trim();
      const paragraphs = cleanText.split('\n\n').filter(p => p.trim().length > 0);

      let examTip = "";
      const tipIdx = paragraphs.findIndex(p =>
        p.toLowerCase().includes('exam tip') ||
        p.toLowerCase().includes('board exam') ||
        p.toLowerCase().includes('tip:') ||
        p.toLowerCase().includes('🎯')
      );
      if (tipIdx !== -1) {
        examTip = paragraphs[tipIdx].replace(/[*#]/g, '').trim();
      }

      return {
        title: `AI Study Guide: ${question.slice(0, 40)}${question.length > 40 ? '...' : ''}`,
        steps: paragraphs.length > 1 ? paragraphs : [cleanText],
        examTip: examTip || "Exam Tip: Define terms clearly, highlight key keywords, and give real-life examples for full marks.",
        text: cleanText,
        modelUsed: 'Free Public AI (Llama 3.3 / GPT)',
        isGeminiLive: true
      };
    } catch {
      // Try next endpoint
    }
  }

  // Also try POST if GET failed
  try {
    const payload = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      model: "openai"
    };

    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length >= 20) {
        const clean = text.trim();
        const paragraphs = clean.split('\n\n').filter(p => p.trim().length > 0);
        return {
          title: `AI Study Guide: ${question.slice(0, 40)}${question.length > 40 ? '...' : ''}`,
          steps: paragraphs.length > 1 ? paragraphs : [clean],
          examTip: "Exam Tip: Write step-by-step explanations with neat headings for maximum marks.",
          text: clean,
          modelUsed: 'Free Public AI (Llama 3.3 / GPT)',
          isGeminiLive: true
        };
      }
    }
  } catch {
    // Continue to fallback
  }

  throw new Error("Public LLM endpoints temporarily unreachable");
}

/**
 * Ask Google Gemini Official API (if valid key is provided)
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
 * 3. Graceful fallback to Offline Smart Knowledge Engine
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

  // 3. Fallback to smart offline knowledge base
  return generateOfflineResponse(cleanQ);
}
