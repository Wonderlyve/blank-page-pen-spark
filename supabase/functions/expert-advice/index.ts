import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { messages, predictionData } = await req.json()
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured')
    }

    // Construire le contexte du pronostic pour l'IA
    let predictionContext = ""
    if (predictionData && messages.length === 1) {
      // Premier message: analyse initiale
      predictionContext = `
Analyse ce pronostic sportif en tant qu'expert:

${predictionData.sport ? `Sport: ${predictionData.sport}` : ''}
${predictionData.match ? `Match: ${predictionData.match}` : ''}
${predictionData.match_time ? `Heure: ${predictionData.match_time}` : ''}
${predictionData.bet_type ? `Type de pari: ${predictionData.bet_type}` : ''}
${predictionData.prediction ? `Pronostic: ${predictionData.prediction}` : ''}
${predictionData.odds ? `Cote: ${predictionData.odds}` : ''}
${predictionData.confidence ? `Confiance: ${predictionData.confidence}%` : ''}
${predictionData.analysis ? `Analyse de l'utilisateur: ${predictionData.analysis}` : ''}

${predictionData.matches_data ? `Matches multiples: ${predictionData.matches_data}` : ''}
${predictionData.total_odds ? `Cote totale: ${predictionData.total_odds}` : ''}

Donne un avis d'expert professionnel et nuancé sur ce pronostic.
`
    }

    const systemPrompt = `Tu es un expert en paris sportifs avec plus de 15 ans d'expérience. 
Tu analyses les pronostics avec professionnalisme et objectivité.
Tu donnes des conseils basés sur:
- L'analyse statistique des équipes/joueurs
- Les tendances actuelles
- La valeur de la cote
- La gestion du risque
- Les facteurs contextuels (blessures, forme, etc.)

Ton ton est professionnel mais accessible. Tu es honnête sur les risques et tu ne garantis jamais de victoire.
Tu structures tes réponses de manière claire et concise.`

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
          ...(predictionContext ? [{ role: 'user', content: predictionContext }] : messages)
        ],
        temperature: 0.7,
        max_tokens: 1000,
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
    console.error('Error in expert-advice function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
