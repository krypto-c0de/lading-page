// api/waitlist.js
// Roda no servidor da Vercel — credenciais nunca chegam ao navegador.

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Lê o email do body
  const { email } = req.body || {};

  // Validação no servidor (nunca confie só no front)
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  // Credenciais vêm das variáveis de ambiente da Vercel
  // Configuradas em: vercel.com → projeto → Settings → Environment Variables
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY; // service_role key

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Variáveis de ambiente do Supabase não configuradas');
    return res.status(500).json({ error: 'Configuração ausente' });
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        email,
        source: 'landing_page',
        lang: req.headers['accept-language']?.startsWith('pt') ? 'pt' : 'en',
      }),
    });

    // 201 = criado, 409 = email duplicado (trata como sucesso silencioso)
    if (response.status === 201 || response.status === 409) {
      return res.status(200).json({ ok: true });
    }

    const detail = await response.text();
    console.error('Supabase error:', response.status, detail);
    return res.status(500).json({ error: 'Erro ao salvar' });

  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: 'Erro de rede' });
  }
}
