export const translateMessage = async (req, res) => {
  try {
    const { text, target = "hi" } = req.body ?? {};

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Please provide a message to translate.",
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        message: "Message is too long to translate.",
      });
    }

    const supportedLanguages = ["hi", "en", "bn"];
    if (!supportedLanguages.includes(target)) {
      return res.status(400).json({
        message: "Unsupported target language.",
      });
    }

    const rawBaseUrl =
      process.env.LIBRETRANSLATE_URL || "https://streamify-libretranslate.onrender.com";
    const baseUrl = rawBaseUrl.replace(/\/+$/, "");

    const response = await fetch(`${baseUrl}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text.trim(),
        source: "auto",
        target,
        format: "text",
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error("LibreTranslate returned status:", response.status);

      return res.status(502).json({
        message: "Translation service is temporarily unavailable.",
      });
    }

    const result = await response.json();

    if (typeof result.translatedText !== "string") {
      return res.status(502).json({
        message: "Invalid response from translation service.",
      });
    }

    return res.status(200).json({
      originalText: text.trim(),
      translatedText: result.translatedText,
      target,
    });
  } catch (error) {
    console.error("Translation error:", error.message);

    return res.status(502).json({
      message: "Could not translate the message. Please try again.",
    });
  }
};
