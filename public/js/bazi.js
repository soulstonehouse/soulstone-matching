document.addEventListener("DOMContentLoaded", () => {
  const resultDiv = document.getElementById("result");

  const analyzeBtn = document.createElement("button");
  analyzeBtn.id = "analyzeBtn";
  analyzeBtn.textContent = "✨ Get Your BaZi Analysis";
  analyzeBtn.style.marginTop = "20px";
  analyzeBtn.style.width = "100%";
  analyzeBtn.style.padding = "14px";
  analyzeBtn.style.fontSize = "16px";
  analyzeBtn.style.fontWeight = "bold";
  analyzeBtn.style.backgroundColor = "#8a6df1";
  analyzeBtn.style.color = "white";
  analyzeBtn.style.border = "none";
  analyzeBtn.style.borderRadius = "50px";
  analyzeBtn.style.cursor = "pointer";

  analyzeBtn.addEventListener("click", async () => {
    const birthday = document.getElementById("birthday").value;
    const birthtime = document.getElementById("birthtime").value;
    const language = document.getElementById("language").value;
    const gender = document.getElementById("gender").value;

    if (!birthday || !birthtime || !gender) {
      resultDiv.innerHTML = "❗ Please complete all fields.";
      return;
    }

    resultDiv.innerHTML = "🔮 Analyzing your BaZi chart and preparing your guidance... Please wait...";

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

      resultDiv.innerHTML = `
        <div style="border: 2px dashed #d7c9f7; border-radius: 16px; padding: 20px; background: #f9f7ff;">
          <p id="typed-response"></p>
        </div>
      `;

      typeWriter(message, "typed-response", 15);

    } catch (error) {
      console.error(error);
      resultDiv.innerHTML = "⚠️ An error occurred. Please try again.";
    }
  });

  const container = document.querySelector(".soul-container");
  container.appendChild(analyzeBtn);
});

function typeWriter(text, elementId, delay = 25) {
  let i = 0;
  const target = document.getElementById(elementId);
  target.innerHTML = "";
  const interval = setInterval(() => {
    if (i < text.length) {
      target.innerHTML += text.charAt(i);
      i++;
    } else {
      clearInterval(interval);
    }
  }, delay);
}
