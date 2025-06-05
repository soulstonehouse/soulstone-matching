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

  // 🔮 步骤1：推断元素类型
  const month = new Date(birthday).getMonth() + 1;
  let element = 'Wood';

  if ([3, 4].includes(month)) element = 'Wood';
  else if ([5, 6].includes(month)) element = 'Fire';
  else if ([7, 8].includes(month)) element = 'Earth';
  else if ([9, 10].includes(month)) element = 'Metal';
  else if ([11, 12].includes(month)) element = 'Water';
  else if (month === 1) element = 'Ice';
  else if (month === 2) element = 'Thunder';

  // 🌟 精灵语气标题映射
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

  const spiritLabel = spiritLabelMap[element] || "✨ Message from your Spirit Guide";

  // 🌈 步骤2：读取水晶匹配数据
  let crystalInfo = {};
  try {
    const response = await fetch('/element_crystal_mapping.json');
    const data = await response.json();
    crystalInfo = data[element] || {};
  } catch (error) {
    resultDiv.innerHTML = '❌ Failed to load crystal data.';
    return;
  }

  // 🤖 步骤3：请求 GPT 分析
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

  // 🌸 步骤4：渲染结果内容
  resultDiv.innerHTML = `
    <div style="border: 2px dashed #d7c9f7; border-radius: 16px; padding: 20px; background: #f9f7ff;">
      <h3>🧝‍♀️ Your Element: ${element}</h3>
      <p><strong>Crystal:</strong> ${crystalInfo.crystal || 'Unknown'}</p>
      <p><strong>About:</strong> ${crystalInfo.description || 'No description available.'}</p>
      <p style="margin-top: 16px;"><strong>${spiritLabel}:</strong></p>
      <p>${gptReply.message || 'Your crystal reflects your soul\'s needs.'}</p>
      ${crystalInfo.link ? `<p><a href="${crystalInfo.link}" target="_blank">🛒 View Product</a></p>` : ''}
    </div>
  `;
});
