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

    const yearPillar = lunar.getYearInGanZhi();
    const monthPillar = lunar.getMonthInGanZhi();
    const dayPillar = lunar.getDayInGanZhi();
    const hourPillar = lunar.getTimeZhi();  // 不再用 getTimeGanZhi

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

    // 晶石
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
    const crystalText = recommendedCrystals.map(c => `- ${c.name}: ${c.description}`).join("\n");

    const prompt = `
您是一位专业的风水和疗愈大师。

请根据用户的四柱、五行百分比和缺失元素提供详细分析与建议。

🌟 用户的八字信息
年柱：${yearPillar}
月柱：${monthPillar}
日柱：${dayPillar}
时柱：${hourPillar}
性别：${gender}
语言：${language}

🌟 五行百分比
${entries.map(e => `${e[0]}: ${e[1]}%`).join("\n")}

🌟 晶石推荐
${crystalText}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "你是一位友好、专业的八字分析大师，回答简洁清晰。" },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "✨ 分析已完成。";

    return res.status(200).json({ message });

  } catch (error) {
    console.error("BaZi Analysis error:", error);
    return res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
};
