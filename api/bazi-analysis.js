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

  // 内嵌的 JSON 数据
  const crystals = {
    "Wood": {
      "crystals": [
        { "name": "Green Aventurine", "description": "Encourages growth, abundance, and vitality.", "link": "https://yourstore.com/products/green-aventurine" },
        { "name": "Moss Agate", "description": "Connects you with nature and stability.", "link": "https://yourstore.com/products/moss-agate" },
        { "name": "Malachite", "description": "Promotes transformation and emotional balance.", "link": "https://yourstore.com/products/malachite" },
        { "name": "Amazonite", "description": "Soothes the mind and enhances clear communication.", "link": "https://yourstore.com/products/amazonite" },
        { "name": "Jade", "description": "Brings harmony, prosperity, and good fortune.", "link": "https://yourstore.com/products/jade" }
      ]
    },
    "Fire": {
      "crystals": [
        { "name": "Carnelian", "description": "Boosts courage, motivation, and vitality.", "link": "https://yourstore.com/products/carnelian" },
        { "name": "Red Jasper", "description": "Strengthens stamina and grounding.", "link": "https://yourstore.com/products/red-jasper" },
        { "name": "Garnet", "description": "Revitalizes passion and energy.", "link": "https://yourstore.com/products/garnet" },
        { "name": "Sunstone", "description": "Brings optimism and enthusiasm.", "link": "https://yourstore.com/products/sunstone" },
        { "name": "Ruby", "description": "Ignites love and personal power.", "link": "https://yourstore.com/products/ruby" }
      ]
    },
    "Water": {
      "crystals": [
        { "name": "Aquamarine", "description": "Soothes emotions and enhances intuition.", "link": "https://yourstore.com/products/aquamarine" },
        { "name": "Lapis Lazuli", "description": "Encourages wisdom and self-expression.", "link": "https://yourstore.com/products/lapis-lazuli" },
        { "name": "Sodalite", "description": "Balances emotional energy and insight.", "link": "https://yourstore.com/products/sodalite" },
        { "name": "Blue Lace Agate", "description": "Promotes calm communication.", "link": "https://yourstore.com/products/blue-lace-agate" },
        { "name": "Kyanite", "description": "Aligns chakras and clears blockages.", "link": "https://yourstore.com/products/kyanite" }
      ]
    },
    "Earth": {
      "crystals": [
        { "name": "Tiger's Eye", "description": "Brings confidence and grounding.", "link": "https://yourstore.com/products/tigers-eye" },
        { "name": "Citrine", "description": "Manifests abundance and stability.", "link": "https://yourstore.com/products/citrine" },
        { "name": "Yellow Jasper", "description": "Provides clarity and protection.", "link": "https://yourstore.com/products/yellow-jasper" },
        { "name": "Smoky Quartz", "description": "Dispels negativity and anchors energy.", "link": "https://yourstore.com/products/smoky-quartz" },
        { "name": "Picture Jasper", "description": "Connects to Earth's harmony.", "link": "https://yourstore.com/products/picture-jasper" }
      ]
    },
    "Metal": {
      "crystals": [
        { "name": "Hematite", "description": "Grounds and clarifies intention.", "link": "https://yourstore.com/products/hematite" },
        { "name": "Pyrite", "description": "Attracts prosperity and shields negativity.", "link": "https://yourstore.com/products/pyrite" },
        { "name": "Silver Obsidian", "description": "Promotes self-awareness and protection.", "link": "https://yourstore.com/products/silver-obsidian" },
        { "name": "Clear Quartz", "description": "Amplifies clarity and intention.", "link": "https://yourstore.com/products/clear-quartz" },
        { "name": "Selenite", "description": "Purifies and calms the mind.", "link": "https://yourstore.com/products/selenite" }
      ]
    }
  };

  const entries = Object.entries(percentages);
  const sorted = entries.sort((a, b) => a[1] - b[1]);
  const lackingElement = sorted[0][0];

  const recommendedCrystals = crystals[lackingElement]?.crystals || [];
  const crystalText = recommendedCrystals
    .map(c => `- ${c.name}: ${c.description}\n  [View Product](${c.link})`)
    .join("\\n");

  const prompt = `
You are a professional Feng Shui Master and Healing Therapist.

Use the user's Four Pillars and Five Element Percentages to analyze personality and provide lifestyle suggestions.

IMPORTANT:
Use the provided percentages EXACTLY. Do NOT invent new crystal recommendations—present the provided list only.

If the user selected Chinese, reply in Chinese. If English, reply in English.

FORMAT:

🌟 Your Personalized BaZi Analysis

🪶 Feng Shui Master’s BaZi Insights

[2-3 paragraphs describing the Four Pillars and Five Element Percentages.]

⸻

🌿 Five Elements Balancing Suggestions

[1-2 paragraphs with lifestyle suggestions.]

⸻

💎 Elemental Spirit’s Crystal Recommendation

[Include the EXACT crystal recommendations below.]

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
          { role: "system", content: "You are a warm, helpful assistant who writes clear, encouraging BaZi reports." },
          { role: "user", content: prompt }
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
