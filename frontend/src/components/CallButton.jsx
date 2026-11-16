import { LoaderCircle, VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall, isLoading = false }) {
  return (
    <button
      type="button"
      onClick={handleVideoCall}
      disabled={isLoading}
      title={isLoading ? "Sending call link..." : "Start video call"}
      aria-label={isLoading ? "Sending call link" : "Start video call"}
      className="flex h-10 w-14 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <LoaderCircle className="h-5 w-5 animate-spin" />
      ) : (
        <VideoIcon className="h-6 w-6" />
      )}
    </button>
  );
}

export default CallButton;

