import { Router } from 'express';
import { getPresignedUrls } from '../controllers/awsController';
import { verifyToken } from '../middleware/userMiddlewares';

const awsRouter = Router();

awsRouter.post('/get-s3-presigned-url', verifyToken, getPresignedUrls);

export default awsRouter;


