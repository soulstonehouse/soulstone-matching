document.getElementById("matchForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const birthdate = document.getElementById("birthdate").value;
  const birthtime = document.getElementById("birthtime").value;
  const language = document.getElementById("language").value;

  const resultBox = document.getElementById("result");
  resultBox.innerHTML = "<p>Matching in progress...</p>";

  try {
    const response = await fetch("/api/match-crystal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ birthdate, birthtime, language }),
    });

    const data = await response.json();
    if (!data.message) throw new Error("No message returned");

    // 显示 GPT 返回内容
    resultBox.innerHTML = `<p>${data.message.replace(/\n/g, "<br>")}</p>`;

    // 自动识别元素关键字
    const elementKeywords = ["Wood", "Fire", "Earth", "Metal", "Water", "Ice", "Thunder", "Light", "Darkness", "Wind"];
    const matchedElement = elementKeywords.find(el => data.message.includes(el));
    if (!matchedElement) return;

    // 加载 JSON 数据
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
    resultBox.innerHTML = "<p style='color:red;'>Sorry, something went wrong. Please try again later.</p>";
  }
});
