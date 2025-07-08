// /api/emotion-analysis.js

export default async function handler(req, res) {
  const { answers } = req.body;

  const prompt = `
You are a compassionate emotional wellness guide.
The user answered:
${answers.map((a, i) => `${i + 1}. ${a}`).join("\n")}
Based on these answers:
1. Summarize their emotional state.
2. Select ONE element from: Water, Fire, Earth, Ice, Wind, Metal, Thunder, Light, Darkness, Wood.
3. Recommend a crystal that resonates with this element.
4. Write a short, warm, uplifting message.

Return a JSON response exactly in this format:
{
  "summary": "...",
  "element": "...",
  "crystal": "...",
  "message": "..."
}
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
    const content = data.choices?.[0]?.message?.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(500).json({ error: "AI response could not be parsed." });
    }

    res.status(200).json(parsed);
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Something went wrong." });
  }
}
