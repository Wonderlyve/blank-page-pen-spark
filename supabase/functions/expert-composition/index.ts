import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { matches } = await req.json()
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured')
    }

    if (!matches || matches.length === 0) {
      return new Response(JSON.stringify({ error: "Aucun match fourni" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Construire le contexte des matchs pour l'IA
    const matchesContext = matches.map((match: any, index: number) => 
      `Match ${index + 1}: ${match.description}`
    ).join('\n\n')

    const systemPrompt = `Tu es un expert en paris sportifs avec plus de 15 ans d'expérience. 
Tu analyses les compositions de paris multiples avec professionnalisme et objectivité.

Ton rôle est d'analyser les matchs proposés par l'utilisateur et de:
1. Évaluer chaque pronostic individuellement
2. Analyser la cohérence globale de la composition
3. Calculer le potentiel de gain et le risque
4. Suggérer des améliorations ou alternatives si nécessaire
5. Donner des conseils sur la gestion du bankroll

Tu donnes des conseils basés sur:
- L'analyse statistique des équipes/joueurs
- Les tendances actuelles
- La valeur des cotes
- La corrélation entre les matchs
- La gestion du risque
- Les facteurs contextuels (blessures, forme, etc.)

Ton ton est professionnel mais accessible. Tu es honnête sur les risques et tu ne garantis jamais de victoire.
Tu structures tes réponses de manière claire avec des sections distinctes.`

    const userPrompt = `Analyse cette composition de paris sportifs:

${matchesContext}

Donne une analyse experte complète avec:
- Analyse de chaque pronostic
- Évaluation de la composition globale
- Calcul du risque/rendement
- Suggestions d'amélioration
- Conseils de mise`

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants pour l'IA." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const errorText = await response.text()
      console.error('AI gateway error:', response.status, errorText)
      return new Response(JSON.stringify({ error: "Erreur lors de l'analyse" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const advice = data.choices[0].message.content

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in expert-composition function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
