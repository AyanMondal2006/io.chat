import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const AVATAR_API_URL = "https://avatar-api-seven.vercel.app";

// Get a random avatar from your Avatar API with robust fallback
async function getRandomAvatar() {
    try {
        const response = await fetch(
            `${AVATAR_API_URL}/api/avatars/random`,
            { signal: AbortSignal.timeout(6000) }
        );

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.avatar?.imageUrl) {
                return data.avatar.imageUrl;
            }
        }
    } catch (error) {
        console.warn("External Avatar API unavailable, using fallback:", error.message);
    }

    // High quality deterministic/random fallback avatar
    const randomSeed = Math.random().toString(36).substring(7);
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`;
}

export async function getRandomAvatarHandler(req, res) {
    try {
        const avatarUrl = await getRandomAvatar();
        res.status(200).json({ success: true, avatarUrl });
    } catch (error) {
        console.error("Error in getRandomAvatarHandler:", error.message);
        const randomSeed = Math.random().toString(36).substring(7);
        res.status(200).json({
            success: true,
            avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${randomSeed}`,
        });
    }
}

export async function signup(req, res) {
    const { email, password, fullName } = req.body;

    try {
        if (!email || !password || !fullName) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already exists, please use a different one"
            });
        }

        // Generate random avatar using your new API
        const randomAvatar = await getRandomAvatar();

        const newUser = await User.create({
            email,
            fullName,
            password,
            profilePic: randomAvatar,
        });

        try {
            await upsertStreamUser({
                id: newUser._id.toString(),
                name: newUser.fullName,
                image: newUser.profilePic || "",
            });

            console.log(`Stream user created for ${newUser.fullName}`);
        } catch (error) {
            console.log("Error creating Stream user:", error.message);
        }

        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
        });

        res.status(201).json({
            success: true,
            user: newUser,
            token,
        });

    } catch (error) {
        console.log("Error in sign up controller:", error.message);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordCorrect = await user.matchPassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );

        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: isProduction ? "none" : "lax",
            secure: isProduction,
        });

        res.status(200).json({
            success: true,
            user,
            token,
        });

    } catch (error) {
        console.log("Error in login controller:", error.message);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

export function logout(req, res) {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction,
    });

    res.status(200).json({
        success: true,
        message: "Logout successful"
    });
}

export async function onboard(req, res) {
    try {
        const userId = req.user._id;

        const {
            fullName,
            bio,
            nativeLanguage,
            learningLanguage,
            location
        } = req.body;

        if (
            !fullName ||
            !bio ||
            !nativeLanguage ||
            !learningLanguage ||
            !location
        ) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ].filter(Boolean),
            });
        }

        const updateUser = await User.findByIdAndUpdate(
            userId,
            {
                ...req.body,
                isOnboarded: true,
            },
            { new: true, runValidators: true }
        );

        if (!updateUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        try {
            await upsertStreamUser({
                id: updateUser._id.toString(),
                name: updateUser.fullName,
                image: updateUser.profilePic || "",
            });

            console.log(
                `Stream user updated after onboarding for ${updateUser.fullName}`
            );

        } catch (streamError) {
            console.log(
                "Error updating Stream user during onboarding:",
                streamError.message
            );
        }

        res.status(200).json({
            success: true,
            user: updateUser
        });

    } catch (error) {
        console.error("Onboarding error:", error);

        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}
