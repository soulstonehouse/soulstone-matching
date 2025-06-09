const elementSelect = document.getElementById("elementSelect");
const spiritImage = document.getElementById("spiritImage");
const chatBox = document.getElementById("chatBox");

// 显示对应精灵图
const spiritImageMap = {
  "Water": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/water.png",
  "Fire": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/fire.png",
  "Ice": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/ice.png",
  "Earth": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/earth.png",
  "Wood": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/wood.png",
  "Wind": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/wind.png",
  "Thunder": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/Thunder.png",
  "Light": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/light.png",
  "Darkness": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/darkness.png",
  "Metal": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/metal.png"
};

// 初次设置精灵图
elementSelect.addEventListener("change", () => {
  const selected = elementSelect.value;
  spiritImage.src = spiritImageMap[selected];
  spiritImage.style.display = "block";
});

// 提交聊天
document.getElementById("chatForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const element = elementSelect.value;
  const userMessage = document.getElementById("userInput").value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);

  const prompt = `You are the ${element} spirit. Respond to the user warmly and with empathy, offering guidance and crystal wisdom. User: "${userMessage}"`;

  appendMessage("spirit", "🔮 Thinking...");

  try {
    const res = await fetch("/api/match-crystal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        birthdate: "", birthtime: "", language: "English",
        promptOverride: prompt
      }),
    });

    const data = await res.json();
    const response = data.message || "🌀 The spirit is silent...";
    updateLastSpiritMessage(response);
  } catch (err) {
    updateLastSpiritMessage("⚠️ The spirit could not connect right now.");
  }

  document.getElementById("userInput").value = "";
});

function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.className = `chat-bubble ${sender}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function updateLastSpiritMessage(text) {
  const bubbles = chatBox.getElementsByClassName("chat-bubble spirit");
  if (bubbles.length > 0) {
    bubbles[bubbles.length - 1].innerText = text;
  }
}
