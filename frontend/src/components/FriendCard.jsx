import { Link } from "react-router";
import { MessageCircleIcon } from "lucide-react";
import { capitialize } from "../lib/utils.js";
import { getLanguageFlag } from "../lib/flags.jsx";

const FriendCard = ({ friend }) => {
  return (
    <article className="group rounded-2xl border border-base-300 bg-base-200/70 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-center gap-3">
        <div className="avatar shrink-0">
          <div className="size-14 overflow-hidden rounded-2xl ring-2 ring-base-300 transition group-hover:ring-primary/40">
            <img
              src={friend.profilePic || "/i.png"}
              alt={friend.fullName || "Friend"}
              loading="lazy"
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold">
            {friend.fullName}
          </h3>
          <p className="mt-1 text-xs text-base-content/55">
            Your language partner
          </p>
        </div>
      </div>

      <div className="my-4 h-px bg-base-300" />

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-base-content/60">Native</span>
          <span className="flex items-center gap-1.5 font-medium">
            {getLanguageFlag(friend.nativeLanguage)}
            <span>{capitialize(friend.nativeLanguage || "Unknown")}</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base-content/60">Learning</span>
          <span className="flex items-center gap-1.5 font-medium">
            {getLanguageFlag(friend.learningLanguage)}
            <span>{capitialize(friend.learningLanguage || "Unknown")}</span>
          </span>
        </div>
      </div>

      <Link
        to={`/chat/${friend._id}`}
        className="btn btn-outline mt-5 w-full rounded-xl transition-colors group-hover:btn-primary"
      >
        <MessageCircleIcon className="size-4" />
        Message
      </Link>
    </article>
  );
};

export default FriendCard;
