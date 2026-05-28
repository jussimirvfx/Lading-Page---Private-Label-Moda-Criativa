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
      'name',
      'email',
      'phone',
      'city',
      'state',
      'store_name',
      'cnpj',
      'instagram',
      'brands_sold',
      'store_type',
      'sale_type',
      'cnpj_age',
      'production_pieces',
      'form_answers',
      'form_answers_by_field'
    ];
    const missingFields = requiredFields.filter((field) => !String(payload[field] ?? '').trim());

    if (missingFields.length > 0) {
      return res.status(400).json({ error: 'Missing required fields', fields: missingFields });
    }

    const requiredFormAnswerFields = [
      'nome',
      'storeName',
      'email',
      'telefone',
      'cnpj',
      'cidade',
      'estado',
      'instagram',
      'brandsSold',
      'storeType',
      'saleType',
      'cnpjAge',
      'productionPieces'
    ];
    const formAnswerFields = Array.isArray(payload.form_answers)
      ? payload.form_answers.map((answer) => answer?.field)
      : [];
    const missingFormAnswerFields = requiredFormAnswerFields.filter((field) => {
      const groupedAnswer = payload.form_answers_by_field?.[field];
      return !formAnswerFields.includes(field) || !String(groupedAnswer?.answer ?? '').trim();
    });

    if (missingFormAnswerFields.length > 0) {
      return res.status(400).json({
        error: 'Missing form answer fields',
        fields: missingFormAnswerFields
      });
    }

    if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    if (!payload.phone || !/^\+55\d{10,11}$/.test(payload.phone)) {
      return res.status(400).json({ error: 'Invalid phone' });
    }

    if (!payload.cnpj || payload.cnpj.replace(/\D/g, '').length !== 14) {
      return res.status(400).json({ error: 'Invalid CNPJ' });
    }

    if (payload.value !== payload.lead_score) {
      return res.status(400).json({ error: 'value and lead_score must match' });
    }

    if (payload.lead_score_details?.lead_score !== payload.lead_score) {
      return res.status(400).json({ error: 'lead_score_details must match lead_score' });
    }

    console.log('Lead scoring detalhado:', {
      email: payload.email,
      lead_score: payload.lead_score,
      qualified: payload.qualified,
      is_disqualified: payload.is_disqualified,
      disqualification_reasons: payload.disqualification_reasons ?? [],
      breakdown: payload.lead_score_details?.breakdown ?? []
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
