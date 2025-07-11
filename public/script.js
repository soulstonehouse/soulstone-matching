document.getElementById("matchForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const birthday = document.getElementById("birthdate").value;
  const birthtime = document.getElementById("birthtime").value;
  const gender = document.getElementById("gender").value;
  const language = document.getElementById("language").value;

  const resultBox = document.getElementById("result");
  resultBox.innerHTML = "<p>🔮 正在分析八字命盘，请稍候...</p>";

  try {
    const response = await fetch("/api/bazi-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthday, birthtime, gender, language })
    });

    const data = await response.json();
    console.log("后端返回的数据:", data); // ✅ 调试输出

    if (!data.message) throw new Error("没有返回分析结果");

    const elementImageMap = {
      Wood: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/wood.png?v=1749121025",
      Fire: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/fire.png?v=1749120966",
      Earth: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/earth.png?v=1749121018",
      Water: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/water.png?v=1749120912",
      Metal: "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/metal.png?v=1749122654"
    };

    const matchedElement = data.dominantElement?.trim(); // ✅ 去除首尾空格
    const imageUrl = matchedElement && elementImageMap[matchedElement] ? elementImageMap[matchedElement] : "";

    console.log("识别的主元素:", matchedElement);       // ✅ 打印识别的元素
    console.log("匹配的图片链接:", imageUrl);             // ✅ 确认图片链接是否对

    resultBox.innerHTML = `
      <div style="border:2px dashed #d7c9f7; border-radius:16px; padding:20px; background:#f9f7ff; text-align:left;">
        ${imageUrl ? `<div style="text-align:center;"><img src="${imageUrl}" alt="${matchedElement} Spirit" style="width:120px; border-radius:16px; margin-bottom:16px; box-shadow:0 4px 12px rgba(0,0,0,0.1);" /></div>` : ""}
        <pre style="white-space:pre-wrap; word-break:break-word; font-family:inherit;">${data.message}</pre>
      </div>
    `;

    // 加载晶石推荐（可选）
    if (matchedElement) {
      const crystalRes = await fetch("/element_crystal_mapping.json");
      const jsonData = await crystalRes.json();
      const crystal = jsonData[matchedElement];

      if (crystal) {
        const crystalBox = document.createElement("div");
        crystalBox.innerHTML = `
          <div style="margin-top:20px; border-left:4px solid #ccc; padding-left:16px;">
            <h3>💎 精灵水晶推荐</h3>
            <p><strong>元素：</strong>${crystal.element}</p>
            <p><strong>水晶：</strong>${crystal.crystal}</p>
            <p>${crystal.description}</p>
            <p><a href="${crystal.link}" target="_blank">查看水晶商品</a></p>
          </div>
        `;
        resultBox.appendChild(crystalBox);
      }
    }

  } catch (err) {
    console.error("分析出错：", err);
    resultBox.innerHTML = "<p style='color:red;'>⚠️ 分析出错，请稍后再试。</p>";
  }
});
