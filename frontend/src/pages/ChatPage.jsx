import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser.js";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api.js";
import TranslatableMessage from "../components/TranslatableMessage.jsx";
import GrammarCorrectionComposer from "../components/GrammarCorrectionComposer.jsx";

import {
  Channel,
  Chat,
  MessageComposer,
  MessageList,
  MessageReactions,
  MessageStatus,
  Thread,
  TypingIndicatorHeader,
  Window,
  WithComponents,
  useChannelActionContext,
} from "stream-chat-react";

import { StreamChat } from "stream-chat";
import { Search, X, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";

import ChatLoader from "../components/ChatLoader.jsx";
import CallButton from "../components/CallButton.jsx";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Individual clickable search result
const SearchResultItem = ({ result, onSelect }) => {
  const message = result.message || result;

  return (
    <button
      type="button"
      onClick={() => onSelect(message.id)}
      className="w-full rounded-xl border border-base-300 bg-base-100 p-3 text-left text-base-content transition-colors hover:border-primary/50 hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="truncate text-sm font-semibold text-base-content">
          {message.user?.name || "Unknown user"}
        </span>

        {message.created_at && (
          <span className="shrink-0 text-xs text-base-content/60">
            {new Date(message.created_at).toLocaleDateString()}
          </span>
        )}
      </div>

      <p className="break-words text-sm text-base-content/80">
        {message.text || "No text content"}
      </p>

      <p className="mt-2 text-xs font-medium text-primary">
        Click to jump to message
      </p>
    </button>
  );
};

// Must be rendered inside the Stream Chat Channel context
const SearchResultNavigator = ({ result, onFinish }) => {
  const { jumpToMessage } = useChannelActionContext();

  const handleSelect = async (messageId) => {
    if (!messageId) {
      toast.error("This message cannot be opened.");
      return;
    }

    try {
      await jumpToMessage(messageId);
      onFinish();
    } catch (error) {
      console.error("Could not navigate to message:", error);
      toast.error("Could not open that message. Please try again.");
    }
  };

  return <SearchResultItem result={result} onSelect={handleSelect} />;
};


const ChatConnectionError = ({ message, onRetry, retrying = false }) => (
  <div className="flex min-h-[60vh] items-center justify-center px-4">
    <div className="w-full max-w-md rounded-2xl border border-base-300 bg-base-100 p-6 text-center shadow-lg">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-error/10 text-error">
        <X size={24} />
      </div>

      <h2 className="text-lg font-bold text-base-content">
        Unable to connect to chat
      </h2>

      <p className="mt-2 text-sm text-base-content/70">
        {message}
      </p>

      <button
        type="button"
        className="btn btn-primary mt-5"
        onClick={onRetry}
        disabled={retrying}
      >
        {retrying ? (
          <>
            <LoaderCircle size={18} className="animate-spin" />
            Reconnecting...
          </>
        ) : (
          "Try again"
        )}
      </button>
    </div>
  </div>
);


const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { authUser } = useAuthUser();

const {
  data: tokenData,
  isPending: tokenLoading,
  isError: tokenError,
  refetch: refetchToken,
} = useQuery({
  queryKey: ["streamToken"],
  queryFn: getStreamToken,
  enabled: !!authUser,
  retry: 1,
});


useEffect(() => {
  let cancelled = false;

  const initChat = async () => {
    if (!authUser || !targetUserId || !tokenData?.token) {
      return;
    }

    setLoading(true);

    try {
      if (!STREAM_API_KEY) {
        throw new Error("Stream API key is missing.");
      }

      const client = StreamChat.getInstance(STREAM_API_KEY);

      if (client.userID && client.userID !== authUser._id) {
        await client.disconnectUser();
      }

      if (!client.userID) {
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
          },
          tokenData.token,
        );
      }

      const channelId = [authUser._id, targetUserId].sort().join("-");

      const currChannel = client.channel("messaging", channelId, {
        members: [authUser._id, targetUserId],
      });

      await currChannel.watch();

      if (cancelled) return;

      setChatClient(client);
      setChannel(currChannel);
    } catch (error) {
      console.error("Error initializing chat:", error);

      if (!cancelled) {
        setChatClient(null);
        setChannel(null);
        toast.error("Could not connect to chat. Please try again.");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  initChat();

  return () => {
    cancelled = true;
  };
}, [tokenData, authUser, targetUserId]);



const [sendingCallLink, setSendingCallLink] = useState(false);

const handleVideoCall = async () => {
  if (!channel || sendingCallLink) return;

  setSendingCallLink(true);

  try {
    const callUrl = `${window.location.origin}/call/${channel.id}`;

    await channel.sendMessage({
      text: `I've started a video call. Join me here: ${callUrl}`,
    });

    toast.success("Video call link sent successfully!");
  } catch (error) {
    console.error("Failed to send video call link:", error);
    toast.error("Couldn't send the video call link. Please try again.");
  } finally {
    setSendingCallLink(false);
  }
};


  const handleSearch = async (event) => {
    event?.preventDefault();

    const query = searchTerm.trim();

    if (!query || !chatClient || !channel) {
      setSearchResults([]);
      setSearchError("");
      setHasSearched(false);
      return;
    }

    setSearching(true);
    setSearchError("");
    setSearchResults([]);
    setHasSearched(false);

    try {
      const response = await chatClient.search({ cid: channel.cid }, query, {
        limit: 10,
      });

      setSearchResults(response.results || []);
      setHasSearched(true);
    } catch (error) {
      console.error("Message search failed:", error);

      setSearchError(
        "We couldn't search your messages. Please check your connection and try again.",
      );
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setSearchError("");
    setSearching(false);
    setHasSearched(false);
    setSearchOpen(false);
  };

  const closeSearchAfterNavigation = () => {
    setSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    setSearchError("");
    setSearching(false);
    setHasSearched(false);
  };
  if (tokenLoading && !tokenData) {
  return <ChatLoader />;
}

if (tokenError && !tokenData) {
  return (
    <ChatConnectionError
      message="We couldn't retrieve your chat credentials. Check your connection and try again."
      onRetry={() => refetchToken()}
    />
  );
}

if (loading || !chatClient || !channel) {
  return <ChatLoader />;
}

  const otherMember = Object.values(channel.state.members).find(
    (member) => member.user?.id !== authUser._id,
  )?.user;

  const otherUserName = otherMember?.name || "Chat Partner";

  return (
    <div className="h-[calc(100dvh-4rem)] min-h-[400px] p-0 sm:h-[93vh] sm:p-4">
      <div className="mx-auto h-full min-h-0 w-full max-w-7xl overflow-hidden border border-base-300 bg-base-100 shadow-lg sm:rounded-2xl">
        <Chat client={chatClient} theme="messaging dark">
         <WithComponents
             overrides={{
               MessageUI: TranslatableMessage,
                 MessageReactions: (props) => (
                  <MessageReactions {...props} visualStyle="segmented" />
                 ),
                 MessageStatus: (props) => <MessageStatus {...props} />,
                 }}
              >
            <Channel channel={channel}>
              <div className="relative flex h-full min-h-0 w-full flex-col">
                <Window>
                  {/* Chat header */}
                  <div className="relative z-20 flex w-full items-center justify-between gap-3 border-b border-base-300 bg-base-100 px-3 py-3 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="avatar shrink-0">
                        <div className="h-11 w-11 overflow-hidden rounded-full bg-base-200 ring-2 ring-primary/20 sm:h-12 sm:w-12">
                          {otherMember?.image ? (
                            <img
                              src={otherMember.image}
                              alt={otherUserName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-base-content">
                              {otherUserName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-base-content sm:text-base">
                          {otherUserName}
                        </h2>

                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              otherMember?.online
                                ? "bg-success"
                                : "bg-base-content/30"
                            }`}
                          />

                          <div className="text-xs text-base-content/60">
                            <TypingIndicatorHeader />
                            <span>
                              {otherMember?.online ? "Online" : "Offline"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-ghost btn-circle btn-sm text-base-content hover:bg-base-200"
                        aria-label="Search messages"
                        title="Search messages"
                        onClick={() => {
                          setSearchOpen((previous) => !previous);
                          setSearchError("");
                          setSearchResults([]);
                        }}
                      >
                        <Search size={19} className="text-base-content" />
                      </button>

                      <CallButton
                          handleVideoCall={handleVideoCall}
                          isLoading={sendingCallLink}
                        />
                    </div>

                    {/* Message search panel */}
                    {searchOpen && (
                      <div className="absolute left-2 right-2 top-full mt-2 rounded-xl border border-base-300 bg-base-100 p-3 text-base-content shadow-xl sm:left-auto sm:right-4 sm:w-96">
                        <form
                          onSubmit={handleSearch}
                          className="flex items-center gap-2"
                        >
                          <Search
                            size={18}
                            className="shrink-0 text-base-content/60"
                          />

                          <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) =>
                              setSearchTerm(event.target.value)
                            }
                            placeholder="Search messages..."
                            aria-label="Search messages"
                            className="input input-bordered input-sm min-w-0 flex-1 border-base-300 bg-base-200 text-base-content placeholder:text-base-content/50 focus:border-primary focus:outline-none"
                          />

                          <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            disabled={searching || !searchTerm.trim()}
                          >
                            Search
                          </button>

                          <button
                            type="button"
                            className="btn btn-ghost btn-circle btn-sm text-base-content"
                            aria-label="Close search"
                            onClick={clearSearch}
                          >
                            <X size={17} />
                          </button>
                        </form>

                        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                          {searching && (
                            <div
                              role="status"
                              className="flex flex-col items-center justify-center gap-2 py-6 text-sm text-base-content/70"
                            >
                              <LoaderCircle
                                size={24}
                                className="animate-spin text-primary"
                              />
                              Searching your messages...
                            </div>
                          )}

                          {!searching && searchError && (
                            <div
                              role="alert"
                              className="flex flex-col items-center gap-2 rounded-xl bg-error/10 px-3 py-5 text-center"
                            >
                              <X size={24} className="text-error" />
                              <p className="text-sm font-semibold text-base-content">
                                Search failed
                              </p>
                              <p className="text-sm text-base-content/70">
                                {searchError}
                              </p>
                              <button
                                type="button"
                                className="btn btn-outline btn-sm mt-1"
                                onClick={handleSearch}
                              >
                                Try again
                              </button>
                            </div>
                          )}

                          {!searching &&
                            !searchError &&
                            !hasSearched &&
                            !searchTerm.trim() && (
                              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                                <Search
                                  size={28}
                                  className="text-base-content/40"
                                />
                                <p className="text-sm font-semibold text-base-content">
                                  Search your conversation
                                </p>
                                <p className="text-xs text-base-content/60">
                                  Enter a keyword to find a message.
                                </p>
                              </div>
                            )}

                          {!searching &&
                            !searchError &&
                            !hasSearched &&
                            searchTerm.trim() && (
                              <p className="py-4 text-center text-sm text-base-content/70">
                                Press Search or Enter to find matching messages.
                              </p>
                            )}

                          {!searching &&
                            !searchError &&
                            hasSearched &&
                            searchResults.length === 0 && (
                              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                                <Search
                                  size={28}
                                  className="text-base-content/40"
                                />
                                <p className="text-sm font-semibold text-base-content">
                                  No messages found
                                </p>
                                <p className="text-xs text-base-content/60">
                                  Try a different keyword or check your
                                  spelling.
                                </p>
                              </div>
                            )}

                          {!searching &&
                            !searchError &&
                            searchResults.map((result, index) => {
                              const message = result.message || result;

                              return (
                                <SearchResultNavigator
                                  key={message.id || index}
                                  result={result}
                                  onFinish={closeSearchAfterNavigation}
                                />
                              );
                            })}

                          {!searching &&
                            !searchError &&
                            searchResults.length > 0 && (
                              <p className="pt-1 text-xs text-base-content/60">
                                Showing up to 10 matching messages.
                              </p>
                            )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Existing real-time message list */}
                  <MessageList />

                  {/* Grammar correction UI */}
                   <GrammarCorrectionComposer />

                  {/* Existing message composer */}
                  <MessageComposer />
                </Window>

                {/* Existing threaded conversations */}
                <Thread />
              </div>
            </Channel>
          </WithComponents>
        </Chat>
      </div>
    </div>
  );
};

export default ChatPage;
