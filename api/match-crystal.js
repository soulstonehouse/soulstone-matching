
export default async function handler(req, res) {
  const { birthday, birthtime, language, element, zodiac, gender } = req.body;

  const prompt = \`
You are a wise spirit guide who uses crystal energy for healing and transformation.
The user was born on \${birthday} at \${birthtime}, and identifies as \${gender}.
Their primary element is \${element}, and their zodiac sign is \${zodiac}.

Write a message from their spirit guardian, suggesting a crystal aligned with their soul's journey.
Use poetic, nurturing, and emotionally uplifting language in \${language}.
Begin your response with: "Dear Seeker," and provide no title or formatting — just the message text.
\`.trim();

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
        temperature: 0.8
      })
    });

    const json = await response.json();
    const message = json.choices?.[0]?.message?.content || 'Your crystal guide awaits.';

    res.status(200).json({ message });
  } catch (e) {
    console.error('GPT error:', e);
    res.status(500).json({ message: 'AI matching failed.' });
  }
}
