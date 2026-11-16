
export const correctEnglish = async (req, res) => {
  try {
    const { text } = req.body ?? {};

    // Validate input
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        message: "Please provide a message to correct.",
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        message: "Message is too long. Maximum length is 5000 characters.",
      });
    }

    // Send the text to LanguageTool
    const params = new URLSearchParams({
      text: text.trim(),
      language: "en-US",
    });

    const response = await fetch(
      "https://api.languagetool.org/v2/check",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!response.ok) {
      console.error("LanguageTool returned status:", response.status);

      return res.status(502).json({
        message: "Grammar correction is temporarily unavailable.",
      });
    }

    const result = await response.json();

    // Apply suggested replacements from right to left so that
    // earlier character offsets remain valid.
    let correctedText = text.trim();

    const matches = [...(result.matches || [])].sort(
      (a, b) => b.offset - a.offset
    );

    for (const match of matches) {
      const replacement = match.replacements?.[0]?.value;

      if (
        typeof replacement === "string" &&
        Number.isInteger(match.offset) &&
        Number.isInteger(match.length) &&
        match.offset >= 0 &&
        match.length >= 0 &&
        match.offset + match.length <= correctedText.length
      ) {
        correctedText =
          correctedText.slice(0, match.offset) +
          replacement +
          correctedText.slice(match.offset + match.length);
      }
    }

    // Return explanations and suggested replacements for the UI.
    const issues = (result.matches || []).map((match) => ({
      message: match.message,
      shortMessage: match.shortMessage || "",
      originalText: text
        .trim()
        .slice(match.offset, match.offset + match.length),
      suggestions: (match.replacements || [])
        .slice(0, 3)
        .map((replacement) => replacement.value),
      category: match.rule?.category?.name || "Grammar",
    }));

    return res.status(200).json({
      originalText: text.trim(),
      correctedText,
      issues,
      hasCorrections: correctedText !== text.trim(),
    });
  } catch (error) {
    console.error("English correction error:", error.message);

    return res.status(502).json({
      message:
        "Could not check the grammar. Please try again.",
    });
  }
};
