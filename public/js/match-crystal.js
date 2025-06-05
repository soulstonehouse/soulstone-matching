// 精灵图片映射
const spiritImageMap = {
  "Water": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/water.png?v=1749120912",
  "Fire": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/fire.png?v=1749120966",
  "Ice": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/ice.png?v=1749121020",
  "Earth": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/earth.png?v=1749121018",
  "Wood": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/wood.png?v=1749121025",
  "Wind": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/wind.png?v=1749121176",
  "Thunder": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/Thunder.png?v=1749121312",
  "Light": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/light.png?v=1749121855",
  "Darkness": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/darkness.png?v=1749122291",
  "Metal": "https://cdn.shopify.com/s/files/1/0649/0233/2586/files/metal.png?v=1749122654"
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
