export default async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  // Basic validation
  if (!birthday || !birthtime || !gender) {
    return res.status(400).json({ message: "❗ Missing required fields." });
  }

  // Prompt for GPT
  const prompt = `
You are a professional Feng Shui Master, Healing Crystal Therapist, and compassionate Elemental Spirit Guide.

First, based on the user's Gregorian (solar) birth date and time, calculate the exact Four Pillars of Destiny (BaZi).
Be precise:
- Use Chinese metaphysics rules including the 24 solar terms.
- Confirm whether the date is before or after Li Chun (Start of Spring) and adjust the year pillar accordingly.
- Convert to lunar calendar date.
- Output the exact Heavenly Stems and Earthly Branches for Year, Month, Day, and Hour pillars.

Next, analyze the BaZi chart in detail, including:
- The percentages of the Five Elements (Metal, Wood, Water, Fire, Earth).
- Personality insights based on the element distribution.

Finally, recommend five crystals for the element that is most lacking.

IMPORTANT:
Output MUST use the EXACT format below, replacing content but KEEPING structure and emojis.
Add clear \\n line breaks between paragraphs.
Use warm, uplifting, professional language.
Provide clear spacing and readability.
If the user selected Chinese, provide Chinese text. If English, provide English text.

FORMAT:

🌟 Your Personalized BaZi Analysis

🪶 Feng Shui Master’s BaZi Insights

[First paragraph: conversion of Gregorian date to lunar date and calculation of Four Pillars.]

[Second paragraph: Five Elements distribution.]

[Third paragraph: Personality and destiny insights.]

⸻

🌿 Healing Master’s Suggestions

[1-2 paragraphs suggesting practical adjustments (colors, directions, activities) to balance elements.]

⸻

💎 Elemental Spirit’s Crystal Recommendation

[Recommend 5 crystals ONLY for the most lacking element, each with a short description.]

⸻

🌈 Final Encouragement

[Warm encouragement and affirmation.]

**User's Birth Information:**
Gregorian Birth Date: ${birthday}
Time: ${birthtime}
Gender: ${gender}
`.trim();

  try {
    // Call OpenAI Chat Completion
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
