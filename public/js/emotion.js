document.getElementById("emotionForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const scores = ["q1", "q2", "q3", "q4", "q5"].map(id =>
    parseInt(document.querySelector(`select[name="${id}"]`).value)
  );
  const total = scores.reduce((a, b) => a + b, 0);

  let element = "Light";
  if (total >= 12) element = "Darkness";
  else if (scores[0] >= 2) element = "Water";
  else if (scores[1] >= 2) element = "Fire";
  else if (scores[2] >= 2) element = "Wind";
  else if (scores[3] >= 2) element = "Thunder";
  else if (scores[4] >= 2) element = "Earth";

  fetch("/element_crystal_mapping.json")
    .then((res) => res.json())
    .then((json) => {
      const crystal = json[element];
      document.getElementById("emotionResult").innerHTML = `
        <h3>💠 Element: ${crystal.element}</h3>
        <p><strong>Crystal:</strong> ${crystal.crystal}</p>
        <p>${crystal.description}</p>
        <a href="${crystal.link}" target="_blank">🔗 View Product</a>
      `;
    });
});
