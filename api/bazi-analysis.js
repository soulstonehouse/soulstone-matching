const { Solar } = require("lunar-javascript");
const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  if (!birthday || !birthtime || !gender) {
    return res.status(400).json({ message: "❗ Missing required fields." });
  }

  try {
    // === 解析日期和时间 ===
    const [year, month, day] = birthday.split("-").map(Number);
    const [hour, minute] = birthtime.split(":").map(Number);
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();

    // === 自动推算四柱 ===
    const yearPillar = lunar.getYearInGanZhi();
    const monthPillar = lunar.getMonthInGanZhi();
    const dayPillar = lunar.getDayInGanZhi();
    const hourPillar = lunar.getTimeZhi(); // 注意这里用 getTimeZhi() 返回时支

    // === 五行简单估算 (示例) ===
    const elementMap = {
      "甲":"Wood","乙":"Wood","丙":"Fire","丁":"Fire","戊":"Earth","己":"Earth","庚":"Metal","辛":"Metal","壬":"Water","癸":"Water",
      "子":"Water","丑":"Earth","寅":"Wood","卯":"Wood","辰":"Earth","巳":"Fire","午":"Fire","未":"Earth","申":"Metal","酉":"Metal","戌":"Earth","亥":"Water"
    };

    const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
    const counts = { Metal:0, Wood:0, Water:0, Fire:0, Earth:0 };
    pillars.forEach(pillar => {
      const [stem, branch] = pillar.split("");
      counts[elementMap[stem]]++;
      counts[elementMap[branch]]++;
    });

    const total = Object.values(counts).reduce((a,b)=>a+b,0);
    const percentages = {};
    Object.keys(counts).forEach(k => {
      percentages[k] = total ? Math.round(counts[k]/total*100) : 0;
    });

    // === 晶石定义 ===
    const crystals = {
      "Wood": [
        { "name":"Green Aventurine","description":"Encourages growth, abundance, and vitality." },
        { "name":"Moss Agate","description":"Connects you with nature and stability." },
        { "name":"Malachite","description":"Promotes transformation and emotional balance." },
        { "name":"Amazonite","description":"Soothes the mind and enhances clear communication." },
        { "name":"Jade","description":"Brings harmony, prosperity, and good fortune." }
      ],
      "Fire": [
        { "name":"Carnelian","description":"Boosts courage, motivation, and vitality." },
        { "name":"Red Jasper","description":"Strengthens stamina and grounding." },
        { "name":"Garnet","description":"Revitalizes passion and energy." },
        { "name":"Sunstone","description":"Brings optimism and enthusiasm." },
        { "name":"Ruby","description":"Ignites love and personal power." }
      ],
      "Water": [
        { "name":"Aquamarine","description":"Soothes emotions and enhances intuition." },
        { "name":"Lapis Lazuli","description":"Encourages wisdom and self-expression." },
        { "name":"Sodalite","description":"Balances emotional energy and insight." },
        { "name":"Blue Lace Agate","description":"Promotes calm communication." },
        { "name":"Kyanite","description":"Aligns chakras and clears blockages." }
      ],
      "Earth": [
        { "name":"Tiger's Eye","description":"Brings confidence and grounding." },
        { "name":"Citrine","description":"Manifests abundance and stability." },
        { "name":"Yellow Jasper","description":"Provides clarity and protection." },
        { "name":"Smoky Quartz","description":"Dispels negativity and anchors energy." },
        { "name":"Picture Jasper","description":"Connects to Earth's harmony." }
      ],
      "Metal": [
        { "name":"Hematite","description":"Grounds and clarifies intention." },
        { "name":"Pyrite","description":"Attracts prosperity and shields negativity." },
        { "name":"Silver Obsidian","description":"Promotes self-awareness and protection." },
        { "name":"Clear Quartz","description":"Amplifies clarity and intention." },
        { "name":"Selenite","description":"Purifies and calms the mind." }
      ]
    };

    // === 取最缺少的元素
    const lackingElement = Object.entries(percentages).sort((a,b)=>a[1]-b[1])[0][0];
    const recommendedCrystals = crystals[lackingElement] || [];
    const crystalText = recommendedCrystals.map(c => `- ${c.name}: ${c.description}`).join("\n");

    // === 生成报告
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
${Object.entries(percentages).map(e => `${e[0]}: ${e[1]}%`).join("\n")}

**Crystal Recommendations for ${lackingElement}:**
${crystalText}
    `.trim();

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

    return res.status(200).json({ message });

  } catch (error) {
    console.error("BaZi Analysis error:", error);
    return res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
};
