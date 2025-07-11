import { Solar } from "lunar-javascript";
import fetch from "node-fetch";

export default async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  if (!birthday || !birthtime || !gender || !language) {
    return res.status(400).json({ message: "❗ Missing required fields." });
  }

  try {
    // 解析生日
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
    const counts = { Metal: 0, Wood: 0, Water: 0, Fire: 0, Earth: 0 };
    pillars.forEach(pillar => {
      const [stem, branch] = pillar.split("");
      counts[elementMap[stem]]++;
      counts[elementMap[branch]]++;
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const percentages = {};
    Object.keys(counts).forEach(k => {
      percentages[k] = total ? Math.round(counts[k] / total * 100) : 0;
    });

    // 确定最缺元素
    const sortedElements = Object.entries(percentages).sort((a, b) => a[1] - b[1]);
    const lackingElement = sortedElements[0][0];

    // 晶石
    const crystals = {
      "Wood": [
        { name: "Green Aventurine", description: "Encourages growth and vitality." },
        { name: "Jade", description: "Brings harmony and prosperity." }
      ],
      "Fire": [
        { name: "Carnelian", description: "Boosts motivation and courage." },
        { name: "Sunstone", description: "Brings optimism and joy." }
      ],
      "Earth": [
        { name: "Tiger's Eye", description: "Provides grounding and protection." },
        { name: "Citrine", description: "Attracts abundance and confidence." }
      ],
      "Metal": [
        { name: "Pyrite", description: "Shields negativity and promotes willpower." },
        { name: "Hematite", description: "Enhances clarity and stability." }
      ],
      "Water": [
        { name: "Aquamarine", description: "Soothes emotions and enhances intuition." },
        { name: "Lapis Lazuli", description: "Encourages self-expression and wisdom." }
      ]
    };

    const recommendedCrystals = crystals[lackingElement];

    // 生成文本
    const report = `
🌟 您的个人八字分析

🪶 风水大师的八字洞察

您的四柱：
- 年柱：${yearPillar}
- 月柱：${monthPillar}
- 日柱：${dayPillar}
- 时柱：${hourPillar}

五行百分比：
${Object.entries(percentages).map(([el, pct]) => `- ${el}: ${pct}%`).join("\n")}

最缺元素：${lackingElement}

⸻

🌿 五行平衡建议

建议您多接触与 ${lackingElement} 元素相关的色彩、食物和环境，提升能量平衡。

⸻

🌸 疗愈大师建议

每天冥想5-10分钟，想象${lackingElement}元素的光芒环绕身体，恢复活力。

⸻

💎 推荐水晶 (${lackingElement}元素)

${recommendedCrystals.map(c => `- ${c.name}: ${c.description}`).join("\n")}

⸻

🌈 最后的鼓励

无论任何挑战，您都拥有改变和成长的力量。
`;

    res.status(200).json({ message: report });

  } catch (error) {
    console.error("BaZi Analysis error:", error);
    res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
}
