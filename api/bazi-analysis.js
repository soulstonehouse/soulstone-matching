// api/bazi-analysis.js
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
      "甲": "Wood", "乙": "Wood", "丙": "Fire", "丁": "Fire", "戊": "Earth", "己": "Earth",
      "庚": "Metal", "辛": "Metal", "壬": "Water", "癸": "Water",
      "子": "Water", "丑": "Earth", "寅": "Wood", "卯": "Wood", "辰": "Earth", "巳": "Fire",
      "午": "Fire", "未": "Earth", "申": "Metal", "酉": "Metal", "戌": "Earth", "亥": "Water"
    };

    const pinyinMap = {
      "甲": "jiǎ", "乙": "yǐ", "丙": "bǐng", "丁": "dīng", "戊": "wù", "己": "jǐ",
      "庚": "gēng", "辛": "xīn", "壬": "rén", "癸": "guǐ",
      "子": "zǐ", "丑": "chǒu", "寅": "yín", "卯": "mǎo", "辰": "chén", "巳": "sì",
      "午": "wǔ", "未": "wèi", "申": "shēn", "酉": "yǒu", "戌": "xū", "亥": "hài"
    };

    function withPinyin(pillar) {
      return pillar.split("").map(c => `${c} (${pinyinMap[c] || ""})`).join(" ");
    }

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
      percentages[k] = total ? Math.round((counts[k] / total) * 100) : 0;
    });

    const crystals = {
      "Wood": [
        { name: "Green Aventurine", desc: "Encourages growth and vitality." },
        { name: "Moss Agate", desc: "Promotes grounding and stability." },
        { name: "Malachite", desc: "Supports transformation and balance." },
        { name: "Amazonite", desc: "Improves communication and calmness." },
        { name: "Jade", desc: "Brings harmony and prosperity." }
      ],
      "Fire": [
        { name: "Carnelian", desc: "Boosts motivation and courage." },
        { name: "Red Jasper", desc: "Enhances endurance and strength." },
        { name: "Garnet", desc: "Revives passion and energy." },
        { name: "Sunstone", desc: "Inspires joy and leadership." },
        { name: "Ruby", desc: "Energizes love and confidence." }
      ],
      "Water": [
        { name: "Aquamarine", desc: "Calms the mind and emotions." },
        { name: "Lapis Lazuli", desc: "Fosters wisdom and truth." },
        { name: "Sodalite", desc: "Balances mental clarity and peace." },
        { name: "Blue Lace Agate", desc: "Soothes stress and enhances communication." },
        { name: "Kyanite", desc: "Aligns energy and intuition." }
      ],
      "Earth": [
        { name: "Tiger's Eye", desc: "Builds confidence and grounding." },
        { name: "Citrine", desc: "Attracts abundance and stability." },
        { name: "Yellow Jasper", desc: "Encourages clarity and protection." },
        { name: "Smoky Quartz", desc: "Dispels negativity." },
        { name: "Picture Jasper", desc: "Connects to Earth’s wisdom." }
      ],
      "Metal": [
        { name: "Hematite", desc: "Provides protection and focus." },
        { name: "Pyrite", desc: "Encourages confidence and prosperity." },
        { name: "Silver Obsidian", desc: "Enhances self-awareness and shielding." },
        { name: "Clear Quartz", desc: "Amplifies intentions and clarity." },
        { name: "Selenite", desc: "Cleanses and elevates energy." }
      ]
    };

    const sorted = Object.entries(percentages).sort((a, b) => a[1] - b[1]);
    const dominantElement = Object.entries(percentages).sort((a, b) => b[1] - a[1])[0][0];
    const lackingElements = sorted.slice(0, 2).map(([el]) => el);

    const crystalText = lackingElements.map(el => {
      const list = crystals[el]
        .map(c => `- ${c.name}: ${c.desc}`)
        .join("\n");
      return `Crystals to support ${el}:\n${list}`;
    }).join("\n\n");

    const prompt = `
Your BaZi chart has been analyzed based on your birth information.

Four Pillars:
Year Pillar: ${withPinyin(yearPillar)}
Month Pillar: ${withPinyin(monthPillar)}
Day Pillar: ${withPinyin(dayPillar)}
Hour Pillar: ${withPinyin(hourPillar)}

Five Element Distribution:
${Object.entries(percentages).map(([el, val]) => `${el}: ${val}%`).join("\n")}

Your dominant element is ${dominantElement}.
Your weakest elements are: ${lackingElements.join(" and ")}.

${crystalText}

Please generate a warm, inspiring message in English only. 
End the letter with: "Your friend, ${dominantElement} Spirit".
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content: "You are a kind and encouraging spiritual guide who interprets BaZi for energy healing."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const json = await openaiRes.json();
    const message = json.choices?.[0]?.message?.content || "✨ BaZi reading generated.";
    res.status(200).json({ message });

  } catch (err) {
    console.error("BaZi Analysis error:", err);
    res.status(500).json({ message: "⚠️ Failed to generate BaZi reading." });
  }
};
