document.getElementById('matchBtn').addEventListener('click', async () => {
  const birthday = document.getElementById('birthday').value;
  const birthtime = document.getElementById('birthtime').value;
  const language = document.getElementById('language').value;
  const resultDiv = document.getElementById('result');

  if (!birthday || !birthtime) {
    resultDiv.innerHTML = 'Please enter both birth date and time.';
    return;
  }

  // 🔮 步骤1：计算元素（简化版，后续可接GPT改进）
  const month = new Date(birthday).getMonth() + 1;
  let element = 'Wood'; // 默认

  if ([3, 4].includes(month)) element = 'Wood';
  else if ([5, 6].includes(month)) element = 'Fire';
  else if ([7, 8].includes(month)) element = 'Earth';
  else if ([9, 10].includes(month)) element = 'Metal';
  else if ([11, 12].includes(month)) element = 'Water';
  else if (month === 1) element = 'Ice';
  else if (month === 2) element = 'Thunder';

  // 🌈 步骤2：加载 JSON 文件
  let crystalInfo = {};
  try {
    const response = await fetch('/element_crystal_mapping.json');
    const data = await response.json();
    crystalInfo = data[element] || {};
  } catch (error) {
    resultDiv.innerHTML = 'Error loading crystal data.';
    return;
  }

  // 🤖 步骤3：调用 OpenAI GPT 接口
  const gptReply = await fetch('/api/match-crystal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      birthday, birthtime, language, element
    })
  }).then(res => res.json());

  // 🪄 步骤4：组合展示
  resultDiv.innerHTML = `
    <h3>✨ Your Element: ${element}</h3>
    <p><strong>Crystal:</strong> ${crystalInfo.crystal}</p>
    <p><strong>About:</strong> ${crystalInfo.description}</p>
    <p><strong>GPT Suggestion:</strong> ${gptReply.message || 'Your crystal reflects your soul\'s needs.'}</p>
    <p><a href="${crystalInfo.link}" target="_blank">🛒 View Product</a></p>
  `;
});
