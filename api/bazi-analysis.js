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

    const withPinyin = (pillar) =>
      pillar.split("").map(c => `${c} (${pinyinMap[c] || ""})`).join(" ");

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

    const dominantElement = Object.entries(percentages).sort((a, b) => b[1] - a[1])[0][0];
    const lowElements = Object.entries(percentages)
      .filter(([_, val]) => val < 25)
      .map(([el]) => el);

    const crystals = {
      "Wood": [
        { name: "Green Aventurine", desc: "Encourages growth, abundance, and vitality." },
        { name: "Moss Agate", desc: "Connects you with nature and stability." },
        { name: "Malachite", desc: "Promotes transformation and emotional balance." },
        { name: "Amazonite", desc: "Soothes the mind and enhances clear communication." },
        { name: "Jade", desc: "Brings harmony, prosperity, and good fortune." }
      ],
      "Fire": [
        { name: "Carnelian", desc: "Boosts courage, motivation, and vitality." },
        { name: "Red Jasper", desc: "Strengthens stamina and grounding." },
        { name: "Garnet", desc: "Revitalizes passion and energy." },
        { name: "Sunstone", desc: "Brings optimism and enthusiasm." },
        { name: "Ruby", desc: "Ignites love and personal power." }
      ],
      "Water": [
        { name: "Aquamarine", desc: "Soothes emotions and enhances intuition." },
        { name: "Lapis Lazuli", desc: "Encourages wisdom and self-expression." },
        { name: "Sodalite", desc: "Balances emotional energy and insight." },
        { name: "Blue Lace Agate", desc: "Promotes calm communication." },
        { name: "Kyanite", desc: "Aligns chakras and clears blockages." }
      ],
      "Earth": [
        { name: "Tiger's Eye", desc: "Brings confidence and grounding." },
        { name: "Citrine", desc: "Manifests abundance and stability." },
        { name: "Yellow Jasper", desc: "Provides clarity and protection." },
        { name: "Smoky Quartz", desc: "Dispels negativity and anchors energy." },
        { name: "Picture Jasper", desc: "Connects to Earth's harmony." }
      ],
      "Metal": [
        { name: "Hematite", desc: "Grounds and clarifies intention." },
        { name: "Pyrite", desc: "Attracts prosperity and shields negativity." },
        { name: "Silver Obsidian", desc: "Promotes self-awareness and protection." },
        { name: "Clear Quartz", desc: "Amplifies clarity and intention." },
        { name: "Selenite", desc: "Purifies and calms the mind." }
      ]
    };

let prompt = "";

if (language.toLowerCase().includes("zh") || language === "中文" || language === "Chinese") {
  // 中文 Prompt
prompt = `
你是一位温柔、有智慧的八字命理师和灵性疗愈导师，请用中文写一段完整、有情感、有层次的八字命理分析信件，内容温和亲切、语言有流动性，不使用“一、二、三、四”或任何硬式分段标题。请按照以下结构隐性展开（但不要标注编号）：

1. 开场请以 3~5 句话温柔地欢迎对方，比如：“欢迎你来到这段探索自我能量的旅程……”，传达疗愈感与温暖感。

2. 引导对方了解她的四柱命盘（使用拼音），表达这是一种连接天地与个体的智慧方式，内容自然嵌入，如：“从八字来看，你的年柱是……，这是你与出生那年能量的连接……”

3. 接着写出她的五行分布百分比（使用“木：38%”的风格即可），自然过渡成分析，比如“从五行来看，你的木最旺……”

4. 分析主导五行的特质，用温柔语气鼓励她发挥这部分能量；再自然带出五行中较弱的部分及可能带来的体验，例如“你的金元素暂时缺席，可能让你在人际边界或果断决策中感到挑战……”

5. 然后引出水晶疗愈建议，例如：“在日常生活中，水晶是一种温柔而有效的能量支持……为你推荐如下水晶来陪伴你较弱的能量……”

${lowElements.map(el => {
  const zh = { Wood: "木", Fire: "火", Earth: "土", Metal: "金", Water: "水" }[el];
  return `与【${zh}】五行对应的水晶包括：
${crystals[el].map(c => `- ${c.name}：${c.desc}`).join("\n")}`;
}).join("\n\n")}

6. 结尾部分请写一段感性的话语，例如：
“你的命盘没有好坏，只有与生俱来的节奏与方向。愿你在理解自己的过程中，更加接纳内在的流动，与宇宙和谐共振。”

请务必以如下文字作为落款结尾（这是必须出现的最后一行）：

你的朋友，  
${{ Wood: "木", Fire: "火", Earth: "土", Metal: "金", Water: "水" }[dominantElement]}之灵
`.trim();
} else {
  // English Prompt（原样保留）
  prompt = `
You are a BaZi master and spiritual guide. Please respond only in English and follow this structure:

Four Pillars:
Year Pillar: ${withPinyin(yearPillar)}
Month Pillar: ${withPinyin(monthPillar)}
Day Pillar: ${withPinyin(dayPillar)}
Hour Pillar: ${withPinyin(hourPillar)}

Five Element Percentages:
${Object.entries(percentages).map(([el, val]) => `${el}: ${val}%`).join("\n")}

Then write a warm, empowering letter including:
- Highlight dominant element: ${dominantElement}
- Discuss elements under 25%: ${lowElements.join(", ") || "None"}
- Recommend 5 crystals for each weak element
End with:
Your friend,
${dominantElement} Spirit
  `.trim();
}

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
          { role: "system", content: "You are a kind, wise BaZi interpreter and spiritual coach." },
          { role: "user", content: prompt }
        ]
      })
    });

    const json = await openaiRes.json();
    const gptMessage = json.choices?.[0]?.message?.content || "✨ Analysis complete.";

    const introHeader = `
=== Four Pillars ===
Year Pillar: ${withPinyin(yearPillar)}
Month Pillar: ${withPinyin(monthPillar)}
Day Pillar: ${withPinyin(dayPillar)}
Hour Pillar: ${withPinyin(hourPillar)}

=== Five Element Percentages ===
${Object.entries(percentages).map(([el, val]) => `${el}: ${val}%`).join("\n")}

`.trim();

    const fullMessage = `${introHeader}\n\n${gptMessage}`;

    const analysis = {
      fourPillars: {
        year: withPinyin(yearPillar),
        month: withPinyin(monthPillar),
        day: withPinyin(dayPillar),
        hour: withPinyin(hourPillar)
      },
      elementPercentages: percentages,
      dominantElement,
      weakElements: lowElements,
      recommendedCrystals: Object.fromEntries(
        lowElements.map(el => [el, crystals[el]])
      )
    };

res.status(200).json({ 
  message: fullMessage,
  dominantElement, // ✅ 新增这句给前端用
  analysis
});
  } catch (err) {
    console.error("BaZi Analysis error:", err);
    res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
};
