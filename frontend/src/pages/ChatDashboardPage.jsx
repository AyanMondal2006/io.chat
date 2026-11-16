import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  MessageCircle,
  Search,
  Users,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { useMemo, useState } from "react";

import { getUserFriends } from "../lib/api.js";
import { getLanguageFlag } from "../components/FriendCard.jsx";
import { capitialize } from "../lib/utils.js";

const ChatDashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: friends = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const filteredFriends = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return friends;

    return friends.filter((friend) =>
      [
        friend.fullName,
        friend.nativeLanguage,
        friend.learningLanguage,
      ].some((value) => value?.toLowerCase().includes(search)),
    );
  }, [friends, searchTerm]);

  return (
    <div className="min-h-full bg-[#080e1c] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              <MessageCircle size={16} />
              Your conversations
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Messages
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Connect with your language partners and keep the conversation going.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-white/10 bg-[#101a30] px-4 py-3">
            <Users size={18} className="text-violet-400" />
            <span className="text-sm text-slate-300">
              {friends.length}{" "}
              {friends.length === 1 ? "friend" : "friends"}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-[#0c1427] p-3 sm:p-4">
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111c32] px-4 py-3 transition focus-within:border-violet-400/50">
            <Search size={19} className="shrink-0 text-slate-400" />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search friends or languages..."
              aria-label="Search conversations"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        {/* Conversation list */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              Your friends
            </h2>

            <span className="text-xs text-slate-500">
              {filteredFriends.length} shown
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-2xl border border-white/5 bg-[#101a30]"
                />
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-rose-400/20 bg-[#101a30] p-8 text-center">
              <p className="font-semibold text-white">
                Couldn't load your conversations.
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Check your connection and try again.
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-[#0c1427] px-5 py-14 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-violet-500/10">
                <MessageCircle size={26} className="text-violet-400" />
              </div>

              <h3 className="text-lg font-semibold text-white">
                {friends.length === 0
                  ? "Your conversations start here"
                  : "No matching friends"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                {friends.length === 0
                  ? "Connect with other learners first. Once you have friends, you can start chatting with them here."
                  : "Try another name or language."}
              </p>

              {friends.length === 0 && (
                <Link
                  to="/"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                >
                  Find language partners
                  <ArrowUpRight size={16} />
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFriends.map((friend) => (
                <Link
                  key={friend._id}
                  to={`/chat/${friend._id}`}
                  className="group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-[#0c1427] p-3 transition duration-200 hover:border-violet-400/30 hover:bg-[#111c32] sm:gap-4 sm:p-4"
                >
                  {/* Avatar */}
                  <div className="relative size-12 shrink-0 sm:size-14">
                    <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-indigo-950 ring-2 ring-white/5 transition group-hover:ring-violet-400/30">
                      <img
                        src={friend.profilePic || "/i.png"}
                        alt={friend.fullName || "Friend"}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* User information */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-white sm:text-base">
                      {friend.fullName || "Language partner"}
                    </h3>

                    <p className="mt-1 truncate text-xs text-slate-400 sm:text-sm">
                      Your language-learning partner
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {friend.nativeLanguage && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1 text-[11px] text-slate-300">
                          {getLanguageFlag(friend.nativeLanguage)}
                          <span>
                            Native: {capitialize(friend.nativeLanguage)}
                          </span>
                        </span>
                      )}

                      {friend.learningLanguage && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1 text-[11px] text-slate-300">
                          {getLanguageFlag(friend.learningLanguage)}
                          <span>
                            Learning: {capitialize(friend.learningLanguage)}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Open chat */}
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="hidden text-sm font-medium text-violet-300 sm:inline">
                      Message
                    </span>

                    <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 transition group-hover:bg-violet-600 group-hover:text-white">
                      <MessageCircle size={17} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ChatDashboardPage;