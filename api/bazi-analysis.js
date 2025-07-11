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

    // 四柱
    const yearPillar = lunar.getYearInGanZhi();
    const monthPillar = lunar.getMonthInGanZhi();
    const dayPillar = lunar.getDayInGanZhi();
    const hourPillar = lunar.getTimeInGanZhi();

    // 五行统计
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

    // 构造 Prompt
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

🌿 **五行平衡建议**
请给出一段中文建议，如何调整生活以改善最弱的五行（${lackingElement}）。

🌸 **疗愈大师建议**
请给出一段中文情绪疗愈和色彩疗法建议。

💎 **元素精灵的水晶推荐**
${crystalList.map(c=>`- ${c.name}：${c.desc}`).join("\n")}

🌈 **最后的鼓励**
请写一段中文鼓励话术。
    `.trim();

    const promptEN = `
🌟 **Your Personalized BaZi Analysis**

🪶 **Feng Shui Master's Insights**
Your Four Pillars:
Year: ${yearPillar}
Month: ${monthPillar}
Day: ${dayPillar}
Hour: ${hourPillar}

Element Distribution:
${Object.entries(percentages).map(e=>`${e[0]}: ${e[1]}%`).join(", ")}

🌿 **Balance Recommendations**
Provide one paragraph of English advice to enhance the weakest element (${lackingElement}).

🌸 **Healing Master Advice**
Provide one paragraph of English emotional and color therapy advice.

💎 **Recommended Crystals**
${crystalList.map(c=>`- ${c.name}: ${c.desc}`).join("\n")}

🌈 **Final Encouragement**
Provide one paragraph of English encouragement.
    `.trim();

    // 选择Prompt
    const finalPrompt = language === "Chinese" ? promptCN : promptEN;

    // 调用GPT
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
            content: "You are a professional BaZi consultant. Always reply in the requested language without mixing."
          },
          {
            role: "user",
            content: finalPrompt
          }
        ]
      })
    });
    const json = await openaiRes.json();
    const message = json.choices?.[0]?.message?.content || "✨ 分析已生成。";

    res.status(200).json({ message });
  } catch (err) {
    console.error("BaZi Analysis error:", err);
    res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
};
