// /api/bazi-analysis.js

export default async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  const prompt = `
You are a highly skilled Chinese BaZi (Four Pillars) master and wellness consultant. 
Please generate a detailed BaZi reading for the user based on:

- Birth date: ${birthday}
- Birth time: ${birthtime}
- Gender: ${gender}

Include the following sections:

1️⃣ Four Pillars with Heavenly Stems and Earthly Branches (Year, Month, Day, Hour).
2️⃣ The Hidden Stems for each pillar.
3️⃣ A Five Elements distribution with approximate percentages.
4️⃣ Interpretation of the personality, strengths, and challenges.
5️⃣ Feng Shui recommendations to balance missing or excessive elements (e.g., colors, directions, lifestyle).
6️⃣ Crystal recommendations (at least 2) with explanations how they support balance.
7️⃣ A final warm, encouraging paragraph reminding the user of their unique gifts.

Write in ${language}.
Keep the style professional, clear, and empathetic, blending traditional BaZi wisdom with modern wellness language.
`.trim();

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
        temperature: 0.7
      })
    });

    const json = await response.json();
    const message = json.choices?.[0]?.message?.content || "Your BaZi guide is ready whenever you are.";

    res.status(200).json({ message });
  } catch (e) {
    console.error("GPT error:", e);
    res.status(500).json({ message: "AI analysis failed." });
  }
}
