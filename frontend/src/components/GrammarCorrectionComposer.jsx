import { useState } from "react";
import {
  useMessageComposerController,
  useStateStore,
} from "stream-chat-react";
import {
  CheckCheck,
  Languages,
  LoaderCircle,
  X,
  Sparkles,
  SpellCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { correctEnglishMessage } from "../lib/api.js";
const textComposerSelector = (state) => ({
  text: state.text,
});
const GrammarCorrectionComposer = () => {
  const messageComposer = useMessageComposerController();
const textComposer = messageComposer.textComposer;

const { text } = useStateStore(
  textComposer.state,
  textComposerSelector
);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

 const originalText = text || "";

  const handleCheckGrammar = async () => {
    const text = textComposer.text?.trim();

    if (!text) {
      toast.error("Write a message before checking its grammar.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await correctEnglishMessage(text);

      setResult({
        originalText: response.originalText ?? text,
        correctedText: response.correctedText ?? text,
        issues: response.issues ?? [],
        hasCorrections: response.hasCorrections ?? false,
      });

      if (!response.hasCorrections) {
        toast.success("Your message looks good!");
      }
    } catch (error) {
      console.error("Grammar correction failed:", error);

      toast.error(
        error.response?.data?.message ||
          "Could not check grammar. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUseCorrection = () => {
    if (!result) return;

    textComposer.setText(result.correctedText);

    setResult(null);
    toast.success("Corrected text added to your message.");
  };

  const handleKeepOriginal = () => {
    setResult(null);
  };

  return (
    <div className="border-t border-slate-700/80 bg-slate-900 px-3 py-2 sm:px-4">
      {/* Grammar Checker Header */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 transition-colors duration-200 hover:border-slate-600">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Description */}
          <div className="flex items-center gap-3">
           <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-400/20 bg-indigo-500/15">
            <SpellCheck
             size={18}
               className="text-indigo-300"
                aria-hidden="true"
                 />
              </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-100">
                  Grammar Assistant
                </h3>

                <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-200">
                  <Sparkles size={11} />
                  AI Writing Support
                </span>
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-300 sm:text-sm">
                Check spelling and grammar before sending your message.
              </p>
            </div>
          </div>

          {/* Check Grammar Button */}
          <button
            type="button"
            onClick={handleCheckGrammar}
            disabled={loading || !originalText.trim()}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-950/40 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:cursor-not-allowed disabled:border-slate-600 disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none sm:w-auto"
          >
            {loading ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <CheckCheck size={17} />
            )}

            {loading ? "Checking Grammar..." : "Check Grammar"}
          </button>
        </div>
      </div>

      {/* Grammar Correction Result */}
      {result && (
        <div
          className="mt-4 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-lg shadow-black/10"
          role="region"
          aria-label="Grammar correction preview"
        >
          {/* Result Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-700 bg-slate-800/80 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/15">
                <Languages
                  size={19}
                  className="text-indigo-300"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  Grammar Correction
                </h3>

                <p className="mt-0.5 text-xs text-slate-400">
                  Review your message before applying changes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleKeepOriginal}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
              aria-label="Close grammar correction"
              title="Close"
            >
              <X size={17} />
            </button>
          </div>

          {/* Original and Corrected Messages */}
          <div className="space-y-4 p-4">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" />

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                  Original Message
                </p>
              </div>

              <p className="whitespace-pre-wrap break-words rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-sm leading-6 text-slate-300">
                {result.originalText}
              </p>
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                  Corrected Message
                </p>
              </div>

              <p className="whitespace-pre-wrap break-words rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3 text-sm leading-6 text-slate-100">
                {result.correctedText}
              </p>
            </div>
          </div>

          {/* Grammar Suggestions */}
          {result.issues.length > 0 && (
            <div className="mx-4 mb-4 rounded-lg border border-slate-700 bg-slate-900/60 p-3">
              <details>
                <summary className="cursor-pointer text-sm font-medium text-indigo-300 transition-colors hover:text-indigo-200">
                  View suggestions ({result.issues.length})
                </summary>

                <ul className="mt-3 space-y-2">
                  {result.issues.map((issue, index) => (
                    <li
                      key={`${issue.originalText}-${index}`}
                      className="rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm"
                    >
                      <p className="font-medium leading-5 text-slate-100">
                        {issue.message}
                      </p>

                      {issue.originalText && (
                        <p className="mt-2 text-xs leading-5 text-slate-300">
                          <span className="font-semibold text-slate-400">
                            Original:{" "}
                          </span>
                          {issue.originalText}
                        </p>
                      )}

                      {issue.suggestions?.length > 0 && (
                        <p className="mt-2 text-xs leading-5 text-emerald-300">
                          <span className="font-semibold">
                            Suggestions:{" "}
                          </span>
                          {issue.suggestions.join(", ")}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-2 border-t border-slate-700 bg-slate-900/50 p-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleKeepOriginal}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <X size={16} />
              Keep Original
            </button>

            <button
              type="button"
              onClick={handleUseCorrection}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <CheckCheck size={17} />
              Use Correction
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrammarCorrectionComposer;
