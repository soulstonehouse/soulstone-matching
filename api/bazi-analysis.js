const { Solar } = require("lunar-javascript");

module.exports = async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  if (!birthday || !birthtime || !gender) {
    return res.status(400).json({ message: language === "Chinese" ? "❗ 缺少必要信息。" : "❗ Missing required fields." });
  }

  try {
    // 解析日期
    const [year, month, day] = birthday.split("-").map(Number);
    const [hour, minute] = birthtime.split(":").map(Number);
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();

    // 四柱
    const yearPillar = lunar.getYearInGanZhi();
    const monthPillar = lunar.getMonthInGanZhi();
    const dayPillar = lunar.getDayInGanZhi();
    const hourPillar = lunar.getTimeGanZhi();

    // 五行统计
    const elementMap = {
      "甲": "Wood", "乙": "Wood", "丙": "Fire", "丁": "Fire",
      "戊": "Earth", "己": "Earth", "庚": "Metal", "辛": "Metal",
      "壬": "Water", "癸": "Water",
      "子": "Water", "丑": "Earth", "寅": "Wood", "卯": "Wood",
      "辰": "Earth", "巳": "Fire", "午": "Fire", "未": "Earth",
      "申": "Metal", "酉": "Metal", "戌": "Earth", "亥": "Water"
    };

    const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
    const counts = { Metal:0, Wood:0, Water:0, Fire:0, Earth:0 };

    pillars.forEach(p => {
      const [stem, branch] = p.split("");
      counts[elementMap[stem]]++;
      counts[elementMap[branch]]++;
    });

    const total = Object.values(counts).reduce((a,b)=>a+b,0);
    const percentages = {};
    Object.keys(counts).forEach(k => {
      percentages[k] = total ? Math.round(counts[k]/total*100) : 0;
    });

    // 找最少元素
    const leastElement = Object.entries(percentages).sort((a,b)=>a[1]-b[1])[0][0];

    // 水晶库
    const crystals = {
      "Fire": [
        { name: "Carnelian", desc: "增强勇气、动力和活力。" },
        { name: "Red Jasper", desc: "增强耐力和接地能力。" },
        { name: "Garnet", desc: "激发热情和能量。" },
        { name: "Sunstone", desc: "带来乐观和热情。" },
        { name: "Ruby", desc: "点燃爱情和个人力量。" }
      ],
      "Water": [
        { name: "Aquamarine", desc: "缓解情绪，增强直觉。" },
        { name: "Lapis Lazuli", desc: "鼓励智慧和自我表达。" },
        { name: "Sodalite", desc: "平衡情绪能量和洞察力。" },
        { name: "Blue Lace Agate", desc: "促进平静的沟通。" },
        { name: "Kyanite", desc: "对齐脉轮，清除阻塞。" }
      ],
      "Metal": [
        { name: "Hematite", desc: "稳定情绪，增强意志。" },
        { name: "Pyrite", desc: "带来财富和自信。" },
        { name: "Silver Obsidian", desc: "促进直觉和保护能量。" },
        { name: "Clear Quartz", desc: "增强清晰和专注。" },
        { name: "Selenite", desc: "净化心灵与空间。" }
      ],
      "Earth": [
        { name: "Tiger's Eye", desc: "带来勇气和决心。" },
        { name: "Citrine", desc: "提升活力和正能量。" },
        { name: "Smoky Quartz", desc: "清理负面能量。" },
        { name: "Yellow Jasper", desc: "帮助集中注意力。" },
        { name: "Picture Jasper", desc: "连接自然的能量。" }
      ],
      "Wood": [
        { name: "Green Aventurine", desc: "促进成长和繁荣。" },
        { name: "Moss Agate", desc: "带来稳定和平静。" },
        { name: "Malachite", desc: "支持情感转化。" },
        { name: "Amazonite", desc: "增强沟通与平衡。" },
        { name: "Jade", desc: "带来好运与和谐。" }
      ]
    };

    const crystalList = crystals[leastElement].map(c=>`- ${c.name}：${c.desc}`).join("\n");

    // 输出
    let message = "";

    if (language === "Chinese") {
      message = `
🌟 **您的个性化八字分析**

🪶 **风水大师的八字洞察**

您的八字：  
年柱：${yearPillar}  
月柱：${monthPillar}  
日柱：${dayPillar}  
时柱：${hourPillar}

五行分布：  
金：${percentages.Metal}%  
木：${percentages.Wood}%  
水：${percentages.Water}%  
火：${percentages.Fire}%  
土：${percentages.Earth}%

⸻

🌿 **五行平衡建议**

建议您关注${leastElement}元素的能量，增加相关色彩、食物或活动来支持身心平衡。

⸻

🌸 **疗愈大师的建议**

多做冥想，接触自然，使用色彩疗法（${leastElement}对应色系），以提升整体能量。

⸻

💎 **元素精灵的水晶推荐**

${crystalList}

⸻

🌈 **最后的鼓励**

请相信，您拥有独一无二的力量与潜能，愿每一步都走向幸福与平衡。
      `;
    } else {
      message = `
🌟 **Your Personalized BaZi Analysis**

🪶 **Feng Shui Insights**

Your pillars:  
Year: ${yearPillar}  
Month: ${monthPillar}  
Day: ${dayPillar}  
Hour: ${hourPillar}

Element Distribution:  
Metal: ${percentages.Metal}%  
Wood: ${percentages.Wood}%  
Water: ${percentages.Water}%  
Fire: ${percentages.Fire}%  
Earth: ${percentages.Earth}%

⸻

🌿 **Balance Recommendations**

Focus on enhancing your ${leastElement} element with colors, foods, and activities to restore balance.

⸻

🌸 **Healing Master Advice**

Try meditation, spend time in nature, and apply color therapy linked to the ${leastElement} element.

⸻

💎 **Recommended Crystals**

${crystalList}

⸻

🌈 **Final Encouragement**

Remember, you have unique strength and potential. May your journey be filled with balance and joy.
      `;
    }

    return res.status(200).json({ message });

  } catch (error) {
    console.error("BaZi Analysis error:", error);
    return res.status(500).json({ message: language === "Chinese" ? "⚠️ 无法生成八字分析。" : "⚠️ Failed to generate BaZi analysis." });
  }
};
