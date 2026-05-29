import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const groqKey = Deno.env.get('GROQ_API_KEY')
    if (!groqKey) {
      console.error('GROQ_API_KEY is missing')
      return new Response(
        JSON.stringify({ error: 'Configuração incompleta: GROQ_API_KEY não encontrada no servidor.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const { message, context, userName, history } = await req.json().catch(() => ({ message: '', context: '', userName: '', history: [] }))
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Mensagem vazia' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const firstName = userName ? userName.split(' ')[0] : 'Colaborador';

    const systemPrompt = { 
      role: "system", 
      content: `Você é o Consultor Integrar da AeC. Você deve ser amigável, informal e prestativo.
O usuário se chama ${firstName}. SEMPRE chame-o APENAS pelo primeiro nome. Jamais use o nome completo.

DIRETRIZES DE RESPOSTA:
1. Responda APENAS com base no contexto (PDF) fornecido.
2. Se não souber, diga educadamente que não possui essa informação no material oficial.
3. IMPORTANTE: Não envie textos gigantes. Divida sua resposta em partes menores e use o caractere "|" para separar mensagens diferentes que devem aparecer em balões separados.
   Exemplo: "Olá ${firstName}! Tudo bem? | O Integrar é o nosso evento de conexão. | Como posso te ajudar mais?"
4. NUNCA responda perguntas fora do escopo da AeC e do evento Integrar.

CONTEXTO (PDF):
${context || "Nenhuma informação disponível."}` 
    };

    // Build messages array with history
    const messages = [
      systemPrompt,
      ...(history || []).map((h: any) => ({
        role: h.role,
        content: h.content
      })),
      { role: "user", content: message }
    ];

    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
      }),
    })

    const data = await groqResponse.json()
    
    if (!groqResponse.ok) {
      console.error('Groq Error:', data)
      return new Response(
        JSON.stringify({ error: 'Erro na API da Groq', details: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ content: data.choices[0].message.content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Unexpected Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
