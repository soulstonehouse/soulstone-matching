export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { birthday, birthtime, language, element } = req.body;

  const prompt = `
You are a gentle and wise crystal energy guide.

Based on the user's birth information:
- Date: ${birthday}
- Time: ${birthtime}
- Elemental Type: ${element}

Please provide a warm, poetic, and emotionally supportive crystal recommendation in ${language}.
Focus on the spiritual and emotional healing power of one specific crystal, and close with an uplifting affirmation.
  `.trim();

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error response:', errorText);
      throw new Error('OpenAI API request failed');
    }

    const json = await response.json();
    const message = json.choices?.[0]?.message?.content || '✨ Your soul crystal is waiting for you.';

    res.status(200).json({ message });
  } catch (e) {
    console.error('GPT API error:', e);
    res.status(500).json({ message: 'AI matching failed.' });
  }
}
