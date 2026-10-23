// import { VideoIcon } from "lucide-react";

// function CallButton({ handleVideoCall }) {
//   return (
//     <div className="p-3 border-b flex items-center justify-end max-w-5xl mx-auto w-full">
//       <button onClick={handleVideoCall} className="btn btn-success btn-sm text-white">
//         <VideoIcon className="size-5" />
//       </button>
//     </div>
//   );
// }

// export default CallButton;


import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <button
      type="button"
      onClick={handleVideoCall}
      title="Start video call"
      aria-label="Start video call"
      className="flex h-10 w-14 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
    >
      <VideoIcon className="h-6 w-6" />
    </button>
  );
}

export default CallButton;
