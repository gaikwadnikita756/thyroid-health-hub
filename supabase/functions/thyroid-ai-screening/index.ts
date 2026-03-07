import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let prompt = "";
    const mode = body.mode || "symptom_screening";

    if (mode === "lab_prediction") {
      const { tsh, t3, t4 } = body.lab_values || {};
      prompt = `You are a thyroid health AI assistant for educational purposes only.

Lab values provided:
- TSH: ${tsh} mIU/L (normal: 0.4–4.0)
- Free T3: ${t3 ?? "not provided"} pg/mL (normal: 2.3–4.2)
- Free T4: ${t4 ?? "not provided"} ng/dL (normal: 0.8–1.8)

Based on these values, provide:
1. prediction: "Normal", "Hypothyroid", or "Hyperthyroid"
2. confidence: percentage (50-95)
3. notes: one brief educational sentence about what these values may indicate

Respond ONLY with valid JSON in this exact format:
{"prediction": "...", "confidence": 75, "notes": "..."}`;
    } else {
      const s = body.symptoms || {};
      prompt = `You are a thyroid health educational AI tool.

Patient symptom profile:
- Age group: ${s.age}
- Biological sex: ${s.sex}
- Weight change: ${s.weightChange}
- Heart rate: ${s.heartRate}
- Temperature sensitivity: ${s.temperatureSensitivity}
- Fatigue level: ${s.tirednessLevel?.[0] ?? s.tirednessLevel}/10
- Neck swelling: ${s.neckSwelling}
- Previous thyroid disease: ${s.previousThyroid}
- Hair loss: ${s.hairLoss}
- Anxiety/tremors: ${s.anxiety}

Provide a risk assessment in this EXACT JSON format only (no other text):
{
  "risk": "low" | "moderate" | "high",
  "message": "one sentence about risk level",
  "recommendation": "one sentence recommendation",
  "confidence": number between 50-90,
  "symptoms_noted": ["array", "of", "notable", "symptoms"]
}

IMPORTANT: This is educational only. Be cautious and always suggest consulting a doctor.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a medical education AI. Always respond with valid JSON only. Never provide actual medical diagnosis." },
          { role: "user", content: prompt },
        ],
        stream: false,
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "AI usage limit reached. Please contact support." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content ?? "{}";

    // Extract JSON from content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("thyroid-ai-screening error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
