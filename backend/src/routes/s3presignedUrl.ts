import Router from 'express'
import { v4 as uuidv4 } from 'uuid'
import s3 from '../config/s3configure';

const router = Router();
router.post('/get-presigned-url', async (req, res) => {

    if (!process.env.AWS_BUCKET_NAME) {
        throw new Error("Missing required AWS_BUCKET_NAME environment variable");
    }
    try {
        const { imageExtension } = req.body;
        console.log({imageExtension});

        if ( Array.isArray(imageExtension) === false || imageExtension.length === 0 ) {
            return res.status(401).json({
                success: false,
                msg: "Array is empty or not an array"
            })
        }

        const urls = await Promise.all(
            imageExtension.map(async (item) => {
                const extension = item.split('/')[1];
                const safeExt = extension === 'jpeg' ? 'jpg' : extension;
                const key = `${uuidv4()}.${safeExt}`;
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: key,
                    Expires: 120,
                    ContentType: `image/${safeExt}`,
                }

                const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

                return {
                    uploadUrl,
                    fileURL: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
                }
            })
        )

        return res.status(200).json({ urls });

    } catch (error) {
        console.log("error from the get seigned url from the s3presignedurl from the routes", error);
    }


})

export default router;


