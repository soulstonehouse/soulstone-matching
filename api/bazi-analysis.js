export default async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  const prompt = `
You are a professional Chinese metaphysics consultant and crystal healing expert.

User's birth info:
- Birthday: ${birthday}
- Birth time: ${birthtime}
- Gender: ${gender}

Please do the following in ${language}:

1️⃣ Calculate and present the BaZi Four Pillars (Year, Month, Day, Hour) with both Heavenly Stems and Earthly Branches.
2️⃣ Show Hidden Stems inside each Branch.
3️⃣ Give approximate Five Elements distribution in percentages (Metal, Wood, Water, Fire, Earth).
4️⃣ Write a paragraph analyzing personality strengths and challenges.
5️⃣ Provide Feng Shui recommendations to balance lacking elements.
6️⃣ Recommend 2 commonly available crystals (e.g., Carnelian, Citrine, Amethyst, Clear Quartz, Rose Quartz, Green Aventurine, Black Obsidian, etc.), each with a short description.
7️⃣ End with a warm, uplifting encouragement message.

Output everything as a clear, structured text with emojis and clear formatting.
`;

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
    const message = json.choices?.[0]?.message?.content || "✨ Your BaZi analysis is ready.";

    res.status(200).json({ message });
  } catch (e) {
    console.error("BaZi analysis error:", e);
    res.status(500).json({ message: "AI analysis failed." });
  }
}
