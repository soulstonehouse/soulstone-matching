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

  const spiritLabelMap = {
    Water: "💧 Message from the Water Spirit",
    Fire: "🔥 Message from the Fire Spirit",
    Wood: "🌿 Whisper from the Wood Spirit",
    Earth: "⛰️ Grounded Words from the Earth Spirit",
    Metal: "⚔️ Clarity from the Metal Spirit",
    Ice: "❄️ Silence of the Ice Spirit",
    Thunder: "⚡ Thunder Spirit's Insight",
    Light: "✨ Blessing of the Light Spirit",
    Darkness: "🌑 Reflection of the Shadow Spirit",
    Wind: "🌬️ Guidance from the Wind Spirit"
  };

  const spiritImageMap = {
    Water: "/images/water-spirit.png",
    Fire: "/images/fire-spirit.png",
    Wood: "/images/wood-spirit.png",
    Earth: "/images/earth-spirit.png",
    Metal: "/images/metal-spirit.png",
    Ice: "/images/ice-spirit.png",
    Thunder: "/images/thunder-spirit.png",
    Light: "/images/light-spirit.png",
    Darkness: "/images/shadow-spirit.png",
    Wind: "/images/wind-spirit.png"
  };

  const spiritLabel = spiritLabelMap[element] || "✨ Message from your Spirit Guide";
  const spiritImage = spiritImageMap[element] || "/images/default-spirit.png";

  let crystalInfo = {};
  try {
    const response = await fetch('/element_crystal_mapping.json');
    const data = await response.json();
    crystalInfo = data[element] || {};
  } catch (error) {
    resultDiv.innerHTML = '❌ Failed to load crystal data.';
    return;
  }

  let gptReply = {};
  try {
    const response = await fetch('/api/match-crystal.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        birthday, birthtime, language, element
      })
    });
    gptReply = await response.json();
  } catch (error) {
    resultDiv.innerHTML = '⚠️ GPT connection failed. Please try again.';
    return;
  }

  const container = document.createElement('div');
  container.style.border = '2px dashed #d7c9f7';
  container.style.borderRadius = '16px';
  container.style.padding = '20px';
  container.style.background = '#f9f7ff';

  container.innerHTML = `
    <h3>🧝‍♀️ Your Element: ${element}</h3>
    <img src="${spiritImage}" alt="${element} Spirit" style="max-width: 100px; margin: 10px 0;">
    <p><strong>Crystal:</strong> ${crystalInfo.crystal || 'Unknown'}</p>
    <p><strong>About:</strong> ${crystalInfo.description || 'No description available.'}</p>
    <p style="margin-top: 16px;"><strong>${spiritLabel}:</strong></p>
    <p id="typed-response"></p>
    ${crystalInfo.link ? `<p><a href="${crystalInfo.link}" target="_blank">🛒 View Product</a></p>` : ''}
  `;

  resultDiv.innerHTML = '';
  resultDiv.appendChild(container);

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

  typeWriter(gptReply.message || "Your crystal reflects your soul's needs.", "typed-response");
});
