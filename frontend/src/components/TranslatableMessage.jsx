import { useState } from "react";
import {
  MessageUI as DefaultMessageUI,
  useMessageContext,
} from "stream-chat-react";
import { Languages, LoaderCircle, X } from "lucide-react";
import toast from "react-hot-toast";
import { translateMessage } from "../lib/api.js";

const TranslatableMessage = (props) => {
  const { message } = useMessageContext("MessageUI");

  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const handleTranslate = async () => {
    if (!message?.text?.trim() || loading) return;

    if (translation) {
      setShowTranslation((previous) => !previous);
      return;
    }

    setLoading(true);

    try {
      const result = await translateMessage(message.text, "hi");
      setTranslation(result.translatedText);
      setShowTranslation(true);
    } catch (error) {
      console.error("Message translation failed:", error);

      toast.error(
        error.response?.data?.message ||
          "Could not translate this message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <DefaultMessageUI {...props} />

      {message?.text?.trim() && (
        <div className="mt-1 flex justify-end">
          <button
            type="button"
            onClick={handleTranslate}
            disabled={loading}
            aria-label={
              showTranslation ? "Hide Hindi translation" : "Translate message into Hindi"
            }
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-base-content/60 transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : (
              <Languages size={13} />
            )}

            {loading
              ? "Translating..."
              : showTranslation
                ? "Hide translation"
                : translation
                  ? "Show translation"
                  : "Translate"}
          </button>
        </div>
      )}

{showTranslation && translation && (
  <div className="mt-1.5 flex w-full justify-end px-1">
    <div className="w-fit max-w-[85%] min-w-[160px] rounded-xl border border-primary/20 bg-base-200 px-3 py-2 shadow-sm sm:max-w-[70%]">
      <div className="mb-1 flex items-center gap-1.5">
        <Languages size={12} className="shrink-0 text-primary" />

        <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          Hindi translation
        </span>

        <button
          type="button"
          onClick={() => setShowTranslation(false)}
          className="ml-auto rounded-full p-1 text-base-content/60 transition hover:bg-base-300 hover:text-base-content"
          aria-label="Hide translation"
          title="Hide translation"
        >
          <X size={12} />
        </button>
      </div>

      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-base-content">
        {translation}
      </p>
    </div>
  </div>
)}
    </div>
  );
};

export default TranslatableMessage;
