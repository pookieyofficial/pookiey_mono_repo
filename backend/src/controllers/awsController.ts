import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import s3 from '../config/s3configure';

interface PresignedUrlRequest {
    imageExtension?: string[];
    mimeTypes?: string[];
}

interface PresignedUrlResponse {
    uploadUrl: string;
    fileURL: string;
}


export const getPresignedUrls = async (req: Request, res: Response) => {
    try {
        if (!process.env.AWS_BUCKET_NAME) {
            return res.status(500).json({
                success: false,
                message: "AWS_BUCKET_NAME environment variable is not configured"
            });
        }

        if (!process.env.AWS_REGION) {
            return res.status(500).json({
                success: false,
                message: "AWS_REGION environment variable is not configured"
            });
        }

        const { imageExtension, mimeTypes }: PresignedUrlRequest = req.body;
        const userId = (req as any).user.user_id;

        console.log('Generating presigned URLs for user:', userId);
        console.log('Requested mime types:', mimeTypes || imageExtension);

        const requestedMimeTypes = Array.isArray(mimeTypes) && mimeTypes.length > 0
            ? mimeTypes
            : Array.isArray(imageExtension) && imageExtension.length > 0
                ? imageExtension
                : null;

        if (!requestedMimeTypes) {
            return res.status(400).json({
                success: false,
                message: "mimeTypes must be a non-empty array"
            });
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User ID not found in request"
            });
        }

        const urls: PresignedUrlResponse[] = await Promise.all(
            requestedMimeTypes.map(async (mimeType: string) => {        
                const [category, subtype] = mimeType.split('/');
                const sanitizedSubtype = (subtype || '').split(';')[0];
                const extension = sanitizedSubtype || 'bin';
                const safeExt = extension === 'jpeg' ? 'jpg' : extension;
                
                // Organize uploads by user ID folder
                const key = `users/${userId}/${uuidv4()}.${safeExt}`;
                
                console.log(`Generated S3 key for user ${userId}:`, key);
                
                const params = {
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: key,
                    Expires: 120,
                    ContentType: mimeType,
                    ACL: 'public-read',
                };

                const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
                
                const fileURL = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

                return {
                    uploadUrl,
                    fileURL
                };
            })
        );
        console.log("urls", urls);

        return res.status(200).json({
            success: true,
            data: {
                urls
            }
        });

    } catch (error) {
        console.error('Error generating presigned URLs:', error);
        
        return res.status(500).json({
            success: false,
            message: "Internal server error while generating presigned URLs"
        });
    }
};
