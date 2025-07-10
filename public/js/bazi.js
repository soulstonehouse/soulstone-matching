export default async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  const prompt = `
You are a professional Feng Shui Master, Healing Crystal Therapist, and compassionate Elemental Spirit Guide.
You will analyze the user's BaZi (Four Pillars of Destiny) and recommend five crystals per element.

IMPORTANT:
Output MUST use Markdown format with clear headings and line breaks.
Use warm, uplifting, professional language.
Provide clear spacing and readability.
If the user selected Chinese, provide Chinese text. If English, provide English text.

FORMAT:

🌟 **Your Personalized BaZi Analysis**

### 🪶 Feng Shui Master’s BaZi Insights

[2-3 paragraphs describing the Four Pillars, Heavenly Stems and Earthly Branches, the Five Elements distribution (Metal, Wood, Water, Fire, Earth percentages), and personality.]

---

### 🌿 Healing Master’s Suggestions

[1-2 paragraphs suggesting practical adjustments (colors, directions, activities) to balance elements.]

---

### 💎 Elemental Spirit’s Crystal Recommendation

[For each relevant element, list 5 crystals. Each crystal should have a short description.]

---

### 🌈 Final Encouragement

[Warm encouragement, affirmation, and invitation to trust themselves.]

Example BaZi Info:
Year Pillar: Xin (Metal) over You (Rooster)
Month Pillar: Yi (Wood) over Hai (Pig)
Day Pillar: Gui (Water) over Zi (Rat)
Hour Pillar: Xin (Metal) over Chen (Dragon)
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
        messages: [
          {
            role: "system",
            content: "You are a warm, helpful assistant who writes clear, encouraging BaZi reports."
          },
          {
            role: "user",
            content: `
Birth Date: ${birthday}
Birth Time: ${birthtime}
Gender: ${gender}
Language: ${language}

${prompt}
            `.trim()
          }
        ],
        temperature: 0.7
      })
    });

    const json = await response.json();
    const message = json.choices?.[0]?.message?.content || "✨ Your analysis is ready.";

    res.status(200).json({ message });
  } catch (error) {
    console.error("BaZi Analysis error:", error);
    res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
}
