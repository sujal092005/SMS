// AI Academic Study Assistant Service for RAVS Smart School
// Engine Priority:
//   1. Groq AI    (Llama 3.3 70B - Fast, Free, Genuine answers)
//   2. Google Gemini API (if AQ. / AIza key is provided)
//   3. Pollinations.ai  (Free public LLM, no key needed)
//   4. Offline Smart Knowledge Engine (always works)

const GROQ_API_KEY   = import.meta.env.VITE_GROQ_API_KEY   || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Shared system prompt
const SYSTEM_PROMPT = `You are an expert AI Study Assistant for RAVS Smart School students (Grades 5-12, State Board & CBSE).
Answer every question accurately, clearly, and helpfully.
Structure your response as:
1. Clear explanation / definition
2. Key points or step-by-step breakdown
3. Real-world example or application
4. Board Exam Tip for scoring high marks.
Use simple English. Include relevant formulas, dates, or scientific terms where needed.`;

// Error-signal filter
const ERROR_SIGNALS = [
  'model output error',
  'must contain either output text',
  '"error"',
  '<!DOCTYPE',
  '<html',
  'bad request',
  'rate limit',
  'too many requests',
  'service unavailable',
  'internal server error'
];
function isErrorText(text) {
  const lower = (text || '').toLowerCase();
  return ERROR_SIGNALS.some(sig => lower.includes(sig.toLowerCase()));
}

// Format raw LLM text into structured response
function formatResponse(rawText, question, modelUsed) {
  const paragraphs = rawText.split('\n\n').filter(p => p.trim().length > 0);
  let examTip = '';
  const tipIdx = paragraphs.findIndex(p =>
    p.toLowerCase().includes('exam tip') ||
    p.toLowerCase().includes('board exam') ||
    p.toLowerCase().includes('tip:')
  );
  if (tipIdx !== -1) {
    examTip = paragraphs.splice(tipIdx, 1)[0].replace(/^[*#\s]+/, '').trim();
  }
  return {
    title: `Study Guide: ${question.slice(0, 45)}${question.length > 45 ? '...' : ''}`,
    steps: paragraphs.length > 1 ? paragraphs : [rawText],
    examTip: examTip || 'Exam Tip: Define key terms clearly, show your working, and highlight keywords for full marks.',
    text: rawText,
    modelUsed,
    isGeminiLive: true
  };
}

// ENGINE 1: Groq AI (Llama 3.3 70B)
async function askGroq(question) {
  if (!GROQ_API_KEY || !GROQ_API_KEY.startsWith('gsk_')) {
    throw new Error('Groq key not configured');
  }
  const models = ['llama-3.3-70b-versatile', 'llama3-70b-8192', 'mixtral-8x7b-32768'];
  for (const model of models) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: question }
          ],
          temperature: 0.5,
          max_tokens: 1024
        }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      if (!res.ok) continue;
      const data = await res.json();
      const rawText = data.choices?.[0]?.message?.content?.trim();
      if (!rawText || rawText.length < 20 || isErrorText(rawText)) continue;
      return formatResponse(rawText, question, `Groq ${model}`);
    } catch { /* Try next model */ }
  }
  throw new Error('Groq: all models failed');
}

// ENGINE 2: Google Gemini
async function askGemini(question) {
  const key = GEMINI_API_KEY.trim();
  if (!key || key.length < 10) throw new Error('Gemini key not configured');
  const isOAuth  = key.startsWith('AQ.');
  const isApiKey = key.startsWith('AIza');
  if (!isOAuth && !isApiKey) throw new Error('Gemini key format unrecognised');
  const requestBody = {
    contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nStudent Question: "${question}"` }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 1200 }
  };
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  for (const model of models) {
    try {
      const url = isOAuth
        ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
        : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
      const headers = { 'Content-Type': 'application/json' };
      if (isOAuth) headers['Authorization'] = `Bearer ${key}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(requestBody), signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) continue;
      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (!rawText || rawText.length < 20 || isErrorText(rawText)) continue;
      return formatResponse(rawText, question, `Google ${model}`);
    } catch { /* Try next model */ }
  }
  throw new Error('Gemini: all models failed');
}

// ENGINE 3: Pollinations.ai (free public)
async function askPollinations(question) {
  const encodedQ   = encodeURIComponent(question);
  const encodedSys = encodeURIComponent(SYSTEM_PROMPT);
  const endpoints = [
    `https://text.pollinations.ai/${encodedQ}?model=openai&system=${encodedSys}`,
    `https://text.pollinations.ai/${encodedQ}?model=mistral&system=${encodedSys}`,
    `https://text.pollinations.ai/${encodedQ}`
  ];
  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { method: 'GET', signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) continue;
      const rawText = (await res.text()).trim();
      if (!rawText || rawText.length < 20 || isErrorText(rawText)) continue;
      return formatResponse(rawText, question, 'Pollinations.ai (GPT/Llama)');
    } catch { /* Try next endpoint */ }
  }
  throw new Error('Pollinations: all endpoints failed');
}

