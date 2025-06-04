
document.getElementById("matchBtn").addEventListener("click", async function () {
  const birthdate = document.getElementById("birthday").value;
  const birthtime = document.getElementById("birthtime").value;
  const language = document.getElementById("language").value;
  const resultDiv = document.getElementById("result");

  if (!birthdate || !birthtime) {
    resultDiv.innerHTML = "❗ Please fill in both birth date and time.";
    return;
  }

  resultDiv.innerHTML = "🌟 Matching your soul energy with the right crystal...";

  try {
    const response = await fetch("/api/match-crystal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        birthdate,
        birthtime,
        language
      })
    });

    const data = await response.json();
    resultDiv.innerHTML = data.message.replace(/\n/g, "<br>");
  } catch (error) {
    resultDiv.innerHTML = "❌ Sorry, something went wrong. Please try again later.";
    console.error(error);
  }
});
