document.addEventListener("DOMContentLoaded", () => {
  const resultDiv = document.getElementById("result");

  const analyzeBtn = document.createElement("button");
  analyzeBtn.textContent = "✨ Get Full BaZi Analysis & Crystal Matching";
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

    resultDiv.innerHTML = "🔮 Analyzing your BaZi chart and matching crystals... Please wait...";

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
          <p id="typed-response" style="white-space: pre-wrap;"></p>
        </div>
      `;

      typeWriter(message, "typed-response", 15);

    } catch (error) {
      console.error(error);
      resultDiv.innerHTML = "⚠️ An error occurred. Please try again.";
    }
  });

  // Append the button
  const container = document.querySelector(".soul-container");
  container.appendChild(analyzeBtn);
});

// Typing effect with smart line breaks
function typeWriter(text, elementId, delay = 25) {
  let i = 0;
  const target = document.getElementById(elementId);

  // Clean up extra line breaks and spacing
  const cleanText = text
    .trim()
    .replace(/\n{3,}/g, "\n\n")     // No more than 2 consecutive newlines
    .replace(/\n\n/g, "<br><br>")   // Double newline becomes paragraph break
    .replace(/\n/g, " ");           // Single newline becomes space (avoid mid-sentence linebreak)
  
  target.innerHTML = "";
  const interval = setInterval(() => {
    if (i < cleanText.length) {
      target.innerHTML += cleanText.charAt(i);
      i++;
    } else {
      clearInterval(interval);
    }
  }, delay);
}
