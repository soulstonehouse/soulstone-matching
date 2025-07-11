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

  // 校验字段
  if (!yearPillar || !monthPillar || !dayPillar || !hourPillar || !gender || !percentages) {
    console.error("❗ Missing fields:", { yearPillar, monthPillar, dayPillar, hourPillar, gender, percentages });
    return res.status(400).json({ message: "❗ Missing required fields." });
  }

  try {
    // 找到最少的元素
    const entries = Object.entries(percentages);
    if (!entries.length) {
      console.error("❗ Percentages empty:", percentages);
      return res.status(400).json({ message: "❗ Invalid percentages data." });
    }
    const sorted = entries.sort((a, b) => a[1] - b[1]);
    const lackingElement = sorted[0][0];
    console.log("Lacking element:", lackingElement);

    // 找对应水晶
    const recommendedCrystals = crystals[lackingElement]?.crystals || [];
    if (recommendedCrystals.length === 0) {
      console.warn(`⚠️ No crystals found for element: ${lackingElement}`);
    }

    const crystalText = recommendedCrystals
      .slice(0, 5)
      .map(c => `- ${c.name}: ${c.description}\n  [🔗 查看产品](${c.link})`)
      .join("\\n");

    // 拼接Prompt
    const prompt = `
You are a professional Feng Shui Master and Healing Therapist.

Use the user's Four Pillars and Five Element Percentages to analyze personality and provide suggestions.

IMPORTANT:
- You MUST use the provided percentages EXACTLY as given.
- Do NOT invent any crystal recommendations (they are provided).
- If the user selected Chinese, reply in Chinese. If English, reply in English.

FORMAT:

🌟 ${language === "Chinese" ? "您的个性化八字分析" : "Your Personalized BaZi Analysis"}

🪶 ${language === "Chinese" ? "风水大师的八字见解" : "Feng Shui Master’s BaZi Insights"}

[2-3 paragraphs describing the Four Pillars and Five Element Percentages.]

⸻

🌿 ${language === "Chinese" ? "五行平衡建议" : "Five Elements Balancing Suggestions"}

[1-2 paragraphs with lifestyle suggestions for balancing elements.]

⸻

💎 ${language === "Chinese" ? "元素精灵的水晶推荐" : "Elemental Spirit’s Crystal Recommendation"}

[Include the EXACT crystal recommendations provided below.]

⸻

🌈 ${language === "Chinese" ? "最后的鼓励" : "Final Encouragement"}

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

    console.log("✅ Prompt prepared.");

    // 请求OpenAI
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
        temperature: 0.6
      })
    });

    const json = await response.json();
    console.log("✅ OpenAI response:", JSON.stringify(json, null, 2));

    const message = json.choices?.[0]?.message?.content || "✨ Your analysis is ready.";

    res.status(200).json({ message });

  } catch (error) {
    console.error("❗ BaZi Analysis error:", error);
    res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
}
