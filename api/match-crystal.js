export default async function handler(req, res) {
  const { promptOverride, language } = req.body;

  const prompt = promptOverride || `
You are a wise elemental spirit guide. The user wants to explore crystal wisdom and elemental guidance.

Please provide a warm, empathic message that inspires clarity and inner peace.
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
        temperature: 0.75
      })
    });

    const json = await response.json();
    const message = json.choices?.[0]?.message?.content || "Your elemental spirit is here to guide you.";

    res.status(200).json({ message });
  } catch (e) {
    console.error("Match-crystal API error:", e);
    res.status(500).json({ message: "Elemental spirit could not respond." });
  }
}
