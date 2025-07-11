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

    // 格式化并显示AI分析结果
    resultBox.innerHTML = `
      <div style="border:2px dashed #d7c9f7; border-radius:16px; padding:20px; background:#f9f7ff; text-align:left;">
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
