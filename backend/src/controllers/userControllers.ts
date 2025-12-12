import { Request, Response } from "express";
import { User } from "../models";
import { parseForMonggoSetUpdates } from "../utils/parseReqBody";
import { isValidLocation } from "../utils/validateCoordinates";
import type { IUser } from "../models/User";

const REFERRAL_CODE_LENGTH = 6;
const REFERRAL_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const generateReferralCode = (): string => {
    let code = "";
    for (let i = 0; i < REFERRAL_CODE_LENGTH; i++) {
        const index = Math.floor(Math.random() * REFERRAL_CHARSET.length);
        code += REFERRAL_CHARSET.charAt(index);
    }
    return code;
};

const generateUniqueReferralCode = async (): Promise<string> => {
    for (let attempt = 0; attempt < 8; attempt++) {
        const code = generateReferralCode();
        const exists = await User.exists({ referralCode: code });
        if (!exists) {
            return code;
        }
    }
    throw new Error("Unable to generate unique referral code");
};

export const getMe = async (req: Request, res: Response) => {
    try {
        console.info("getMe controller");
        const user = req.user;
        console.log({ user })

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ success: true, data: user });
    }
    catch (error) {
        console.log('getMe error:', error);
        res.status(400).json({ message: "Get user failed" });
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        console.info("createUser controller");

        // Get user data from verified token (middleware sets this)
        const tokenUser = req.user as any;
        const { displayName, photoURL, provider = "google" } = req.body;

        const user_id = tokenUser.user_id;
        const email = tokenUser.email;
        const phoneNumber = tokenUser.phoneNumber;

        console.log("Token user data:", { user_id, email, phoneNumber, provider });
        console.log("Request body data:", { displayName, photoURL, provider });

        if (!user_id) {
            return res.status(400).json({ success: false, message: "Supabase ID is required" });
        }

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        // First check if user already exists with this user_id
        const existingUser = await User.findOne({ user_id });
        if (existingUser) {
            res.json({ success: true, message: "User already exists", data: existingUser });
            return;
        }

        // Check if a user already registered with this email
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            res.status(400).json({ success: false, message: "Email already registered" });
            return;
        }

        // Check if a user already registered with this phone number
        if (phoneNumber) {
            const existingPhone = await User.findOne({ phoneNumber });
            if (existingPhone) {
                res.status(400).json({ success: false, message: "Phone number already registered" });
                return;
            }
        }

        // Create new user with data from Supabase
        const userData: any = {
            user_id,
            email,
            provider,
            displayName: displayName || email.split('@')[0],
            photoURL,
            isEmailVerified: provider === "google" || provider === "email",
            isPhoneVerified: !!phoneNumber,
        };

        if (phoneNumber) {
            userData.phoneNumber = phoneNumber;
        }

        // Create new user in database
        const response = await User.create(userData);
        res.json({ success: true, data: response });
    }
    catch (error: any) {
        console.log("Create user error:", error);
        res.status(400).json({ success: false, message: "Create user failed", error: error.message });
    }
};

