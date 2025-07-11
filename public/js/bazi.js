document.addEventListener("DOMContentLoaded", () => {
  const resultDiv = document.getElementById("result");

  const analyzeBtn = document.getElementById("analyzeBtn");
  analyzeBtn.addEventListener("click", async () => {
    const birthday = document.getElementById("birthday").value; // yyyy-mm-dd
    const birthtime = document.getElementById("birthtime").value; // hh:mm
    const language = document.getElementById("language").value;
    const gender = document.getElementById("gender").value;

    if (!birthday || !birthtime || !gender) {
      resultDiv.innerHTML = "❗ Please complete all fields.";
      return;
    }

    resultDiv.innerHTML = "🔮 Analyzing your BaZi chart... Please wait...";

    try {
      // Load GanZhi table
      const tableResponse = await fetch("/bazi_ganzhi_table.json");
      const ganZhiData = await tableResponse.json();

      // Parse date
      const [year, month, day] = birthday.split("-");
      const [hourStr] = birthtime.split(":");
      const hour = parseInt(hourStr, 10);

      // Year Pillar
      const yearPillar = ganZhiData.yearPillars[year] || "未知";

      // Month Pillar
      const monthPillar = ganZhiData.monthPillars[month] || "未知";

      // Hour Pillar
      let hourPillar = "未知";
      const hourKeys = Object.keys(ganZhiData.hourPillars)
        .map(h => parseInt(h))
        .sort((a, b) => a - b);
      for (const h of hourKeys) {
        if (hour >= h) {
          hourPillar = ganZhiData.hourPillars[String(h)];
        }
      }

      // Day Pillar placeholder
      const dayPillar = "需进一步排盘";

      // Send to backend
      const apiResponse = await fetch("/api/bazi-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          yearPillar,
          monthPillar,
          dayPillar,
          hourPillar,
          gender,
          language
        })
      });

      const apiData = await apiResponse.json();
      const message = apiData.message || "✨ Your analysis is ready.";

      // Match main element from response text
      const elementMatch = message.match(/Metal|Wood|Water|Fire|Earth/);
      const mainElement = elementMatch ? elementMatch[0] : "Light";
      const spiritImageMap = {
        "Water": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/water.png",
        "Fire": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/fire.png",
        "Ice": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/ice.png",
        "Earth": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/earth.png",
        "Wood": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/wood.png",
        "Wind": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/wind.png",
        "Thunder": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/Thunder.png",
        "Light": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/light.png",
        "Darkness": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/darkness.png",
        "Metal": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/metal.png"
      };

      resultDiv.innerHTML = `
        <div style="border:2px dashed #d7c9f7; border-radius:16px; padding:20px; background:#f9f7ff; text-align:left;">
          <img src="${spiritImageMap[mainElement]}" alt="${mainElement} Spirit" style="max-width:120px; display:block; margin:0 auto 20px;">
          <pre style="white-space:pre-wrap; word-break:break-word; font-family:inherit;">${message}</pre>
        </div>
      `;
    } catch (error) {
      console.error(error);
      resultDiv.innerHTML = "⚠️ An error occurred. Please try again.";
    }
  });
});
