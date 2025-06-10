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
  const gender = document.getElementById('gender').value;
  const resultDiv = document.getElementById('result');

  if (!birthday || !birthtime || !gender) {
    resultDiv.innerHTML = '❗ Please complete all fields.';
    return;
  }

  resultDiv.innerHTML = '🔮 Matching your crystal... Please wait...';

  const month = new Date(birthday).getMonth() + 1;
  const day = new Date(birthday).getDate();

  let zodiac = '';
  if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) zodiac = "Aquarius";
  else if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) zodiac = "Pisces";
  else if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) zodiac = "Aries";
  else if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) zodiac = "Taurus";
  else if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) zodiac = "Gemini";
  else if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) zodiac = "Cancer";
  else if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) zodiac = "Leo";
  else if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) zodiac = "Virgo";
  else if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) zodiac = "Libra";
  else if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) zodiac = "Scorpio";
  else if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) zodiac = "Sagittarius";
  else zodiac = "Capricorn";

  const monthToElement = {
    1: "Ice", 2: "Thunder", 3: "Wood", 4: "Wood",
    5: "Fire", 6: "Fire", 7: "Earth", 8: "Earth",
    9: "Metal", 10: "Metal", 11: "Water", 12: "Water"
  };
  const zodiacToElement = {
    "Aries": "Fire", "Leo": "Fire", "Sagittarius": "Fire",
    "Taurus": "Earth", "Virgo": "Earth", "Capricorn": "Earth",
    "Gemini": "Wind", "Libra": "Wind", "Aquarius": "Wind",
    "Cancer": "Water", "Scorpio": "Water", "Pisces": "Water"
  };

  const elementScore = {
    Fire: 0, Earth: 0, Water: 0, Wind: 0, Metal: 0, Wood: 0, Ice: 0, Thunder: 0
  };

  const mEle = monthToElement[month];
  const zEle = zodiacToElement[zodiac];

  if (mEle) elementScore[mEle] += 1;
  if (zEle) elementScore[zEle] += 1.5;

  const sorted = Object.entries(elementScore).sort((a, b) => b[1] - a[1]);
  const element = sorted[0][0];
  const spiritImage = spiritImageMap[element] || "";

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
    const payload = {
      birthday,
      birthtime,
      language,
      element,
      zodiac,
      gender
    };

    if (window.promptOverride) {
      payload.promptOverride = window.promptOverride;
    }

    const response = await fetch('/api/match-crystal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    gptReply = await response.json();
  } catch (e) {
    resultDiv.innerHTML = '⚠️ GPT request failed.';
    return;
  }

  resultDiv.innerHTML = `
    <div style="border: 2px dashed #d7c9f7; border-radius: 16px; padding: 20px; background: #f9f7ff;">
      <h3>🧝‍♀️ Your Element: ${element}</h3>
      <img src="${spiritImage}" alt="${element} Spirit" style="max-width: 140px; display: block; margin: 20px auto;">
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
    target.innerHTML = "";
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