export const getReferralCode = async (req: Request, res: Response) => {
    try {
        const user = req.user as IUser | undefined;

        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (user.referralCode) {
            return res.json({
                success: true,
                data: { referralCode: user.referralCode },
            });
        }

        const referralCode = await generateUniqueReferralCode();
        const updatedUser = await User.findOneAndUpdate(
            { user_id: user.user_id },
            { $set: { referralCode } },
            { new: true }
        ).select("referralCode");

        res.json({
            success: true,
            data: { referralCode: updatedUser?.referralCode || referralCode },
        });
    } catch (error: any) {
        console.error("getReferralCode error:", error);
        res.status(400).json({
            success: false,
            message: error?.message || "Could not fetch referral code",
        });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        console.info("updateUser controller");
        const user = req.user;
        if (!user) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        if (req.body.user_id || req.body.email || req.body.phoneNumber) {
            res.status(400).json({ message: "User ID, email, and phone number cannot be updated" });
            return;
        }

        const updates = parseForMonggoSetUpdates(req.body);
        console.log({ updates })

        const updatedUser = await User.findOneAndUpdate(
            { user_id: (user as any)?.user_id },
            { $set: updates as any },
            { new: true, runValidators: true });

        if (!updatedUser) {
            res.status(400).json({ message: "User not found" });
            return;
        }
        res.json({ success: true, data: updatedUser });
    }
    catch (error) {
        console.error('updateUser error:', error);
        res.status(400).json({ message: "Update user failed" });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        console.info("getUserById controller");
        const { userId } = req.params;
        const currentUserId = (req.user as any)?.user_id;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const user = await User.findOne({ user_id: userId }).select('-__v');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error("getUserById error:", error);
        res.status(400).json({ success: false, message: "Get user failed" });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        console.info("getUsers controller");

        const authUser = req.user as IUser | undefined;
        const currentUserId = authUser?.user_id;

        if (!authUser || !currentUserId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const coordinates = authUser.profile?.location?.coordinates;
        const longitude = typeof coordinates?.[0] === "number" ? coordinates[0] : undefined;
        const latitude = typeof coordinates?.[1] === "number" ? coordinates[1] : undefined;

        if (longitude === undefined || latitude === undefined) {
            return res.status(400).json({
                success: false,
                message: "Valid latitude and longitude are required in your profile",
            });
        }

        if (!isValidLocation(longitude, latitude)) {
            return res.status(400).json({ success: false, message: "Incorrect longitude or latitude values" });
        }

        const userLocation: [number, number] = [longitude, latitude];
        const radiusKm = authUser.preferences?.distanceMaxKm ?? 50;
        const [minAge, maxAge] = authUser.preferences?.ageRange ?? [18, 99];
        const showMe = authUser.preferences?.showMe;
        const interests = Array.isArray(authUser.profile?.interests)
            ? authUser.profile.interests.filter(Boolean)
            : [];

        /** ---------------------- AGGREGATE PIPELINE ---------------------- **/
        const pipeline: any[] = [
            {
                $geoNear: {
                    near: { type: "Point", coordinates: userLocation },
                    distanceField: "distanceInMeters",
                    spherical: true,
                    maxDistance: radiusKm * 1000,
                },
            },
            // Exclude self
            { $match: { user_id: { $ne: currentUserId } } },
            // Compute age on the fly
            {
                $addFields: {
                    age: {
                        $dateDiff: {
                            startDate: "$profile.dateOfBirth",
                            endDate: "$$NOW",
                            unit: "year",
                        },
                    },
                },
            },
            { $match: { age: { $gte: minAge, $lte: maxAge } } },
        ];

        if (showMe?.length) {
            pipeline.push({ $match: { "profile.gender": { $in: showMe } } });
        }

        if (interests.length) {
            pipeline.push({ $match: { "profile.interests": { $in: interests } } });
        }

        pipeline.push(
            {
                $lookup: {
                    from: "interactions",
                    let: { targetId: "$user_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$fromUser", currentUserId] },
                                        { $eq: ["$toUser", "$$targetId"] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "alreadyInteracted",
                },
            },
            { $match: { $expr: { $eq: [{ $size: "$alreadyInteracted" }, 0] } } },
        );

        if (interests.length) {
            pipeline.push(
                {
                    $addFields: {
                        sharedInterests: {
                            $size: { $setIntersection: ["$profile.interests", interests] },
                        },
                    },
                },
                { $match: { sharedInterests: { $gte: 2 } } },
                { $sort: { sharedInterests: -1 as const, distanceInMeters: 1 as const } },
            );
        } else {
            pipeline.push({ $sort: { distanceInMeters: 1 as const } });
        }

        pipeline.push(
            { $limit: 100 },
            {
                $project: {
                    user_id: 1,
                    displayName: 1,
                    profile: 1,
                    interests: 1,
                    distanceInMeters: 1,
                    age: 1,
                    sharedInterests: 1,
                },
            },
        );

        const users = await User.aggregate(pipeline);
        console.log("------------------------------------------------------")
        console.log("------------------------------------------------------")
        console.log(users)
        res.json({ success: true, data: users });
    } catch (error) {
        console.error("getUsers error:", error);
        res.status(400).json({ success: false, message: "Get users failed" });
    }
};