// 路径应为：/api/match-crystal.js
export default async function handler(req, res) {
  const { birthdate, birthtime, language } = req.body;

  const prompt = `
You are a crystal energy expert. The user was born on ${birthdate} at ${birthtime}.
Please use Chinese Five Elements theory + Western astrology to analyze the user's energy pattern.
Then recommend 4-6 crystals and output matching product links (example: /products/rose-quartz).
Answer in ${language}.
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
        temperature: 0.7
      })
    });

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "Sorry, no insight found.";

    res.status(200).json({ message });
  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
