import { StreamChat } from "stream-chat";
import "dotenv/config"

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret)  {
    console.error("Stream API key or Secret is missing");
}
// we can communicate and interact with our stream application
const streamClient = StreamChat.getInstance(apiKey, apiSecret);
// if it is not existed it will create that but if it is existed it would just update it right with the given data
export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUser(userData);
        return userData;
    } catch (error) {
        console.error("Error upserting Stream user:", error);
    }
};

// do it later
export const generateStreamToken = (userId) => {
    try {
    // ensure userId is a string
      const userIdStr = userId.toString();
      return streamClient.createToken(userIdStr);
    } catch (error) {
      console.error("Error generating Stream token", error);
    }
};