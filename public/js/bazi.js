document.addEventListener("DOMContentLoaded", () => {
  const resultDiv = document.getElementById("result");
  const analyzeBtn = document.getElementById("analyzeBtn");

  analyzeBtn.addEventListener("click", async () => {
    const yearPillar = document.getElementById("yearPillar").value;
    const monthPillar = document.getElementById("monthPillar").value;
    const dayPillar = document.getElementById("dayPillar").value;
    const hourPillar = document.getElementById("hourPillar").value;
    const gender = document.getElementById("gender").value;
    const language = document.getElementById("language").value;
    const metal = parseInt(document.getElementById("metal").value, 10) || 0;
    const wood = parseInt(document.getElementById("wood").value, 10) || 0;
    const water = parseInt(document.getElementById("water").value, 10) || 0;
    const fire = parseInt(document.getElementById("fire").value, 10) || 0;
    const earth = parseInt(document.getElementById("earth").value, 10) || 0;

    if (!yearPillar || !monthPillar || !dayPillar || !hourPillar || !gender) {
      resultDiv.innerHTML = "❗ 请填写所有必要信息。";
      return;
    }

    resultDiv.innerHTML = "🔮 正在分析您的八字，请稍候...";

    try {
      const response = await fetch("/api/bazi-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yearPillar,
          monthPillar,
          dayPillar,
          hourPillar,
          gender,
          language,
          percentages: {
            Metal: metal,
            Wood: wood,
            Water: water,
            Fire: fire,
            Earth: earth
          }
        })
      });

      const data = await response.json();
      const message = data.message || "✨ 分析已生成";

      resultDiv.innerHTML = `
        <div style="border:2px dashed #d7c9f7; border-radius:16px; padding:20px; background:#f9f7ff; text-align:left;">
          <pre style="white-space:pre-wrap; word-break:break-word; font-family:inherit;">${message}</pre>
          <div style="text-align:center; margin-top:20px;">
            <a href="https://yourstore.com/products" target="_blank"
               style="
                 display:inline-block;
                 padding:14px 40px;
                 background-color:#8c6eff;
                 color:#ffffff;
                 text-decoration:none;
                 border-radius:50px;
                 font-weight:600;
                 font-size:16px;
                 transition:background-color 0.3s;
               "
               onmouseover="this.style.backgroundColor='#7a5ee0'"
               onmouseout="this.style.backgroundColor='#8c6eff'">
              🛍️ SHOP ALL
            </a>
          </div>
        </div>
      `;
    } catch (error) {
      console.error(error);
      resultDiv.innerHTML = "⚠️ 出现错误，请稍后再试。";
    }
  });
});
