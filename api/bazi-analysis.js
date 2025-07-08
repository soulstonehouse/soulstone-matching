export default async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  const prompt = `
You are a professional Chinese metaphysics consultant specializing in BaZi (Four Pillars of Destiny), Feng Shui, and Crystal Healing.

Based on the following birth information:
- Birth Date: ${birthday}
- Birth Time: ${birthtime}
- Gender: ${gender}

Please provide a professional analysis in ${language}.

Your response must include:

1️⃣ **BaZi Analysis**: Clearly state the year, month, day, and hour pillars, their animals and elements, and what they mean in terms of personality, strengths, and weaknesses.

2️⃣ **Five Elements Balance**: Analyze the balance or imbalance among Wood, Fire, Earth, Metal, and Water. Which elements are strong, which are weak, and what does this imply?

3️⃣ **Feng Shui Recommendations**: Offer 2-3 practical Feng Shui suggestions to harmonize the client's environment and support their well-being.

4️⃣ **Crystal Recommendations**: Suggest 2 crystals that will help balance and nourish the lacking elements.

5️⃣ **Encouraging Closing**: Conclude with a warm, uplifting message reminding the client that life is a journey and they are supported.

Please write with clear paragraphs separated by TWO line breaks, so the text is easy to read when displayed in HTML.
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
    const message = json.choices?.[0]?.message?.content || "Your analysis is ready.";

    res.status(200).json({ message });
  } catch (e) {
    console.error("BaZi API error:", e);
    res.status(500).json({ message: "AI BaZi analysis failed." });
  }
}
