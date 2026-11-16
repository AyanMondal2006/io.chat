import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import {
  CheckCircleIcon,
  MapPinIcon,
  UserPlusIcon,
  UsersIcon,
  SearchIcon,
  SparklesIcon,
  RefreshCwIcon,
  XIcon,
} from "lucide-react";
import { Link } from "react-router";
import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";
import { capitialize } from "../lib/utils.js";

const HomePage = () => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [nativeFilter, setNativeFilter] = useState("all");
  const [learningFilter, setLearningFilter] = useState("all");

  const {
    data: friends = [],
    isLoading: loadingFriends,
    isError: friendsError,
    refetch: refetchFriends,
  } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  const {
    data: recommendedUsers = [],
    isLoading: loadingUsers,
    isError: usersError,
    refetch: refetchUsers,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
  });

  const { data: outgoingFriendReqs = [] } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });


const {
  mutate: sendRequestMutation,
  isPending,
  variables: pendingUserId,
} = useMutation({
  mutationFn: sendFriendRequest,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["outgoingFriendReqs"],
    });
    toast.success("Friend request sent!");
  },
  onError: (error) => {
    console.error("Failed to send friend request:", error);
    toast.error(
      error.response?.data?.message ||
        "Couldn't send friend request. Please try again."
    );
  },
});



