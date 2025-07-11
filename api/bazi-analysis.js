const { Solar } = require("lunar-javascript");
const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  const { birthday, birthtime, gender, language } = req.body;

  if (!birthday || !birthtime || !gender) {
    return res.status(400).json({ message: "❗ Missing required fields." });
  }

  try {
    // 日期解析
    const [year, month, day] = birthday.split("-").map(Number);
    const [hour, minute] = birthtime.split(":").map(Number);
    const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    const lunar = solar.getLunar();

    const yearPillar = lunar.getYearInGanZhi();
    const monthPillar = lunar.getMonthInGanZhi();
    const dayPillar = lunar.getDayInGanZhi();
    const hourPillar = lunar.getTimeGanZhiExact ? lunar.getTimeGanZhiExact() : lunar.getTimeGanZhi();

    const elementMap = {
      "甲": "Wood","乙": "Wood","丙": "Fire","丁": "Fire","戊": "Earth","己": "Earth",
      "庚": "Metal","辛": "Metal","壬": "Water","癸": "Water",
      "子": "Water","丑": "Earth","寅": "Wood","卯": "Wood","辰": "Earth",
      "巳": "Fire","午": "Fire","未": "Earth","申": "Metal","酉": "Metal","戌": "Earth","亥": "Water"
    };

    const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
    const counts = { Metal:0, Wood:0, Water:0, Fire:0, Earth:0 };
    pillars.forEach(pillar => {
      if (pillar && pillar.length === 2) {
        const [stem, branch] = pillar.split("");
        counts[elementMap[stem]]++;
        counts[elementMap[branch]]++;
      }
    });

    const total = Object.values(counts).reduce((a,b)=>a+b,0);
    const percentages = {};
    Object.keys(counts).forEach(k => {
      percentages[k] = total ? Math.round((counts[k]/total)*100) : 0;
    });

    // 组装prompt
    const prompt = `
You are a professional Feng Shui Master and Healing Therapist.
Generate a BaZi report in ${language}.
Always include all 5 sections:
- Feng Shui Insights
- Five Elements Suggestions
- Healing Master Suggestions
- Crystal Recommendations
- Final Encouragement

Format example:

🌟 Your Personalized BaZi Analysis

🪶 Feng Shui Master’s BaZi Insights
...

⸻

🌿 Five Elements Balancing Suggestions
...

⸻

🌸 Healing Master’s Suggestions
...

⸻

💎 Elemental Spirit’s Crystal Recommendation
...

⸻

🌈 Final Encouragement
...

User's BaZi Info:
Year Pillar: ${yearPillar}
Month Pillar: ${monthPillar}
Day Pillar: ${dayPillar}
Hour Pillar: ${hourPillar}

Gender: ${gender}
Language: ${language}

Five Element Percentages:
${Object.entries(percentages).map(([k,v])=>`${k}: ${v}%`).join("\n")}

Use the following crystal list if needed:
Metal:
- Hematite: Grounds and clarifies intention.
- Pyrite: Attracts prosperity and shields negativity.
- Silver Obsidian: Promotes self-awareness and protection.
- Clear Quartz: Amplifies clarity and intention.
- Selenite: Purifies and calms the mind.

Fire:
- Carnelian: Boosts courage and vitality.
...

(you can continue other elements here if desired)
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
          {
            role: "system",
            content: "You are a warm, supportive Feng Shui advisor."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    const json = await response.json();
    const message = json.choices?.[0]?.message?.content || "✨ Your analysis is ready.";

    return res.status(200).json({ message });

  } catch (err) {
    console.error("BaZi Analysis error:", err);
    return res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
};
