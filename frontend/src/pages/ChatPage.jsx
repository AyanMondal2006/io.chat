import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import useAuthUser from '../hooks/useAuthUser.js';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../lib/api.js';

import {
  Channel,
  ChannelHeader,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";

import { StreamChat } from 'stream-chat';
import toast from 'react-hot-toast';

import ChatLoader from '../components/ChatLoader.jsx';
import CallButton from '../components/CallButton.jsx';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser // this will run only when authUser is available(!!authUser means convert authUser into a Boolean)
  });

  useEffect(() => {
    const initChat = async () => {
      if(!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...")
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser({
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        }, tokenData.token)

        // Create a channel
        const channelId = [authUser._id, targetUserId].sort().join("-");

        // you and me
        // if i start the chat => channelId: [myId, yourId]
        // if you start the chat => channelId: [yourId, myId] => [myId,yourId] same if we sort it

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });
        
        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);

      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);
  
  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
    }
  }

  if (loading || !chatClient || !channel) return <ChatLoader/>;

//   return (
//     <div className='h-[93vh]'>
//       <Chat client={chatClient}>
//         <Channel channel={channel}>
//           <div className='w-full relative'>
//             <CallButton handleVideoCall={handleVideoCall}/>
//             <Window>
              
//               <ChannelHeader/>
//               <MessageList/>
//               <MessageComposer/>
//             </Window>
//           </div>
//           <Thread/>
//         </Channel>
//       </Chat>
//     </div>
//   );
// };


return (
  <div className="h-[93vh]">
    <Chat client={chatClient}>
      <Channel channel={channel}>
        <div className="w-full relative">
          <Window>
            {/* Custom chat header */}
            <div className="flex w-full items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
              {(() => {
                const otherMember = Object.values(
                  channel.state.members
                ).find(
                  (member) => member.user?.id !== authUser._id
                )?.user;

                return (
                  <>
                    {/* Profile and user details on the left */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
                        {otherMember?.image ? (
                          <img
                            src={otherMember.image}
                            alt={otherMember.name || "User"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center font-semibold">
                            {(otherMember?.name || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-gray-900">
                          {otherMember?.name || "Chat"}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {otherMember?.online ? "Online" : "Offline"}
                        </p>
                      </div>
                    </div>

                    {/* Video call button on the right */}
                    <CallButton
                      handleVideoCall={handleVideoCall}
                    />
                  </>
                );
              })()}
            </div>

            <MessageList />
            <MessageComposer />
          </Window>

          <Thread />
        </div>
      </Channel>
    </Chat>
  </div>
);
};
export default ChatPage;