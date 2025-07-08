const elementSelect = document.getElementById("elementSelect");
const spiritImage = document.getElementById("spiritImage");
const chatBox = document.getElementById("chatBox");

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

// 页面加载时：自动显示精灵图
window.addEventListener("DOMContentLoaded", () => {
  const selected = elementSelect.value;
  if (spiritImageMap[selected]) {
    spiritImage.src = spiritImageMap[selected];
    spiritImage.style.display = "block";
  }
});

// 用户切换时：更新精灵图
elementSelect.addEventListener("change", () => {
  const selected = elementSelect.value;
  spiritImage.src = spiritImageMap[selected];
  spiritImage.style.display = "block";
});

// 提交聊天
document.getElementById("chatForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const element = elementSelect.value;
  const userMessage = document.getElementById("userInput").value.trim();
  if (!userMessage) return;

  appendMessage("user", userMessage);
  const thinkingBubble = appendMessage("spirit", "🔮 Thinking...");

  const prompt = `You are the ${element} spirit. Respond to the user warmly and with empathy, offering guidance and crystal wisdom. User: "${userMessage}"`;

  try {
    const res = await fetch("/api/match-crystal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        birthdate: "",
        birthtime: "",
        language: "English",
        promptOverride: prompt
      }),
    });

    const data = await res.json();
    const response = data.message || "🌀 The spirit is silent...";

    // 删除“Thinking...”并打字
    thinkingBubble.remove();
    typeWriter(response, appendMessage("spirit", ""), 25);
  } catch (err) {
    thinkingBubble.innerText = "⚠️ The spirit could not connect right now.";
  }

  document.getElementById("userInput").value = "";
});

// 添加消息气泡
function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.className = `chat-bubble ${sender}`;
  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
  return div;
}

// 打字效果
function typeWriter(text, targetDiv, delay = 25) {
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      targetDiv.innerText += text.charAt(i);
      chatBox.scrollTop = chatBox.scrollHeight; // 自动滚动
      i++;
    } else {
      clearInterval(interval);
    }
  }, delay);
}
