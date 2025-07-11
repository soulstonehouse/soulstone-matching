const { Solar } = require("lunar-javascript");

module.exports = async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  if (!birthday || !birthtime || !gender) {
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
      "甲": "Wood", "乙": "Wood",
      "丙": "Fire", "丁": "Fire",
      "戊": "Earth", "己": "Earth",
      "庚": "Metal", "辛": "Metal",
      "壬": "Water", "癸": "Water",
      "子": "Water", "丑": "Earth", "寅": "Wood", "卯": "Wood",
      "辰": "Earth", "巳": "Fire", "午": "Fire", "未": "Earth",
      "申": "Metal", "酉": "Metal", "戌": "Earth", "亥": "Water"
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

    const lackingElement = Object.entries(percentages).sort((a, b) => a[1] - b[1])[0][0];

    const crystalMap = {
      "Wood": "Green Aventurine, Moss Agate",
      "Fire": "Carnelian, Sunstone",
      "Water": "Aquamarine, Lapis Lazuli",
      "Earth": "Tiger's Eye, Citrine",
      "Metal": "Hematite, Pyrite"
    };

    const message = `
🌟 **Your Personalized BaZi Analysis**

🪶 **Pillars:**
Year: ${yearPillar}, Month: ${monthPillar}, Day: ${dayPillar}, Hour: ${hourPillar}

🌿 **Element Percentages:**
${Object.entries(percentages).map(([k, v]) => `${k}: ${v}%`).join(", ")}

💎 **Recommended Crystals for ${lackingElement}:**
${crystalMap[lackingElement]}
`;

    return res.status(200).json({ message });

  } catch (error) {
    console.error("BaZi Analysis error:", error);
    return res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
};
