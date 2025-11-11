import { getPresignedUrlAPI } from "@/APIs/awsAPI";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";

export async function uploadTos3(localUrl: string, presignedUrl: string, mimeType: string) {
    try {
        const response = await FileSystem.uploadAsync(presignedUrl, localUrl, {
            httpMethod: "PUT",
            uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            headers: {
                "Content-Type": mimeType,
            },
        });

        if (response.status === 200) {
            console.log("✅ Uploaded successfully!");
            return true;
        } else {
            console.error("❌ Upload failed with status:", response.status);
            return false;
        }
    } catch (error) {
        console.error("❌ Upload error:", error);
        return false;
    }
}

export async function uploadMultipleTos3(files: { LocalUrl: string, PresignedUrl: string, MimeType: string }[]) {
    const results = await Promise.all(
        files.map(async (file) => {
            try {
                const response = await FileSystem.uploadAsync(file.PresignedUrl, file.LocalUrl, {
                    httpMethod: "PUT",
                    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
                    headers: {
                        "Content-Type": file.MimeType,
                    }
                });

                return response
            } catch (error) {
                console.error("❌ Upload error from uploadMultipleTos3:", error);
                return false;
            }
        }
        )
    );

    return results;
}

export async function requestPresignedURl(mimeTypes: string[]) {
    console.log("mimeTypes from requestPresignedURl: ", mimeTypes);
    
    try {
        const idToken = useAuthStore.getState().getIdToken();
        
        if (!idToken) {
            console.error("❌ No authentication token found");
            throw new Error("Authentication token is required");
        }
        
        const payload = {
            imageExtension: mimeTypes,
            mimeTypes,
        };

        const response = await axios.post(getPresignedUrlAPI, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
        })

        console.log("✅ Presigned URLs response:", response.data);
        return response.data.data.urls;
    } catch (error) {
        console.error("❌ Upload error from requestPresignedURl: ", error);
        return false;
    }
}

