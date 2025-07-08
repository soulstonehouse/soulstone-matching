document.addEventListener("DOMContentLoaded", function () {
  const birthdayInput = document.getElementById("birthday");
  const birthtimeInput = document.getElementById("birthtime");
  const genderInput = document.getElementById("gender");
  const languageInput = document.getElementById("language");
  const resultDiv = document.getElementById("result");

  // 创建新的按钮
  const baziBtn = document.createElement("button");
  baziBtn.textContent = "🌟 Get BaZi Analysis";
  baziBtn.style.marginTop = "10px";
  baziBtn.style.backgroundColor = "#f58f7c";

  // 插入按钮
  const matchBtn = document.getElementById("matchBtn");
  matchBtn.insertAdjacentElement("afterend", baziBtn);

  // 监听点击
  baziBtn.addEventListener("click", async () => {
    const birthday = birthdayInput.value;
    const birthtime = birthtimeInput.value;
    const gender = genderInput.value;
    const language = languageInput.value;

    if (!birthday || !birthtime || !gender) {
      resultDiv.innerHTML = "❗ Please complete all fields before analysis.";
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

      resultDiv.innerHTML = `
        <div style="border: 2px dashed #d7c9f7; border-radius: 16px; padding: 20px; background: #f9f7ff; white-space: pre-wrap;">
          ${data.message}
        </div>
      `;
      window.scrollTo({
        top: resultDiv.offsetTop - 20,
        behavior: "smooth"
      });
    } catch (err) {
      resultDiv.innerHTML = "⚠️ Failed to get BaZi analysis.";
    }
  });
});
