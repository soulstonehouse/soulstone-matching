document.getElementById("matchForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  // 收集表单数据
  const birthday = document.getElementById("birthdate").value;
  const birthtime = document.getElementById("birthtime").value;
  const gender = document.getElementById("gender").value;
  const language = document.getElementById("language").value;

  const resultBox = document.getElementById("result");
  resultBox.innerHTML = "<p>🔮 正在分析八字命盘，请稍候...</p>";

  try {
    // 调用后端API
    const response = await fetch("/api/bazi-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ birthday, birthtime, gender, language })
    });

    const data = await response.json();
    if (!data.message) throw new Error("没有返回分析结果");

    // 精灵插图链接
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

    const elementNameMap = {
      Wood: "木", Fire: "火", Earth: "土", Water: "水", Metal: "金",
      Wind: "风", Ice: "冰", Thunder: "雷", Light: "光", Darkness: "暗"
    };

    const matchedElement = data.dominantElement;
    const imageUrl = matchedElement ? elementImageMap[matchedElement] : "";
    const elementZh = elementNameMap[matchedElement] || matchedElement;

    // 显示分析内容 + 精灵图像
    resultBox.innerHTML = `
      <div style="border:2px dashed #d7c9f7; border-radius:16px; padding:20px; background:#f9f7ff; text-align:left;">
        ${imageUrl ? `
          <div style="text-align:center;">
            <img src="${imageUrl}" alt="${matchedElement} Spirit" style="width:120px; border-radius:16px; margin-bottom:8px; box-shadow:0 4px 12px rgba(0,0,0,0.1);" />
            <div style="font-weight:bold; font-size:16px; color:#5a4a91;">主属性：${elementZh}</div>
          </div>
        ` : ""}
        <pre style="white-space:pre-wrap; word-break:break-word; font-family:inherit; margin-top:16px;">${data.message}</pre>
      </div>
    `;

    // 加载匹配晶石（可选）
    if (matchedElement) {
      try {
        const jsonRes = await fetch("/element_crystal_mapping.json");
        const jsonData = await jsonRes.json();
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
      } catch (err) {
        console.warn("晶石加载失败：", err);
      }
    }

  } catch (err) {
    console.error(err);
    resultBox.innerHTML = "<p style='color:red;'>⚠️ 很抱歉，分析过程中发生错误，请稍后再试。</p>";
  }
});
