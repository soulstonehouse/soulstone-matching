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

  // 内嵌的JSON数据
  const crystals = {
    "Wood": {
      "crystals": [
        { "name": "Green Aventurine", "description": "Encourages growth, abundance, and vitality." },
        { "name": "Moss Agate", "description": "Connects you with nature and stability." },
        { "name": "Malachite", "description": "Promotes transformation and emotional balance." },
        { "name": "Amazonite", "description": "Soothes the mind and enhances clear communication." },
        { "name": "Jade", "description": "Brings harmony, prosperity, and good fortune." }
      ]
    },
    "Fire": {
      "crystals": [
        { "name": "Carnelian", "description": "Boosts courage, motivation, and vitality." },
        { "name": "Red Jasper", "description": "Strengthens stamina and grounding." },
        { "name": "Garnet", "description": "Revitalizes passion and energy." },
        { "name": "Sunstone", "description": "Brings optimism and enthusiasm." },
        { "name": "Ruby", "description": "Ignites love and personal power." }
      ]
    },
    "Water": {
      "crystals": [
        { "name": "Aquamarine", "description": "Soothes emotions and enhances intuition." },
        { "name": "Lapis Lazuli", "description": "Encourages wisdom and self-expression." },
        { "name": "Sodalite", "description": "Balances emotional energy and insight." },
        { "name": "Blue Lace Agate", "description": "Promotes calm communication." },
        { "name": "Kyanite", "description": "Aligns chakras and clears blockages." }
      ]
    },
    "Earth": {
      "crystals": [
        { "name": "Tiger's Eye", "description": "Brings confidence and grounding." },
        { "name": "Citrine", "description": "Manifests abundance and stability." },
        { "name": "Yellow Jasper", "description": "Provides clarity and protection." },
        { "name": "Smoky Quartz", "description": "Dispels negativity and anchors energy." },
        { "name": "Picture Jasper", "description": "Connects to Earth's harmony." }
      ]
    },
    "Metal": {
      "crystals": [
        { "name": "Hematite", "description": "Grounds and clarifies intention." },
        { "name": "Pyrite", "description": "Attracts prosperity and shields negativity." },
        { "name": "Silver Obsidian", "description": "Promotes self-awareness and protection." },
        { "name": "Clear Quartz", "description": "Amplifies clarity and intention." },
        { "name": "Selenite", "description": "Purifies and calms the mind." }
      ]
    }
  };

  const entries = Object.entries(percentages);
  const sorted = entries.sort((a, b) => a[1] - b[1]);
  const lackingElement = sorted[0][0];

  const recommendedCrystals = crystals[lackingElement]?.crystals || [];
  const crystalText = recommendedCrystals
    .map(c => `- ${c.name}: ${c.description}`)
    .join("\\n");

  const prompt = `
You are a professional Feng Shui Master and Healing Therapist.

Use the user's Four Pillars and Five Element Percentages to analyze personality and provide suggestions.

IMPORTANT:
Use the provided percentages EXACTLY.
Do NOT invent new crystal recommendations—only present the provided list.
Include all sections: Feng Shui Insights, Five Element Suggestions, Healing Master Suggestions, Crystal Recommendations, and Final Encouragement.

If the user selected Chinese, reply in Chinese. If English, reply in English.

FORMAT:

🌟 Your Personalized BaZi Analysis

🪶 Feng Shui Master’s BaZi Insights

[2–3 paragraphs describing the Four Pillars and Five Element Percentages.]

⸻

🌿 Five Elements Balancing Suggestions

[1–2 paragraphs with lifestyle suggestions.]

⸻

🌸 Healing Master’s Suggestions

[1–2 paragraphs with emotional, meditation, or color therapy advice.]

⸻

💎 Elemental Spirit’s Crystal Recommendation

[Include the EXACT crystal recommendations below, without any links.]

⸻

🌈 Final Encouragement

**User's BaZi Info:**
Year Pillar: ${yearPillar}
Month Pillar: ${monthPillar}
Day Pillar: ${dayPillar}
Hour Pillar: ${hourPillar}
Gender: ${gender}
Language: ${language}

**Five Element Percentages:**
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

    const json = await response.json();
    const message = json.choices?.[0]?.message?.content || "✨ Your analysis is ready.";

    res.status(200).json({ message });
  } catch (error) {
    console.error("BaZi Analysis error:", error);
    res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
}
