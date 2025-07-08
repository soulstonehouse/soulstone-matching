// /api/bazi-analysis.js
export default async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  const prompt = `
You are a professional BaZi (Chinese Four Pillars) metaphysics master, a feng shui consultant, and a warm-hearted healing guide.
Please help the user analyze their destiny based on this information:

- Birthday: ${birthday}
- Birthtime: ${birthtime}
- Gender: ${gender}
- Language: ${language}

Step by step, do the following:

1️⃣ Professionally interpret the BaZi chart (year, month, day, hour pillars) and describe their dominant Five Elements (Metal, Wood, Water, Fire, Earth).

2️⃣ Gently explain which elements are excessive, which are lacking, and how this affects their personality, relationships, and overall destiny.

3️⃣ Offer feng shui and lifestyle advice to balance their elements (e.g., colors, directions, practices).

4️⃣ Recommend 2-3 crystals that will help harmonize their energy. For each crystal, briefly explain its benefits.

5️⃣ Present all this in **friendly HTML**, with:
- Clear paragraphs (use <p>)
- Emojis to make it warm and approachable
- Bold key concepts
- A final paragraph with warm encouragement

6️⃣ At the end, add a clickable link:
"✨ <a href='/shop-crystals' target='_blank'>Explore Recommended Crystals</a>"

Please keep the language simple and supportive.
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
        temperature: 0.85
      })
    });

    const json = await response.json();
    const message = json.choices?.[0]?.message?.content || "Your BaZi guide is here whenever you need support.";

    res.status(200).json({ message });
  } catch (e) {
    console.error("GPT error:", e);
    res.status(500).json({ message: "AI analysis failed." });
  }
}
