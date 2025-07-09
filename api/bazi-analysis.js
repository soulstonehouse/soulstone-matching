export default async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  const prompt = `
You are an expert Feng Shui Master, Healing Crystal Therapist, and compassionate Elemental Spirit Guide.
You will analyze the user's BaZi (Four Pillars of Destiny) based on the provided birth date, time, and gender.

**IMPORTANT:**
Please use the EXACT format below, replacing the content but KEEPING the structure and emojis.
Add line breaks (\\n) between paragraphs.

FORMAT:
🌟 Your Personalized BaZi Analysis

🪶 Feng Shui Master’s BaZi Insights

[2-3 paragraphs describing the Four Pillars, the Heavenly Stems and Earthly Branches, the Five Elements distribution (Metal, Wood, Water, Fire, Earth percentages), and what this means about personality.]

⸻

🌿 Healing Master’s Suggestions

[1-2 paragraphs suggesting practical adjustments: colors, home directions, activities to balance elements.]

⸻

💎 Elemental Spirit’s Crystal Recommendation

[1-2 paragraphs recommending specific crystals that will help balance and harmonize energies.]

⸻

🌈 Final Encouragement

[1 paragraph with warm encouragement, inspiration, and invitation to trust themselves.]

**Example BaZi Info:**
Year: Xin (Metal) over You (Rooster)
Month: Yi (Wood) over Hai (Pig)
Day: Gui (Water) over Zi (Rat)
Hour: Xin (Metal) over Chen (Dragon)

Make sure your output is warm, positive, and clear.
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
            content: "You are a helpful assistant."
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
        temperature: 0.8
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
