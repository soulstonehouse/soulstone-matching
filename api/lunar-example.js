// /api/lunar-example.js

export default function handler(req, res) {
  try {
    // 从请求体获取年月日
    const { year, month, day } = req.body;

    if (!year || !month || !day) {
      return res.status(400).json({ message: "❗ 请输入完整的日期 (year, month, day)" });
    }

    // 引入 lunar-javascript
    const { Solar } = require('lunar-javascript');

    // 创建 Solar 日期对象
    const solar = Solar.fromYmd(Number(year), Number(month), Number(day));

    // 转成 Lunar
    const lunar = solar.getLunar();

    // 返回农历信息
    res.status(200).json({
      message: `🌿 公历 ${year}-${month}-${day} 对应农历 ${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      lunarYear: lunar.getYear(),
      lunarMonth: lunar.getMonth(),
      lunarDay: lunar.getDay()
    });
  } catch (error) {
    console.error("Lunar API error:", error);
    res.status(500).json({ message: "⚠️ 无法计算农历，请检查输入" });
  }
}
