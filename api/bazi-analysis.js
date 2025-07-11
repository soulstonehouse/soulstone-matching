export default async function handler(req, res) {
  const {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    gender,
    language,
    percentages
  } = req.body;

  if (!yearPillar || !monthPillar || !dayPillar || !hourPillar || !gender || !percentages) {
    return res.status(400).json({ message: "❗ Missing required fields." });
  }

  const prompt = `
You are a professional Feng Shui Master, Healing Crystal Therapist, and compassionate Elemental Spirit Guide.

Analyze the user's BaZi chart in detail using the provided Four Pillars and Five Element Percentages. IMPORTANT: You MUST use the provided percentages EXACTLY as given, without modification or reinterpretation.

Your analysis should include:
- Interpretation of the Four Pillars
- Explanation of the Five Element Percentages
- Personality insights derived from these distributions
- Crystal recommendations for the most lacking element

IMPORTANT:
Output MUST use the EXACT format below, replacing content but KEEPING structure and emojis.
Add clear \\n line breaks between paragraphs.
Use warm, uplifting, professional language.
If the user selected Chinese, provide Chinese text. If English, provide English text. 
If any pillar is 'Unknown', simply state 'Unknown' without adding pinyin or element.

FORMAT:

🌟 Your Personalized BaZi Analysis

🪶 Feng Shui Master’s BaZi Insights

[2-3 paragraphs describing the Four Pillars and provided Five Element Percentages.]

⸻

🌿 Healing Master’s Suggestions

[1-2 paragraphs suggesting practical adjustments (colors, directions, activities) to balance elements.]

⸻

💎 Elemental Spirit’s Crystal Recommendation

[Recommend 5 crystals ONLY for the most lacking element, each with a short description.]

⸻

🌈 Final Encouragement

[Warm encouragement and affirmation.]

**User's BaZi Info:**
Year Pillar: ${yearPillar}
Month Pillar: ${monthPillar}
Day Pillar: ${dayPillar}
Hour Pillar: ${hourPillar}
Gender: ${gender}
Language: ${language}

**Five Element Percentages Provided:**
Metal: ${percentages.Metal}%
Wood: ${percentages.Wood}%
Water: ${percentages.Water}%
Fire: ${percentages.Fire}%
Earth: ${percentages.Earth}%
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
            content: prompt
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
