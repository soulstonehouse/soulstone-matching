document.getElementById("emotionForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const form = e.target;
  const scores = Array.from(form.querySelectorAll("select")).map(s => parseInt(s.value));
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "✨ Analyzing your responses, please wait...";

  try {
    // 向后端AI请求
    const res = await fetch("/api/emotion-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ scores })
    });

    const data = await res.json();
    const aiMessage = data.message || "Your emotional guide is here whenever you need support.";

    // 判断元素
    const total = scores.reduce((a,b)=>a+b,0);
    let element = "Light";
    if (total >=20) element = "Darkness";
    else if (scores[0]>=2 || scores[4]>=2) element = "Water";
    else if (scores[2]>=2) element = "Fire";
    else if (scores[3]>=2 || scores[9]>=2) element = "Earth";
    else if (scores[5]>=2) element = "Wind";
    else element = "Light";

    // 显示结果和按钮
    resultDiv.innerHTML = `
      <div style="white-space:pre-line; border:1px dashed #d0c4f7; padding:20px; border-radius:12px;">
        ${aiMessage}
        <br/><br/>
        <a href="/elemental-chat.html?element=${encodeURIComponent(element)}" 
           style="display:inline-block;margin-top:20px;padding:10px 20px;background:#7d65f8;color:#fff;border-radius:8px;text-decoration:none;">
          🌿 Begin conversation with your ${element} Spirit
        </a>
      </div>
    `;
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = "❌ Sorry, something went wrong. Please try again.";
  }
});
