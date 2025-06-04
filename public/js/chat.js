document.getElementById("chatForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const element = document.getElementById("elementSelect").value;
  const userMessage = document.getElementById("userInput").value;
  const chatBox = document.getElementById("chatBox");

  const prompt = `You are the ${element} spirit. Respond to the user warmly and with empathy, offering guidance and crystal wisdom. User: "${userMessage}"`;

  chatBox.innerHTML += `<div><strong>You:</strong> ${userMessage}</div>`;

  const res = await fetch("/api/match-crystal", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ birthdate: "", birthtime: "", language: "English", promptOverride: prompt }),
  });

  const data = await res.json();
  chatBox.innerHTML += `<div><strong>${element} Spirit:</strong> ${data.message}</div>`;
  document.getElementById("userInput").value = "";
});
