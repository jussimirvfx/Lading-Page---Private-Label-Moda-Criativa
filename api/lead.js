const parseBody = (body) => {
  if (!body || typeof body !== 'string') {
    return body ?? {};
  }

  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return res.status(500).json({ error: 'N8N_WEBHOOK_URL is not configured' });
  }

  try {
    const payload = parseBody(req.body);
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!webhookResponse.ok) {
      const responseText = await webhookResponse.text();
      return res.status(502).json({
        error: 'n8n webhook request failed',
        status: webhookResponse.status,
        details: responseText
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error forwarding lead to n8n:', error);
    return res.status(500).json({ error: 'Unable to forward lead' });
  }
}
