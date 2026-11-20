const translateWithGoogle = async (text, target) => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
    target
  )}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Google translate returned status: ${response.status}`);
  }

  const data = await response.json();
  if (Array.isArray(data?.[0])) {
    const translated = data[0]
      .map((item) => item[0])
      .filter(Boolean)
      .join("");
    if (translated) return translated;
  }
  throw new Error("Invalid response format from Google translate");
};

const translateWithLibre = async (text, target) => {
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
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) {
    throw new Error(`LibreTranslate returned status: ${response.status}`);
  }

  const result = await response.json();
  if (typeof result.translatedText === "string") {
    return result.translatedText;
  }
  throw new Error("Invalid response from LibreTranslate");
};

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

    let translatedText = null;

    // 1. Try LibreTranslate first
    try {
      translatedText = await translateWithLibre(text, target);
    } catch (libreErr) {
      console.warn(`[Translate] LibreTranslate unavailable (${libreErr.message}), falling back to Google Translate.`);
    }

    // 2. Fallback to Google Translate if LibreTranslate failed or timed out
    if (!translatedText) {
      try {
        translatedText = await translateWithGoogle(text, target);
      } catch (googleErr) {
        console.error(`[Translate] Google Translate also failed:`, googleErr.message);
      }
    }

    if (!translatedText) {
      return res.status(502).json({
        message: "Translation service is temporarily unavailable. Please try again.",
      });
    }

    return res.status(200).json({
      originalText: text.trim(),
      translatedText,
      target,
    });
  } catch (error) {
    console.error("Translation error:", error.message);

    return res.status(502).json({
      message: "Could not translate the message. Please try again.",
    });
  }
};
