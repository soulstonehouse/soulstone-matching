import crystals from "../../public/element_crystal_mapping.json";

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

  console.log("Received body:", req.body);

  if (!yearPillar || !monthPillar || !dayPillar || !hourPillar || !gender || !percentages) {
    return res.status(400).json({ message: "❗ Missing required fields." });
  }

  // 找到最缺元素
  const entries = Object.entries(percentages);
  if (!entries.length) {
    return res.status(400).json({ message: "❗ Percentages are empty." });
  }
  const sorted = entries.sort((a, b) => a[1] - b[1]);
  const lackingElement = sorted[0][0];

  console.log("Lacking Element:", lackingElement);
  console.log("Crystals for Element:", crystals[lackingElement]);

  const recommendedCrystals = crystals[lackingElement]?.crystals || [];
  const crystalText = recommendedCrystals.length
    ? recommendedCrystals
        .slice(0, 5)
        .map(c => `- ${c.name}: ${c.description}\n  [View Product](${c.link})`)
        .join("\\n")
    : "No crystal recommendations available.";

  const prompt = `
You are a professional Feng Shui Master and Healing Therapist.

Use the user's Four Pillars and Five Element Percentages to analyze personality and provide lifestyle suggestions.

IMPORTANT:
You MUST use the provided percentages EXACTLY as given, without modification or reinterpretation.
You do NOT need to invent any crystal recommendations (they are already provided).
Just clearly present the provided recommendations in the output.

If the user selected Chinese, reply in Chinese. If English, reply in English.

FORMAT:

🌟 Your Personalized BaZi Analysis

🪶 Feng Shui Master’s BaZi Insights

[2-3 paragraphs describing the Four Pillars and Five Element Percentages.]

⸻

🌿 Five Elements Balancing Suggestions

[1-2 paragraphs with lifestyle suggestions for balancing elements.]

⸻

💎 Elemental Spirit’s Crystal Recommendation

[Include the EXACT crystal recommendations provided below.]

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
${entries.map(e => `${e[0]}: ${e[1]}%`).join("\\n")}

**Crystal Recommendations for ${lackingElement}:**
${crystalText}
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

    // 如果出错先看返回
    const raw = await response.text();
    console.log("OpenAI raw response:", raw);
    const json = JSON.parse(raw);

    const message = json.choices?.[0]?.message?.content || "✨ Your analysis is ready.";

    res.status(200).json({ message });
  } catch (error) {
    console.error("BaZi Analysis error:", error);
    res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
}
