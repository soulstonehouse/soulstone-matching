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
你是一位资深的八字命理师和灵性疗愈师，请用温柔而鼓舞人心的语气，使用以下格式进行八字命理分析（全部使用中文）：

请严格按照以下结构生成回复，每一部分内容请写得有温度、有情感、像一位真实的疗愈老师在对话。

一、开场鼓励语（不少于3~5句话）：
欢迎用户来到这里，告诉她八字是一种自我了解的方式，是宇宙给予她的独特能量密码，鼓励她以开放的心态拥抱自己的命盘。可参考开头：
“亲爱的朋友，欢迎你来到这一段关于自己的能量探索之旅。你的八字就像一张宇宙赋予你的生命地图，记录着你与世界之间深深的连结。每一个天干地支，都是你灵魂的一部分。现在，请让我们一起温柔地走入这份命盘，倾听你内在的声音，发现你的光。”

二、四柱排盘：
年柱：${withPinyin(yearPillar)}
月柱：${withPinyin(monthPillar)}
日柱：${withPinyin(dayPillar)}
时柱：${withPinyin(hourPillar)}

三、五行比例：
${Object.entries(percentages).map(([el, val]) => {
  const zh = { Wood: "木", Fire: "火", Earth: "土", Metal: "金", Water: "水" }[el];
  return `${zh}：${val}%`;
}).join("\n")}

四、命理分析建议（每个五行请写完整一段话）：
请围绕主导五行展开描述，例如“你拥有丰富的木元素，这代表你是一个具有创造力与成长动力的人......”；
然后温柔地指出两个较弱五行对生活可能产生的影响，避免使用否定句，多用“你可能会感到……”或“有时你会发现自己……”等温和表达方式；
鼓励用户看到这些不是缺陷，而是成长的方向。

五、五行水晶推荐：
请写一段简洁说明：“以下是为你量身推荐的水晶疗愈石，能够在日常中支持你的能量平衡与内在稳定。”
${lowElements.map(el => {
  const zh = { Wood: "木", Fire: "火", Earth: "土", Metal: "金", Water: "水" }[el];
  return `【${zh}】五行推荐水晶：
${crystals[el].map(c => `- ${c.name}：${c.desc}`).join("\n")}`;
}).join("\n\n")}

六、结语祝福（不少于3~5句话）：
请写一段收尾话语，温柔肯定她的命格没有好坏，鼓励她与五行和平共处、持续觉察内在的流动与平衡，并感谢她来到这个空间。结尾署名请使用：

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

    res.status(200).json({ message: fullMessage, analysis });
  } catch (err) {
    console.error("BaZi Analysis error:", err);
    res.status(500).json({ message: "⚠️ Failed to generate BaZi analysis." });
  }
};
