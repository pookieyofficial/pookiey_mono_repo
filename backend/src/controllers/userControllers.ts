import { Request, Response } from "express";
import { User } from "../models";
import { parseForMonggoSetUpdates } from "../utils/parseReqBody";
import { isValidLocation } from "../utils/validateCoordinates";

export const getMe = async (req: Request, res: Response) => {
    try {
        console.info("getMe controller");
        const user = (req.user as any)?.user;
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

export const getUsers = async (req: Request, res: Response) => {
    try {
        console.info("getUsers controller");

        const currentUserId = req.user?.user_id;

        // Validate location data
        const longitude = parseFloat(req.query.longitude ? req.query.longitude as string : req.user?.profile?.location?.coordinates[0] as unknown as string);
        const latitude = parseFloat(req.query.latitude ? req.query.latitude as string : req.user?.profile?.location?.coordinates[1] as unknown as string);

        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).json({
                success: false,
                message: "Valid latitude and longitude are required"
            });
        }

        const userLocation = [longitude, latitude];
        const radius = parseFloat(req.query.radius as string) || 5000;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const minAge = parseInt(req.query.minAge as string) || 18;
        const maxAge = parseInt(req.query.maxAge as string) || 30;
        const interests = (req.query.interests as string)?.split(",") || [];

        const skip = (page - 1) * limit;

        console.log({ userLocation })
        console.log({ radius })
        console.log({ page })
        console.log({ limit })
        console.log({ minAge })
        console.log({ maxAge })
        console.log({ interests })
        console.log({ currentUserId })

        // Check if we have valid coordinates
        if (!userLocation[0] || !userLocation[1]) {
            return res.status(400).json({
                success: false,
                message: "Invalid location coordinates"
            });
        }

        if (!(isValidLocation(longitude, latitude))) {
            return res.status(400).json({ success: false, message: "Incorrect longitude or latitude values" })
        }

        const users = await User.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: userLocation as [number, number] },
                    distanceField: "dist.calculated",
                    spherical: true,
                    maxDistance: radius * 1000,
                },
            },
            // 2. Exclude self
            { $match: { user_id: { $ne: currentUserId } } },
            // 3. Age filter
            // { $match: { age: { $gte: minAge, $lte: maxAge } } },
            // 4. Interest filter (at least one match)
            // { $match: interests.length > 0 ? { interests: { $in: interests } } : {} },
            // 5. Exclude already interacted users
            {
                $lookup: {
                    from: "interactions",
                    let: { targetId: "$_id" },
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
            // { $match: { alreadyInteracted: { $size: 0 } } },
            // // 6. Compute shared interests
            // {
            //     $addFields: {
            //         sharedInterests: { $size: { $setIntersection: ["$interests", interests] } },
            //         randomFactor: { $rand: {} },
            //     },
            // },
            // // 7. Weighted sort: shared interests + random
            // { $sort: { sharedInterests: -1, randomFactor: 1 } },
            // 8. Pagination
            { $skip: skip },
            { $limit: limit },
        ]);

        // console.log({ users });
        res.json({ success: true, data: users });
    } catch (error) {
        console.error("getUsers error:", error);
        res.status(400).json({ success: false, message: "Get users failed" });
    }
};