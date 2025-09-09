import * as express from 'express';
import { User } from '.';

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
