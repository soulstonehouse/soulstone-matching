export default async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  const prompt = `
You are a professional BaZi (Four Pillars of Destiny) master and a Chinese metaphysics expert. 
Based on the user's birth details below, create an in-depth and warm reading.

Birth date: ${birthday}
Birth time: ${birthtime}
Gender: ${gender}

1️⃣ First, calculate and explain the BaZi (Heavenly Stems and Earthly Branches), including the Year Pillar, Month Pillar, Day Pillar, and Hour Pillar.

2️⃣ Describe which Five Elements are dominant or lacking in their chart, and what this implies about personality, strengths, and weaknesses.

3️⃣ From a Feng Shui perspective, suggest what can be done to balance their Five Elements energy in daily life.

4️⃣ Recommend one or two crystals that could harmonize their energy and why.

5️⃣ Conclude with a caring and positive encouragement message, speaking like a trusted guide and healer.

Respond in ${language}, formatting clearly with paragraphs.
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
    const message = json.choices?.[0]?.message?.content || "Your guide is ready whenever you wish to continue.";

    res.status(200).json({ message });
  } catch (e) {
    console.error("GPT error:", e);
    res.status(500).json({ message: "AI analysis failed." });
  }
}
