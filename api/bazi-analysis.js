const { Solar } = require("lunar-javascript");

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
    const hourPillar = lunar.getTimeGanZhi();

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
      "Wood": { "crystals":[
        { "name":"Green Aventurine","description":"Encourages growth, abundance, and vitality." },
        { "name":"Moss Agate","description":"Connects you with nature and stability." },
        { "name":"Malachite","description":"Promotes transformation and emotional balance." },
        { "name":"Amazonite","description":"Soothes the mind and enhances clear communication." },
        { "name":"Jade","description":"Brings harmony, prosperity, and good fortune." }
      ]},
      "Fire": { "crystals":[
        { "name":"Carnelian","description":"Boosts courage, motivation, and vitality." },
        { "name":"Red Jasper","description":"Strengthens stamina and grounding." },
        { "name":"Garnet","description":"Revitalizes passion and energy." },
        { "name":"Sunstone","description":"Brings optimism and enthusiasm." },
        { "name":"Ruby","description":"Ignites love and personal power." }
      ]},
      "Water": { "crystals":[
        { "name":"Aquamarine","description":"Soothes emotions and enhances intuition." },
        { "name":"Lapis Lazuli","description":"Encourages wisdom and self-expression." },
        { "name":"Sodalite","description":"Balances emotional energy and insight." },
        { "name":"Blue Lace Agate","description":"Promotes calm communication." },
        { "name":"Kyanite","description":"Aligns chakras and clears blockages." }
      ]},
      "Earth": { "crystals":[
        { "name":"Tiger's Eye","description":"Brings confidence and grounding." },
        { "name":"Citrine","description":"Manifests abundance and stability." },
        { "name":"Yellow Jasper","description":"Provides clarity and protection." },
        { "name":"Smoky Quartz","description":"Dispels negativity and anchors energy." },
        { "name":"Picture Jasper","description":"Connects to Earth's harmony." }
      ]},
      "Metal": { "crystals":[
        { "name":"Hematite","description":"Grounds and clarifies intention." },
        { "name":"Pyrite","description":"Attracts prosperity and shields negativity." },
        { "name":"Silver Obsidian","description":"Promotes self-awareness and protection." },
        { "name":"Clear Quartz","description":"Amplifies clarity and intention." },
        { "name":"Selenite","description":"Purifies and calms the mind." }
      ]}
    };

    // === 返回结果示例 ===
    return res.status(200).json({
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      percentages,
      crystals
    });

  } catch (error) {
    console.error("BaZi Analysis error:", error);
    return res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
};
