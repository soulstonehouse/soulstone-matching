export default async function handler(req, res) {
  const { scores } = req.body;

  const prompt = `
You are a compassionate emotional wellness guide and an expert in Chinese Five Elements philosophy.
A user has submitted a 10-question emotional assessment with scores from 1-4 (lower = more positive, higher = more negative). The scores are:
${scores.join(", ")}

Please do the following:

1️⃣ Begin with a warm, nurturing paragraph that gently acknowledges the user's feelings and reassures them it's okay to have a mix of emotions. Imagine you are a trusted therapist who helps them feel safe and accepted.

2️⃣ Offer a thoughtful emotional reflection—highlight patterns you see (for example: overall positivity, occasional doubt, fatigue, etc.). Help the user feel seen and understood.

3️⃣ Transition into your role as a Chinese Five Elements master. Analyze which Element is most relevant to their current state, and name it clearly. Explain in 1-2 sentences why this Element is significant to their emotional landscape, using ancient wisdom imagery.

4️⃣ Recommend one crystal as their energetic ally. Briefly describe how this crystal can help harmonize their state and connect with the chosen Element.

5️⃣ Conclude with a gentle encouragement paragraph, expressing hope and positivity. Invite them—if they wish—to begin a deeper conversation with their Elemental Spirit for more personalized guidance.

Keep the tone warm, empathetic, and wise. Write in clear English, avoiding lists and headers. Be friendly and approachable while carrying the quiet authority of someone trained in both therapy and Eastern metaphysics.
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
    const message = json.choices?.[0]?.message?.content || "Your emotional guide is here whenever you need support.";

    res.status(200).json({ message });
  } catch (e) {
    console.error("GPT error:", e);
    res.status(500).json({ message: "AI analysis failed." });
  }
}
