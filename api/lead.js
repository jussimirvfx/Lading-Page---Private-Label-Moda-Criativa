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

  const webhookUrl =
    process.env.FORM_WEBHOOK_URL ||
    process.env.VITE_FORM_WEBHOOK_URL ||
    process.env.NEXT_PUBLIC_FORM_WEBHOOK_URL ||
    process.env.REACT_APP_FORM_WEBHOOK_URL ||
    process.env.N8N_WEBHOOK_URL ||
    'https://api.seudominio.com/webhook/leads';

  const webhookToken =
    process.env.WEBHOOK_TOKEN ||
    process.env.VITE_WEBHOOK_TOKEN ||
    process.env.NEXT_PUBLIC_WEBHOOK_TOKEN ||
    process.env.REACT_APP_WEBHOOK_TOKEN ||
    '';

  if (!webhookUrl) {
    return res.status(500).json({ error: 'FORM_WEBHOOK_URL is not configured' });
  }

  try {
    const payload = parseBody(req.body);
    const requiredFields = [
      'nome',
      'nome_da_loja_marca',
      'email_corporativo',
      'whatsapp_da_loja',
      'cnpj',
      'cidade',
      'estado',
      'instagram',
      'principais_marcas_que_vende_hoje',
      'tipo_de_loja',
      'tipo_de_venda',
      'tempo_de_cnpj',
      'pecas_para_o_portfolio',
      'page_url',
      'lead_score'
    ];
    const missingFields = requiredFields.filter((field) => {
      const value = payload[field];
      if (Array.isArray(value)) return value.length === 0;
      return !String(value ?? '').trim();
    });

    if (missingFields.length > 0) {
      return res.status(400).json({ error: 'Missing required fields', fields: missingFields });
    }

    if (!Number.isFinite(Number(payload.lead_score))) {
      return res.status(400).json({ error: 'Invalid lead_score' });
    }

    console.log('Lead preparado para webhook:', {
      lead_score: payload.lead_score,
      page_url: payload.page_url
    });

    const headers = {
      'Content-Type': 'application/json'
    };

    if (webhookToken) {
      headers.Authorization = `Bearer ${webhookToken}`;
    }

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
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
