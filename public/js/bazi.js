document.addEventListener("DOMContentLoaded", () => {
  const resultDiv = document.getElementById("result");

  const analyzeBtn = document.getElementById("analyzeBtn");
  analyzeBtn.addEventListener("click", async () => {
    const birthday = document.getElementById("birthday").value;
    const birthtime = document.getElementById("birthtime").value;
    const language = document.getElementById("language").value;
    const gender = document.getElementById("gender").value;

    if (!birthday || !birthtime || !gender) {
      resultDiv.innerHTML = "❗ Please complete all fields.";
      return;
    }

    resultDiv.innerHTML = "🔮 Analyzing your BaZi chart... Please wait...";

    try {
      const response = await fetch("/api/bazi-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthday,
          birthtime,
          gender,
          language
        })
      });

      const data = await response.json();
      const message = data.message || "✨ Your analysis is ready.";

      // Find main element for image (simulate: if Metal > Wood > Water, show Metal image)
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
