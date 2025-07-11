const { Solar } = require("lunar-javascript");

module.exports = async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  if (!birthday || !birthtime || !gender) {
    return res.status(400).json({ message: "❗ Missing required fields." });
  }

  try {
    // 解析日期和时间
    const [year, month, day] = birthday.split("-").map(Number);
    const [hour, minute] = birthtime.split(":").map(Number);
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();

    // 推算四柱
    const yearPillar = lunar.getYearInGanZhi();
    const monthPillar = lunar.getMonthInGanZhi();
    const dayPillar = lunar.getDayInGanZhi();
    const hourPillar = lunar.getTimeZhi(); // 不用 getTimeGanZhi 以避免错误

    // 五行映射
    const elementMap = {
      "甲": "Wood", "乙": "Wood",
      "丙": "Fire", "丁": "Fire",
      "戊": "Earth", "己": "Earth",
      "庚": "Metal", "辛": "Metal",
      "壬": "Water", "癸": "Water",
      "子": "Water", "丑": "Earth",
      "寅": "Wood", "卯": "Wood",
      "辰": "Earth", "巳": "Fire",
      "午": "Fire", "未": "Earth",
      "申": "Metal", "酉": "Metal",
      "戌": "Earth", "亥": "Water"
    };

    const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
    const counts = { Metal:0, Wood:0, Water:0, Fire:0, Earth:0 };
    pillars.forEach(pillar => {
      const [stem, branch] = pillar.split("");
      if (elementMap[stem]) counts[elementMap[stem]]++;
      if (elementMap[branch]) counts[elementMap[branch]]++;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const percentages = {};
    Object.keys(counts).forEach(k => {
      percentages[k] = total ? Math.round((counts[k] / total) * 100) : 0;
    });

    const crystals = {
      Fire: {
        crystals: [
          { name: "Carnelian", description: "增强勇气、动力和活力。" },
          { name: "Red Jasper", description: "增强耐力和接地能力。" },
          { name: "Garnet", description: "激发热情和能量。" },
          { name: "Sunstone", description: "带来乐观和热情。" },
          { name: "Ruby", description: "点燃爱情和个人力量。" }
        ]
      },
      Metal: {
        crystals: [
          { name: "Hematite", description: "增强清晰与专注。" },
          { name: "Pyrite", description: "吸引繁荣并屏蔽负能量。" },
          { name: "Silver Obsidian", description: "促进自我意识与保护。" },
          { name: "Clear Quartz", description: "提升意图与清晰度。" },
          { name: "Selenite", description: "净化和平静思绪。" }
        ]
      },
      Wood: {
        crystals: [
          { name: "Green Aventurine", description: "促进成长与活力。" },
          { name: "Moss Agate", description: "连接自然与稳定。" },
          { name: "Malachite", description: "支持转化和平衡。" },
          { name: "Amazonite", description: "舒缓心灵并加强沟通。" },
          { name: "Jade", description: "带来和谐与繁荣。" }
        ]
      },
      Water: {
        crystals: [
          { name: "Aquamarine", description: "增强直觉并安抚情绪。" },
          { name: "Lapis Lazuli", description: "促进智慧与自我表达。" },
          { name: "Sodalite", description: "平衡情绪能量。" },
          { name: "Blue Lace Agate", description: "促进平和沟通。" },
          { name: "Kyanite", description: "清理阻塞与校准能量。" }
        ]
      },
      Earth: {
        crystals: [
          { name: "Tiger's Eye", description: "带来自信与稳定。" },
          { name: "Citrine", description: "增强财富与稳定。" },
          { name: "Yellow Jasper", description: "提供清晰与保护。" },
          { name: "Smoky Quartz", description: "排除负能量并锚定能量。" },
          { name: "Picture Jasper", description: "与大地的和谐连接。" }
        ]
      }
    };

    const entries = Object.entries(percentages);
    const sorted = entries.sort((a, b) => a[1] - b[1]);
    const lackingElement = sorted[0][0];
    const recommendedCrystals = crystals[lackingElement]?.crystals || [];

    let message = "";

    if (language === "Chinese") {
      message = `
🌟 **您的个性化八字分析**

🪶 **风水大师的八字洞察**

您的八字：年柱${yearPillar}，月柱${monthPillar}，日柱${dayPillar}，时柱${hourPillar}。
五行分布为：${entries.map(([k, v]) => `${k}: ${v}%`).join("，")}。
其中${lackingElement}元素相对较弱，需要关注能量平衡。

⸻

🌿 **五行平衡建议**

建议您在日常生活中多接触与${lackingElement}相关的事物和环境，例如调整居家风水、佩戴对应色彩饰品或增加相关植物。

⸻

🌸 **疗愈大师的建议**

尝试冥想与色彩疗法，将${lackingElement}元素色系（如红色、绿色等）融入生活中，帮助恢复平衡与活力。

⸻

💎 **元素精灵的水晶推荐**

${recommendedCrystals.map(c => `- ${c.name}：${c.description}`).join("\n")}

⸻

🌈 **最后的鼓励**

请相信，您拥有独一无二的力量。愿每一次努力都引领您走向更平衡、更幸福的未来。
      `.trim();
    } else {
      message = `
🌟 **Your Personalized BaZi Analysis**

🪶 **Feng Shui Master's Insights**

Your BaZi chart:
Year Pillar: ${yearPillar}, Month: ${monthPillar}, Day: ${dayPillar}, Hour: ${hourPillar}.
Element distribution: ${entries.map(([k, v]) => `${k}: ${v}%`).join(", ")}.
The ${lackingElement} element is relatively low and deserves your attention.

⸻

🌿 **Five Elements Balancing Suggestions**

Incorporate more ${lackingElement}-related activities and colors in your environment to restore balance.

⸻

🌸 **Healing Master's Advice**

Consider meditation and color therapy. Warm tones and intentional practices will help you regain vitality.

⸻

💎 **Elemental Spirit's Crystal Recommendations**

${recommendedCrystals.map(c => `- ${c.name}: ${c.description}`).join("\n")}

⸻

🌈 **Final Encouragement**

Remember: you hold unique power within. May your journey ahead be filled with balance and joy.
      `.trim();
    }

    return res.status(200).json({ message });

  } catch (error) {
    console.error("BaZi Analysis error:", error);
    return res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
};