const outgoingRequestsIds = useMemo(() => {
  return new Set(
    outgoingFriendReqs
      .map((req) =>
        typeof req.recipient === "object"
          ? req.recipient?._id
          : req.recipient
      )
      .filter(Boolean)
  );
}, [outgoingFriendReqs]);


  const nativeLanguages = useMemo(
    () =>
      [...new Set(
        recommendedUsers
          .map((user) => user.nativeLanguage)
          .filter(Boolean)
      )].sort(),
    [recommendedUsers]
  );

  const learningLanguages = useMemo(
    () =>
      [...new Set(
        recommendedUsers
          .map((user) => user.learningLanguage)
          .filter(Boolean)
      )].sort(),
    [recommendedUsers]
  );

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return recommendedUsers.filter((user) => {
      const matchesSearch =
        !search ||
        user.fullName?.toLowerCase().includes(search) ||
        user.location?.toLowerCase().includes(search) ||
        user.bio?.toLowerCase().includes(search);

      const matchesNative =
        nativeFilter === "all" ||
        user.nativeLanguage === nativeFilter;

      const matchesLearning =
        learningFilter === "all" ||
        user.learningLanguage === learningFilter;

      return matchesSearch && matchesNative && matchesLearning;
    });
  }, [recommendedUsers, searchTerm, nativeFilter, learningFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setNativeFilter("all");
    setLearningFilter("all");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    nativeFilter !== "all" ||
    learningFilter !== "all";

  return (
    <main className="min-h-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-12">

        {/* FRIENDS SECTION */}
        <section>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <UsersIcon className="size-5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Your community
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Your Friends
              </h1>

              <p className="mt-1 text-sm text-base-content/65">
                Continue your language-learning journey together.
              </p>
            </div>

            <Link
              to="/notifications"
              className="btn btn-outline btn-sm sm:btn-md"
            >
              <UsersIcon className="size-4" />
              Friend Requests
            </Link>
          </div>

          {loadingFriends ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-2xl border border-base-300 bg-base-200/70"
                />
              ))}
            </div>
          ) : friendsError ? (
            <div className="rounded-2xl border border-error/20 bg-base-200 p-6 text-center">
              <p className="font-semibold">Couldn't load your friends.</p>
              <button
                className="btn btn-outline btn-sm mt-3"
                onClick={() => refetchFriends()}
              >
                <RefreshCwIcon className="size-4" />
                Try again
              </button>
            </div>
          ) : friends.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/50 px-5 py-10 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UsersIcon className="size-6" />
              </div>
              <h3 className="font-semibold">Your community starts here</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-base-content/65">
                Find language partners below and send your first friend request.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {friends.map((friend) => (
                <FriendCard key={friend._id} friend={friend} />
              ))}
            </div>
          )}
        </section>

        {/* DISCOVERY SECTION */}
        <section>
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <SparklesIcon className="size-5 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Discover
                </span>
              </div>

              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Meet New Learners
              </h2>

              <p className="mt-1 max-w-xl text-sm text-base-content/65 sm:text-base">
                Meet people, exchange languages, and learn from each other.
              </p>
            </div>

            {!loadingUsers && !usersError && (
              <div className="text-sm text-base-content/60">
                <span className="font-semibold text-base-content">
                  {filteredUsers.length}
                </span>{" "}
                {filteredUsers.length === 1 ? "learner" : "learners"} found
              </div>
            )}
          </div>

          {/* SEARCH AND FILTERS */}
          <div className="mb-6 rounded-2xl border border-base-300 bg-base-200/60 p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="input input-bordered flex items-center gap-2 rounded-xl md:col-span-1">
                <SearchIcon className="size-4 shrink-0 text-base-content/50" />
                <input
                  type="search"
                  className="grow"
                  placeholder="Search name, location, bio..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Search learners"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="btn btn-ghost btn-xs btn-circle"
                    aria-label="Clear search"
                  >
                    <XIcon className="size-4" />
                  </button>
                )}
              </label>

              <select
                className="select select-bordered w-full rounded-xl"
                value={nativeFilter}
                onChange={(event) => setNativeFilter(event.target.value)}
                aria-label="Filter by native language"
              >
                <option value="all">All native languages</option>
                {nativeLanguages.map((language) => (
                  <option key={language} value={language}>
                    {capitialize(language)}
                  </option>
                ))}
              </select>

              <select
                className="select select-bordered w-full rounded-xl"
                value={learningFilter}
                onChange={(event) => setLearningFilter(event.target.value)}
                aria-label="Filter by learning language"
              >
                <option value="all">All learning languages</option>
                {learningLanguages.map((language) => (
                  <option key={language} value={language}>
                    {capitialize(language)}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex justify-end">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={clearFilters}
                >
                  <XIcon className="size-4" />
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* LEARNER RESULTS */}
          {loadingUsers ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-2xl border border-base-300 bg-base-200/70"
                />
              ))}
            </div>
          ) : usersError ? (
            <div className="rounded-2xl border border-error/20 bg-base-200 p-8 text-center">
              <p className="font-semibold">Couldn't load recommendations.</p>
              <p className="mt-1 text-sm text-base-content/60">
                Check your connection and try again.
              </p>
              <button
                className="btn btn-primary btn-sm mt-4"
                onClick={() => refetchUsers()}
              >
                <RefreshCwIcon className="size-4" />
                Retry
              </button>
            </div>
          ) : recommendedUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/50 px-5 py-12 text-center">
              <SparklesIcon className="mx-auto mb-3 size-8 text-primary" />
              <h3 className="text-lg font-semibold">
                New connections are on their way
              </h3>
              <p className="mt-2 text-sm text-base-content/65">
                There aren't any recommendations available right now. Check back soon!
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-base-300 bg-base-200/50 px-5 py-12 text-center">
              <SearchIcon className="mx-auto mb-3 size-8 text-base-content/40" />
              <h3 className="text-lg font-semibold">No matching learners</h3>
              <p className="mt-2 text-sm text-base-content/65">
                Try a different name or language filter.
              </p>
              <button
                className="btn btn-outline btn-sm mt-4"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredUsers.map((user) => {
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);

                return (
                  <article
                    key={user._id}
                    className="group flex flex-col rounded-2xl border border-base-300 bg-base-200/70 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="avatar shrink-0">
                        <div className="size-16 overflow-hidden rounded-2xl ring-2 ring-base-300 transition group-hover:ring-primary/40">
                          <img
                            src={user.profilePic || "/i.png"}
                            alt={user.fullName || "Learner"}
                            loading="lazy"
                          />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-bold">
                          {user.fullName}
                        </h3>

                        {user.location && (
                          <div className="mt-1 flex items-center gap-1 text-sm text-base-content/60">
                            <MapPinIcon className="size-3.5 shrink-0" />
                            <span className="truncate">{user.location}</span>
                          </div>
                        )}

                        <p className="mt-2 text-xs text-base-content/50">
                          Language exchange partner
                        </p>
                      </div>
                    </div>

                    <div className="my-4 h-px bg-base-300" />

                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-secondary badge-outline gap-1 px-2 py-3">
                        {getLanguageFlag(user.nativeLanguage)}
                        Native: {capitialize(user.nativeLanguage)}
                      </span>

                      <span className="badge badge-outline gap-1 px-2 py-3">
                        {getLanguageFlag(user.learningLanguage)}
                        Learning: {capitialize(user.learningLanguage)}
                      </span>
                    </div>

                    <div className="mt-4 min-h-12 flex-1">
                      {user.bio ? (
                        <p className="line-clamp-3 text-sm leading-6 text-base-content/70">
                          {user.bio}
                        </p>
                      ) : (
                        <p className="text-sm italic text-base-content/40">
                          No bio added yet.
                        </p>
                      )}
                    </div>

                    <button
                      className={`btn mt-5 w-full rounded-xl ${
                        hasRequestBeenSent
                          ? "btn-outline"
                          : "btn-primary"
                      }`}
                      onClick={() => sendRequestMutation(user._id)}
                      disabled={hasRequestBeenSent || (isPending && pendingUserId === user._id)}
                    >
                      {hasRequestBeenSent ? (
                        <>
                          <CheckCircleIcon className="size-4" />
                          Request Sent
                        </>
                      ) : (
                        <>
                          <UserPlusIcon className="size-4" />
                          {isPending && pendingUserId === user._id
  ? "Sending..."
  : "Send Friend Request"}
                        </>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default HomePage;


