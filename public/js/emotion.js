document.getElementById("emotionForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Collect scores
  const scores = Array.from({length:10}, (_,i)=>
    parseInt(document.querySelector(`select[name="q${i+1}"]`).value)
  );

  const total = scores.reduce((a,b)=>a+b,0);

  // Element mapping logic
  let element = "Light";
  if (total >=20) element = "Darkness";
  else if (scores[0]>=2 || scores[4]>=2) element = "Water";
  else if (scores[2]>=2) element = "Fire";
  else if (scores[3]>=2 || scores[9]>=2) element = "Earth";
  else if (scores[5]>=2) element = "Wind";
  else element = "Light";

  // Redirect to elemental chat
  window.location.href = `/elemental-chat.html?element=${encodeURIComponent(element)}`;
});
