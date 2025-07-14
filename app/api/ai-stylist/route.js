// /app/api/ai-stylist/route.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { query, userProfile } = await req.json();

    if (!query || !openai.apiKey) {
      return new Response(
        JSON.stringify({ advice: "Missing query or OpenAI API key." }),
        { status: 400 }
      );
    }

    const prompt = `
You are a professional fashion stylist. Give clear and concise style advice in 2-4 sentences.

User's question: "${query}"
User tier: ${userProfile?.tier || "guest"}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // safe fallba
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200,
    });

    const advice = completion.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ advice }), { status: 200 });
  } catch (error) {
    console.error("AI Stylist Error:", error.message);
    return new Response(
      JSON.stringify({
        advice: "I'm having trouble connecting right now. Try again soon.",
      }),
      { status: 500 }
    );
  }
}
