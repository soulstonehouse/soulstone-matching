document.getElementById("matchBtn").addEventListener("click", async () => {
  const birthday = document.getElementById("birthday").value;
  const birthtime = document.getElementById("birthtime").value;
  const gender = document.getElementById("gender").value;
  const language = document.getElementById("language").value;
  const resultDiv = document.getElementById("result");

  if (!birthday || !birthtime || !gender || !language) {
    resultDiv.innerHTML = "❗ Please complete all fields.";
    return;
  }

  resultDiv.innerHTML = "🔮 Generating your BaZi analysis... Please wait...";

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
    resultDiv.innerHTML = data.message.replace(/\n\n/g, "<br><br>");
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "⚠️ Sorry, something went wrong. Please try again.";
  }
});
