const { Solar } = require("lunar-javascript");
const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  if (!birthday || !birthtime || !gender || !language) {
    return res.status(400).json({ message: "❗ Missing required fields." });
  }

  try {
    const [year, month, day] = birthday.split("-").map(Number);
    const [hour, minute] = birthtime.split(":").map(Number);
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();

    const yearPillar = lunar.getYearInGanZhi();
    const monthPillar = lunar.getMonthInGanZhi();
    const dayPillar = lunar.getDayInGanZhi();
    const hourPillar = lunar.getTimeInGanZhi();

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

    // 最强与最弱
    const sorted = Object.entries(percentages).sort((a,b)=>b[1]-a[1]);
    const dominantElement = sorted[0][0];
    const lackingElement = sorted[sorted.length-1][0];

    // 晶石推荐
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

    const crystalList = crystals[lackingElement] || [];

    const promptEN = `
🌟 **Your Personalized BaZi Analysis**

🪶 **Feng Shui Insights**
Your Four Pillars:  
Year: ${yearPillar}  
Month: ${monthPillar}  
Day: ${dayPillar}  
Hour: ${hourPillar}

Element Distribution:  
${Object.entries(percentages).map(e=>`${e[0]}: ${e[1]}%`).join(", ")}

Your dominant element is **${dominantElement}**, your associated Spirit is **${dominantElement} Spirit**, and your weakest element is **${lackingElement}**.

🌿 **Balance Recommendations**
To enhance your weakest element, which is ${lackingElement}, consider incorporating more associated colors, activities, and mindset into your life.

🌸 **Healing Master Advice**
Emotionally, allow yourself to experience your feelings fully, and surround yourself with colors linked to ${lackingElement} for balance.

💎 **Elemental Spirit's Crystal Recommendations**
${crystalList.map(c=>`- ${c.name}: ${c.desc}`).join("\n")}

🌈 **Final Encouragement**
Remember, you are a unique and special individual with your own strengths and weaknesses. Embrace each day with confidence and self-love.
`.trim();

    const promptCN = `
🌟 **您的个性化八字分析**

🪶 **风水大师的八字洞察**
您的四柱：  
年柱：${yearPillar}  
月柱：${monthPillar}  
日柱：${dayPillar}  
时柱：${hourPillar}

五行分布：  
${Object.entries(percentages).map(e=>`${e[0]}：${e[1]}%`).join("，")}

您的主导元素是**${dominantElement}**，对应的元素精灵是**${dominantElement}精灵**，最弱的元素是**${lackingElement}**。

🌿 **五行平衡建议**
为增强您的${lackingElement}元素，请在生活中多融入对应的颜色、活动和心态。

🌸 **疗愈大师建议**
情绪上，允许自己充分体验各种感受，并使用与${lackingElement}相关的色彩来平衡能量。

💎 **元素精灵的水晶推荐**
${crystalList.map(c=>`- ${c.name}：${c.desc}`).join("\n")}

🌈 **最后的鼓励**
请记住，您是独一无二的存在。接纳自己的优点与不足，坚定信心，充满爱地迎接每一天。
`.trim();

    const finalPrompt = language === "Chinese" ? promptCN : promptEN;

    res.status(200).json({ message: finalPrompt });
  } catch (err) {
    console.error("BaZi Analysis error:", err);
    res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
};
