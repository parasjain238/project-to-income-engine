export async function POST(req: Request) {
  try {
    const { projectIdea } = await req.json();

    if (!projectIdea) {
      return new Response(
        JSON.stringify({ error: "Project idea is required" }),
        { status: 400 }
      );
    }

    const prompt = `
You are a startup mentor in India (2026).

STRICT RULES:
- Output ONLY valid JSON
- No explanation, no markdown
- No text outside JSON
- Use proper commas and quotes
- Ensure JSON is parseable

Evaluate this project:
"${projectIdea}"

Return EXACT JSON:
{
  "score": number,
  "verdict": "string",
  "revenue": {
    "conservative": "string",
    "realistic": "string",
    "optimistic": "string"
  },
  "suggestions": [
    {
      "title": "string",
      "model": "string",
      "targetUsers": "string",
      "pricing": "string",
      "steps": ["step1", "step2", "step3"]
    }
  ]
}
`;

    // 🔁 Function to call AI
    const callAI = async () => {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/auto", // ✅ FIXED HERE
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await res.json();

      // ✅ Handle API errors (credits / model issues)
      if (data.error) {
        return { error: data.error.message || "API error" };
      }

      return data;
    };

    let data = await callAI();

    // ❌ If API error
    if (data.error) {
      return new Response(
        JSON.stringify({ error: data.error }),
        { status: 500 }
      );
    }

    let content = data?.choices?.[0]?.message?.content;

    // 🔁 Retry once if empty
    if (!content) {
      data = await callAI();
      content = data?.choices?.[0]?.message?.content;
    }

    // 🔥 Fallback (never break demo)
    if (!content) {
      return new Response(
        JSON.stringify({
          score: 5,
          verdict: "Fallback response (AI unavailable)",
          revenue: {
            conservative: "₹1 lakh",
            realistic: "₹5 lakhs",
            optimistic: "₹10 lakhs"
          },
          suggestions: [
            {
              title: "Basic Monetization",
              model: "Freemium",
              targetUsers: "Students",
              pricing: "₹99/month",
              steps: [
                "Validate idea",
                "Build MVP",
                "Launch locally"
              ]
            }
          ]
        }),
        { status: 200 }
      );
    }

    // 🧠 Extract JSON safely
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON format from AI",
          raw: content
        }),
        { status: 500 }
      );
    }

    let parsed;

    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return new Response(
        JSON.stringify({
          error: "AI returned broken JSON",
          raw: content
        }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Server error" }),
      { status: 500 }
    );
  }
}