import { LANGUAGE_TO_FLAG } from "../constants";
import { Link } from "react-router";
import { MessageCircleIcon } from "lucide-react";
import { capitialize } from "../lib/utils.js";

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

      <div className="flex flex-wrap gap-2">
        <span className="badge badge-secondary badge-outline gap-1 px-2 py-3">
          {getLanguageFlag(friend.nativeLanguage)}
          Native: {capitialize(friend.nativeLanguage)}
        </span>

        <span className="badge badge-outline gap-1 px-2 py-3">
          {getLanguageFlag(friend.learningLanguage)}
          Learning: {capitialize(friend.learningLanguage)}
        </span>
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

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="inline-block h-3 w-4 rounded-sm object-cover"
        loading="lazy"
      />
    );
  }

  return null;
}


