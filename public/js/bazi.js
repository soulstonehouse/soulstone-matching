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
      const response = await fetch("/bazi_ganzhi_table.json");
      const ganZhiData = await response.json();

      const [year, month, day] = birthday.split("-");
      const [hourStr] = birthtime.split(":");
      const hour = parseInt(hourStr, 10);

      // Year Pillar
      const yearPillar = ganZhiData.yearPillars[year] || "Unknown";

      // Month Pillar (fixed: convert '06' -> '6')
      const monthPillar = ganZhiData.monthPillars[String(parseInt(month, 10))] || "Unknown";

      // Hour Pillar
      let hourPillar = "Unknown";
      const hourKeys = Object.keys(ganZhiData.hourPillars)
        .map(h => parseInt(h))
        .sort((a, b) => a - b);
      for (const h of hourKeys) {
        if (hour >= h) {
          hourPillar = ganZhiData.hourPillars[String(h)];
        }
      }

      // Day Pillar (using 60 JiaZi table)
      const ganZhi60 = [
        "甲子","乙丑","丙寅","丁卯","戊辰","己巳","庚午","辛未","壬申","癸酉",
        "甲戌","乙亥","丙子","丁丑","戊寅","己卯","庚辰","辛巳","壬午","癸未",
        "甲申","乙酉","丙戌","丁亥","戊子","己丑","庚寅","辛卯","壬辰","癸巳",
        "甲午","乙未","丙申","丁酉","戊戌","己亥","庚子","辛丑","壬寅","癸卯",
        "甲辰","乙巳","丙午","丁未","戊申","己酉","庚戌","辛亥","壬子","癸丑",
        "甲寅","乙卯","丙辰","丁巳","戊午","己未","庚申","辛酉","壬戌","癸亥"
      ];
      const dayIndex = Math.floor(new Date(birthday).getTime() / (24 * 60 * 60 * 1000)) % 60;
      const dayPillar = ganZhi60[dayIndex];

      // Call backend
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
