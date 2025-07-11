const { Solar } = require("lunar-javascript");
const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  if (!birthday || !birthtime || !gender || !language) {
    return res.status(400).json({ message: "❗ Missing required fields." });
  }

  try {
    // 日期与时间
    const [year, month, day] = birthday.split("-").map(Number);
    const [hour, minute] = birthtime.split(":").map(Number);
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();

    // 四柱
    const yearPillar = lunar.getYearInGanZhi();
    const monthPillar = lunar.getMonthInGanZhi();
    const dayPillar = lunar.getDayInGanZhi();
    const hourPillar = lunar.getTimeGanZhiExact(); // 精确时柱

    // 五行
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

    // 最低元素
    const lackingElement = Object.entries(percentages).sort((a,b)=>a[1]-b[1])[0][0];

    // 晶石
    const crystals = {
      "Fire":[
        "Carnelian: enhances courage and vitality.",
        "Red Jasper: strengthens endurance.",
        "Garnet: revives passion.",
        "Sunstone: brings optimism.",
        "Ruby: ignites love and power."
      ],
      "Water":[
        "Aquamarine: soothes emotions.",
        "Lapis Lazuli: inspires wisdom.",
        "Sodalite: balances insight.",
        "Blue Lace Agate: calms communication.",
        "Kyanite: clears blockages."
      ],
      "Wood":[
        "Green Aventurine: fosters growth.",
        "Moss Agate: connects to nature.",
        "Malachite: promotes balance.",
        "Amazonite: enhances clarity.",
        "Jade: brings harmony."
      ],
      "Earth":[
        "Tiger's Eye: builds confidence.",
        "Citrine: manifests abundance.",
        "Yellow Jasper: provides protection.",
        "Smoky Quartz: anchors energy.",
        "Picture Jasper: grounds harmony."
      ],
      "Metal":[
        "Hematite: grounds intention.",
        "Pyrite: shields negativity.",
        "Silver Obsidian: promotes awareness.",
        "Clear Quartz: amplifies clarity.",
        "Selenite: purifies thoughts."
      ]
    };

    // Format language
    let message = "";
    if (language === "Chinese") {
      message = `
🌟 **您的个性化八字分析**

🪶 **风水大师的八字洞察**

您的八字：${yearPillar}年柱，${monthPillar}月柱，${dayPillar}日柱，${hourPillar}时柱。
五行分布：金 ${percentages.Metal}%、木 ${percentages.Wood}%、水 ${percentages.Water}%、火 ${percentages.Fire}%、土 ${percentages.Earth}%。

您的命盘显示${lackingElement==="Fire"?"火":"其他"}元素偏弱，需要加以调和。

⸻

🌿 **五行平衡建议**

请多接触与${lackingElement}相关的颜色和环境，调节您的能量平衡。

⸻

🌸 **疗愈大师的建议**

尝试冥想、瑜伽或色彩疗愈。可多使用${lackingElement==="Fire"?"红色":"相关色彩"}来提高活力和信心。

⸻

💎 **元素精灵的水晶推荐**

${crystals[lackingElement].map(c=>"- "+c).join("\n")}

⸻

🌈 **最后的鼓励**

请相信，您拥有平衡与改变的力量，愿生活充满喜悦。
`.trim();
    } else {
      message = `
🌟 **Your Personalized BaZi Analysis**

🪶 **Feng Shui Master's Insights**

Your BaZi: Year Pillar ${yearPillar}, Month Pillar ${monthPillar}, Day Pillar ${dayPillar}, Hour Pillar ${hourPillar}.
Five Element Distribution: Metal ${percentages.Metal}%, Wood ${percentages.Wood}%, Water ${percentages.Water}%, Fire ${percentages.Fire}%, Earth ${percentages.Earth}%.
Your chart shows a relative lack of ${lackingElement} element.

⸻

🌿 **Five Element Balancing Suggestions**

Engage with environments and colors linked to ${lackingElement} to restore harmony.

⸻

🌸 **Healing Master's Suggestions**

Consider meditation, yoga, or color therapy. Using ${lackingElement==="Fire"?"red":"related colors"} can enhance vitality and confidence.

⸻

💎 **Elemental Spirit's Crystal Recommendations**

${crystals[lackingElement].map(c=>"- "+c).join("\n")}

⸻

🌈 **Final Encouragement**

You hold the power to create balance and joy in your life.
`.trim();
    }

    res.status(200).json({ message });
  } catch (error) {
    console.error("BaZi Analysis error:", error);
    res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
};
