import Router from 'express'
import { v4 as uuidv4 } from 'uuid'
import s3 from '../config/s3configure';

const router = Router();
router.post('/get-signed-url', async (req, res) => {

    if (!process.env.AWS_BUCKET_NAME) {
        throw new Error("Missing required AWS_BUCKET_NAME environment variable");
    }
    try {
        const { count } = req.body;
        const urls = await Promise.all(
            Array.from({ length: count }).map(async () => {
                const key = `${uuidv4()}.jpg`;
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: key,
                    Expires: 120,
                    ContentType: 'image/jpeg'
                }

                const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

                return {
                    uploadUrl,
                    fileURL: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
                };



            })
        )

        return res.status(200).json({ urls });

    } catch (error) {
        console.log("error from the get seigned url from the s3presignedurl from the routes", error);
    }


})

export default router;


