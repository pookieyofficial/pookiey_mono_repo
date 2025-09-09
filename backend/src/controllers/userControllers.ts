import { Request, Response } from "express";

export const getMe = async (req: Request, res: Response) => {
    const user = req.user;
    res.json(user);
};

export const createUser = async (req: Request, res: Response) => {
    const user = req.user;
    res.json(user);
};
