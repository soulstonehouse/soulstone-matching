// 精灵图片映射
const spiritImageMap = {
  "Wood": "/images/spirit-wood.png",
  "Fire": "/images/spirit-fire.png",
  "Earth": "/images/spirit-earth.png",
  "Metal": "/images/spirit-metal.png",
  "Water": "/images/spirit-water.png",
  "Ice": "/images/spirit-ice.png",
  "Thunder": "/images/spirit-thunder.png",
  "Light": "/images/spirit-light.png",
  "Darkness": "/images/spirit-darkness.png",
  "Wind": "/images/spirit-wind.png"
};

document.getElementById('matchBtn').addEventListener('click', async () => {
  const birthday = document.getElementById('birthday').value;
  const birthtime = document.getElementById('birthtime').value;
  const language = document.getElementById('language').value;
  const resultDiv = document.getElementById('result');

  if (!birthday || !birthtime) {
    resultDiv.innerHTML = '❗ Please enter both birth date and time.';
    return;
  }

  resultDiv.innerHTML = '🔮 Matching your crystal... Please wait...';

  const month = new Date(birthday).getMonth() + 1;
  let element = 'Wood';

  if ([3, 4].includes(month)) element = 'Wood';
  else if ([5, 6].includes(month)) element = 'Fire';
  else if ([7, 8].includes(month)) element = 'Earth';
  else if ([9, 10].includes(month)) element = 'Metal';
  else if ([11, 12].includes(month)) element = 'Water';
  else if (month === 1) element = 'Ice';
  else if (month === 2) element = 'Thunder';

  const spiritLabel = element + " Spirit";
  const spiritImage = spiritImageMap[element] || "/images/default.png";

  let crystalInfo = {};
  try {
    const response = await fetch('/element_crystal_mapping.json');
    const data = await response.json();
    crystalInfo = data[element] || {};
  } catch (e) {
    resultDiv.innerHTML = '❌ Failed to load crystal data.';
    return;
  }

  let gptReply = {};
  try {
    const response = await fetch('/api/match-crystal.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthday, birthtime, language, element })
    });
    gptReply = await response.json();
  } catch (e) {
    resultDiv.innerHTML = '⚠️ GPT request failed.';
    return;
  }

  resultDiv.innerHTML = `
    <div style="border: 2px dashed #d7c9f7; border-radius: 16px; padding: 20px; background: #f9f7ff;">
      <h3>🧝‍♀️ Your Element: ${element}</h3>
      <img src="${spiritImage}" alt="${element} Spirit" style="max-width: 100px; margin: 10px 0;">
      <p><strong>Crystal:</strong> ${crystalInfo.crystal || 'Unknown'}</p>
      <p><strong>About:</strong> ${crystalInfo.description || 'No description available.'}</p>
      <p><strong>Message from your Spirit:</strong></p>
      <p id="typed-response"></p>
      ${crystalInfo.link ? `<p><a href="${crystalInfo.link}" target="_blank">🛒 View Product</a></p>` : ''}
    </div>
  `;

  const typeWriter = (text, elementId, delay = 25) => {
    let i = 0;
    const target = document.getElementById(elementId);
    const interval = setInterval(() => {
      if (i < text.length) {
        target.innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(interval);
      }
    }, delay);
  };

  typeWriter(gptReply.message || "Your crystal reflects your soul.", "typed-response");
});
