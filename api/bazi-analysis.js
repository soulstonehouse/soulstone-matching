// /api/bazi-analysis.js
export default async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  const prompt = `
You are an expert Feng Shui Master, BaZi astrologer, and Healing Crystal guide. 
Please analyze the user's birth information and output the results in clear, warm English.

Birth Date: ${birthday}
Birth Time: ${birthtime}
Gender: ${gender}
Language: ${language}

**IMPORTANT: Format your response exactly as follows:**

🌟 Your Personalized BaZi Analysis

🪶 Feng Shui Master’s BaZi Insights

[In 3-4 sentences: BaZi pillars, Five Elements % distribution, personality strengths & weaknesses, example: "Your Four Pillars show... Your Five Elements distribution is..."]

⸻

🌿 Healing Master’s Suggestions

[In 3-4 sentences: friendly advice about colors, home feng shui, lifestyle improvements, practical actions.]

⸻

💎 Elemental Spirit’s Crystal Recommendation

[In 2-3 sentences: recommend 1-2 crystals, explain their purpose and benefits.]

⸻

🌈 Final Encouragement

[In 2-3 sentences: uplifting words, self-trust, positivity.]

**Keep tone warm, reassuring, and gently empowering. Use clear paragraph breaks and emoji titles exactly as shown.**

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
        temperature: 0.8
      })
    });

    const json = await response.json();
    const message = json.choices?.[0]?.message?.content || "Your personalized analysis will appear here.";

    res.status(200).json({ message });
  } catch (e) {
    console.error("GPT error:", e);
    res.status(500).json({ message: "AI analysis failed." });
  }
}
