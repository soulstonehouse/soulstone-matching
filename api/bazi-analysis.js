const { Solar } = require("lunar-javascript");
const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  if (!birthday || !birthtime || !gender || !language) {
    return res.status(400).json({ message: "❗ Missing required fields." });
  }

  try {
    // 解析日期和时间
    const [year, month, day] = birthday.split("-").map(Number);
    const [hour, minute] = birthtime.split(":").map(Number);
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();

    // 自动推算四柱
    const yearPillar = lunar.getYearInGanZhi();
    const monthPillar = lunar.getMonthInGanZhi();
    const dayPillar = lunar.getDayInGanZhi();
    const hourPillar = lunar.getTimeGanZhi();

    // 五行计算
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

    // 晶石定义
    const crystals = {
      "Wood":[
        { name:"Green Aventurine", desc:"Encourages growth, abundance, and vitality." },
        { name:"Moss Agate", desc:"Connects you with nature and stability." },
        { name:"Malachite", desc:"Promotes transformation and emotional balance." },
        { name:"Amazonite", desc:"Soothes the mind and enhances clear communication." },
        { name:"Jade", desc:"Brings harmony, prosperity, and good fortune." }
      ],
      "Fire":[
        { name:"Carnelian", desc:"Boosts courage, motivation, and vitality." },
        { name:"Red Jasper", desc:"Strengthens stamina and grounding." },
        { name:"Garnet", desc:"Revitalizes passion and energy." },
        { name:"Sunstone", desc:"Brings optimism and enthusiasm." },
        { name:"Ruby", desc:"Ignites love and personal power." }
      ],
      "Water":[
        { name:"Aquamarine", desc:"Soothes emotions and enhances intuition." },
        { name:"Lapis Lazuli", desc:"Encourages wisdom and self-expression." },
        { name:"Sodalite", desc:"Balances emotional energy and insight." },
        { name:"Blue Lace Agate", desc:"Promotes calm communication." },
        { name:"Kyanite", desc:"Aligns chakras and clears blockages." }
      ],
      "Earth":[
        { name:"Tiger's Eye", desc:"Brings confidence and grounding." },
        { name:"Citrine", desc:"Manifests abundance and stability." },
        { name:"Yellow Jasper", desc:"Provides clarity and protection." },
        { name:"Smoky Quartz", desc:"Dispels negativity and anchors energy." },
        { name:"Picture Jasper", desc:"Connects to Earth's harmony." }
      ],
      "Metal":[
        { name:"Hematite", desc:"Grounds and clarifies intention." },
        { name:"Pyrite", desc:"Attracts prosperity and shields negativity." },
        { name:"Silver Obsidian", desc:"Promotes self-awareness and protection." },
        { name:"Clear Quartz", desc:"Amplifies clarity and intention." },
        { name:"Selenite", desc:"Purifies and calms the mind." }
      ]
    };

    // 找到最弱元素
    const sorted = Object.entries(percentages).sort((a,b)=>a[1]-b[1]);
    const lackingElement = sorted[0][0];
    const crystalList = crystals[lackingElement] || [];

    // 生成 GPT prompt
    const prompt = `
You are a professional Feng Shui Master and Healing Therapist.
Use this format exactly. Do not invent extra content.

If language is Chinese, reply in Chinese. If English, reply in English.

🌟 Your Personalized BaZi Analysis

🪶 Feng Shui Master’s BaZi Insights
Provide 2 paragraphs about Four Pillars and element percentages.

🌿 Five Elements Balancing Suggestions
Provide 1–2 paragraphs of lifestyle advice.

🌸 Healing Master’s Suggestions
Provide 1–2 paragraphs of emotional and color therapy advice.

💎 Elemental Spirit’s Crystal Recommendation
List all 5 recommended crystals below:
${crystalList.map(c=>`- ${c.name}: ${c.desc}`).join("\n")}

🌈 Final Encouragement

**User's BaZi Info:**
Year Pillar: ${yearPillar}
Month Pillar: ${monthPillar}
Day Pillar: ${dayPillar}
Hour Pillar: ${hourPillar}
Gender: ${gender}
Language: ${language}

**Element Percentages:**
${Object.entries(percentages).map(e=>`${e[0]}: ${e[1]}%`).join("\n")}
    `.trim();

    // 调用 OpenAI
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: "You are a warm, encouraging BaZi analysis expert."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });
    const json = await openaiRes.json();
    const message = json.choices?.[0]?.message?.content || "✨ Your analysis is ready.";

    res.status(200).json({ message });
  } catch (err) {
    console.error("BaZi Analysis error:", err);
    res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
};