// ENGINE 4: Offline Smart Knowledge Base
function askOffline(question) {
  const q = (question || '').toLowerCase();
  const entries = [
    {
      keys: ['photosynthesis'],
      overview: 'Photosynthesis is the process by which green plants use sunlight, CO2, and water to produce glucose and oxygen.',
      steps: [
        '1. Equation: 6CO2 + 6H2O + Sunlight (chlorophyll) -> C6H12O6 + 6O2',
        '2. Light Reactions (Thylakoid): Sunlight splits water (photolysis), producing ATP, NADPH, and O2.',
        '3. Calvin Cycle (Stroma): CO2 is fixed into glucose using ATP and NADPH.',
        '4. Example: All food chains begin with photosynthesis - plants are producers.'
      ],
      tip: 'Board Exam Tip: Draw a labelled chloroplast diagram. Write the balanced equation clearly.'
    },
    {
      keys: ['newton', 'laws of motion', 'force', 'inertia'],
      overview: "Newton's Laws of Motion describe the relationship between forces and the motion of objects.",
      steps: [
        '1. First Law (Inertia): An object stays at rest or in uniform motion unless acted on by a net external force.',
        '2. Second Law: F = ma. Net Force = Mass x Acceleration. Unit: Newton (N).',
        '3. Third Law: Every action has an equal and opposite reaction.',
        '4. Example: A rocket launches by pushing gas downward (Third Law).'
      ],
      tip: 'Board Exam Tip: State SI units (N, kg, m/s2). Illustrate with everyday examples.'
    },
    {
      keys: ['quadratic', 'polynomial'],
      overview: 'A Quadratic Equation is a 2nd-degree polynomial: ax2 + bx + c = 0, where a != 0.',
      steps: [
        '1. Quadratic Formula: x = [-b +/- sqrt(b2-4ac)] / 2a',
        '2. Discriminant (D = b2-4ac): D>0 -> two real roots; D=0 -> equal roots; D<0 -> no real roots.',
        '3. Factorisation: Split bx into two terms whose product = a*c.',
        '4. Example: x2 - 5x + 6 = 0 -> (x-2)(x-3) = 0 -> x = 2 or x = 3.'
      ],
      tip: 'Board Exam Tip: Identify a, b, c first. Compute discriminant before applying the formula.'
    },
    {
      keys: ['google'],
      overview: 'Google is the world\'s largest internet company and search engine, founded in 1998 by Larry Page and Sergey Brin.',
      steps: [
        '1. Search Engine: Uses PageRank algorithm and Googlebot crawlers to index and rank web pages.',
        '2. Products: Android OS, Chrome browser, YouTube, Gmail, Google Maps, Google Drive, Google Cloud.',
        '3. AI: Develops Gemini AI, DeepMind, Tensor Processing Units (TPUs), and quantum computing.',
        '4. Business: Primary revenue comes from Google Ads (Search Ads, Display Ads, YouTube Ads).'
      ],
      tip: 'CS Tip: Mention founding year, core technology (PageRank), key products, and revenue model.'
    }
  ];
  const match = entries.find(e => e.keys.some(k => q.includes(k)));
  if (match) {
    const rawText = `${match.overview}\n\n${match.steps.join('\n')}\n\nExam Tip: ${match.tip}`;
    return { title: `Study Guide: ${question.slice(0, 45)}`, steps: match.steps, examTip: match.tip, text: rawText, modelUsed: 'Offline Knowledge Base', isGeminiLive: true };
  }
  const rawText = `Explanation for: "${question}"\n\n1. Definition: This is an important academic topic. Focus on core principles.\n2. Key Points: Identify main components, formulas, or events.\n3. Application: Where does this appear in real life or advanced studies?\n4. Exam Strategy: Clear bullet points, defined terms, one example minimum.\n\nExam Tip: Highlight keywords, draw diagrams where applicable, structure your answer.`;
  return {
    title: `Study Guide: ${question.slice(0, 45)}`,
    steps: ['1. Definition & Core Concept', '2. Key Components', '3. Real-world Application', '4. Exam Strategy'],
    examTip: 'Exam Tip: Always define terms, provide examples, and write in clear bullet points.',
    text: rawText,
    modelUsed: 'Offline Knowledge Base',
    isGeminiLive: true
  };
}

// MAIN EXPORT - tries engines in priority order
export async function askGeminiTutor(question, customApiKey = '') {
  const cleanQ = (question || '').trim();
  if (!cleanQ) return askOffline('General Study Doubt');

  // 1. Groq AI - primary (best quality, genuine answers)
  try {
    const result = await askGroq(cleanQ);
    if (result && result.text) return result;
  } catch (e) { console.warn('[AI] Groq skipped:', e.message); }

  // 2. Google Gemini - secondary
  try {
    const result = await askGemini(cleanQ);
    if (result && result.text) return result;
  } catch (e) { console.warn('[AI] Gemini skipped:', e.message); }

  // 3. Pollinations.ai - tertiary (free public)
  try {
    const result = await askPollinations(cleanQ);
    if (result && result.text) return result;
  } catch (e) { console.warn('[AI] Pollinations skipped:', e.message); }

  // 4. Offline Knowledge Base - always works
  return askOffline(cleanQ);
}
