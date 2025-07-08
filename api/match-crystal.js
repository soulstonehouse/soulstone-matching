// /api/match-crystal.js

export default async function handler(req, res) {
  const {
    birthday,
    birthtime,
    gender,
    language = "English",
    promptOverride
  } = req.body;

  let prompt = "";

  if (promptOverride) {
    // 如果是精灵聊天页面自定义prompt
    prompt = promptOverride;
  } else {
    // 出生命理 + 五行分析 + 水晶疗愈 + 鼓励
    prompt = `
You are a professional Chinese metaphysics and feng shui consultant, as well as an experienced emotional healing guide.
Please analyze the user's birth details and generate a warm, insightful report.

User Details:
- Birth Date: ${birthday}
- Birth Time: ${birthtime}
- Gender: ${gender}

Please include these sections:

1️⃣ Professional BaZi analysis (Chinese Four Pillars) with focus on Five Elements balance. Describe which elements are strong or weak in their chart.

2️⃣ Feng Shui advice: what elements they could bring into their life to harmonize their energy.

3️⃣ Crystal recommendations: suggest 1–2 crystals connected to their missing or weak elements. Explain briefly how each can help.

4️⃣ Uplifting encouragement: a warm, comforting paragraph reminding them they are supported, and inviting them to explore a deeper conversation with their Elemental Spirit if they wish.

Write in ${language}. Be clear, friendly, and professional.
`.trim();
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85
      })
    });

    const json = await response.json();
    const message = json.choices?.[0]?.message?.content || "Your guide is here whenever you need support.";

    res.status(200).json({ message });
  } catch (e) {
    console.error("GPT error:", e);
    res.status(500).json({ message: "AI matching failed." });
  }
}
