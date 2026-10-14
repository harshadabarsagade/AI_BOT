
import express from "express";

const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter a message."
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Groq API key is missing. Check your .env file."
      });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant. Explain things clearly in simple English or Hinglish when appropriate."
            },
            {
              role: "user",
              content: message.trim()
            }
          ],
          temperature: 0.7,
          max_completion_tokens: 2048
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API Error:", response.status, data);

      return res.status(response.status).json({
        success: false,
        message:
          data?.error?.message ||
          `AI request failed (${response.status}).`
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        success: false,
        message: "AI returned no text. Please try again."
      });
    }

    return res.json({
      success: true,
      reply
    });

  } catch (error) {
    console.error("Server Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to connect to the AI service."
    });
  }
});

export default router;
