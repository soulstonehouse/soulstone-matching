export default async function handler(req, res) {
  const { birthday, birthtime, language, element } = req.body;

  const prompt = `
You are a crystal energy expert. Based on the user's birth date (${birthday} ${birthtime}) and their element (${element}),
generate a personalized crystal usage suggestion in ${language}. Keep it warm, uplifting, and focused on emotional or spiritual benefit.
  `.trim();

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const json = await response.json();
    const message = json.choices?.[0]?.message?.content || 'Your soul crystal awaits.';

    res.status(200).json({ message });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'AI matching failed.' });
  }
}
