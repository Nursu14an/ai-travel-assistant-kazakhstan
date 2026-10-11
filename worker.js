
export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return Response.json(
        { error: "Send a POST request to use the travel assistant." },
        { status: 405, headers: corsHeaders }
      );
    }

    try {
      const body = await request.json();
      const message = String(body.message || "").trim();
      const language = ["kk", "ru", "en"].includes(body.language)
        ? body.language
        : "kk";

      if (!message) {
        return Response.json(
          { error: "Please enter a question." },
          { status: 400, headers: corsHeaders }
        );
      }

      if (message.length > 1000) {
        return Response.json(
          { error: "Your question is too long." },
          { status: 400, headers: corsHeaders }
        );
      }

      const languageNames = {
        kk: "Kazakh",
        ru: "Russian",
        en: "English",
      };

      const result = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct",
        {
          messages: [
            {
              role: "system",
              content:
                "You are AI Travel Assistant Kazakhstan. Help users plan trips in Kazakhstan, especially Almaty, Kolsai Lakes, and Charyn Canyon. Reply in " +
                languageNames[language] +
                ". Be friendly and concise. Never invent current prices, opening hours, weather, availability, or booking confirmations. Clearly say when information needs verification. You cannot make bookings or contact guides.",
            },
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 500,
        }
      );

      return Response.json(
        { reply: result.response || "Please try asking another question." },
        { headers: corsHeaders }
      );
    } catch (error) {
      return Response.json(
        { error: "The AI assistant could not answer. Check the Worker AI binding and try again." },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
