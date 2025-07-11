document.getElementById("matchForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // 采集表单输入
  const birthday = document.getElementById("birthdate").value;
  const birthtime = document.getElementById("birthtime").value;
  const gender = document.getElementById("gender").value;
  const language = document.getElementById("language").value;

  const resultBox = document.getElementById("result");
  resultBox.innerHTML = "<p>🔮 Analyzing your BaZi chart... Please wait...</p>";

  try {
    // 调用后端API
    const response = await fetch("/api/bazi-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthday, birthtime, gender, language })
    });

    const data = await response.json();
    if (!data.message) throw new Error("No message returned");

const elementImageMap = {
  Wood: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/wood.png?v=1749121025",
  Fire: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/fire.png?v=1749120966",
  Earth: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/earth.png?v=1749121018",
  Water: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/water.png?v=1749120912",
  Metal: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/metal.png?v=1749122654",
  Wind: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/wind.png?v=1749121176",
  Ice: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/ice.png?v=1749121020",
  Thunder: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/Thunder.png?v=1749121312",
  Light: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/light.png?v=1749121855",
  Darkness: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/darkness.png?v=1749122291"
};

const elementKeywords = Object.keys(elementImageMap);
const matchedElement = elementKeywords.find(el => data.message.includes(el));
const imageUrl = matchedElement ? elementImageMap[matchedElement] : "";

resultBox.innerHTML = `
  <div style="border:2px dashed #d7c9f7; border-radius:16px; padding:20px; background:#f9f7ff; text-align:left;">
    ${imageUrl ? `<div style="text-align:center;"><img src="${imageUrl}" alt="${matchedElement} Spirit" style="width:120px; border-radius:16px; margin-bottom:16px; box-shadow:0 4px 12px rgba(0,0,0,0.1);" /></div>` : ""}
    <pre style="white-space:pre-wrap; word-break:break-word; font-family:inherit;">${data.message}</pre>
  </div>
`;

    // 自动识别主要元素（可选）
    const elementKeywords = ["Wood", "Fire", "Earth", "Metal", "Water", "Ice", "Thunder", "Light", "Darkness", "Wind"];
    const matchedElement = elementKeywords.find(el => data.message.includes(el));
    if (!matchedElement) return;

    // 如果你仍希望加载本地JSON做增强（可选）
    const jsonRes = await fetch("/element_crystal_mapping.json");
    const jsonData = await jsonRes.json();
    const crystal = jsonData[matchedElement];

    if (crystal) {
      const crystalBox = document.createElement("div");
      crystalBox.innerHTML = `
        <h3>🔮 Element Match: ${crystal.element}</h3>
        <p><strong>Crystal:</strong> ${crystal.crystal}</p>
        <p>${crystal.description}</p>
        <p><a href="${crystal.link}" target="_blank">View Crystal Product</a></p>
      `;
      resultBox.appendChild(crystalBox);
    }

  } catch (err) {
    console.error(err);
    resultBox.innerHTML = "<p style='color:red;'>⚠️ Sorry, something went wrong. Please try again later.</p>";
  }
});
