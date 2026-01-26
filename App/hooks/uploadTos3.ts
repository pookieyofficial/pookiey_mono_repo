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
            return true;
        } else {
            return false;
        }
    } catch (error) {
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
                return false;
            }
        }
        )
    );

    return results;
}

export async function requestPresignedURl(mimeTypes: string[]) {
    
    if (!getPresignedUrlAPI) {
        const error = new Error("API endpoint not configured. Please set EXPO_PUBLIC_BACKEND_API_URL");
        throw error;
    }
    
    try {
        const idToken = useAuthStore.getState().getIdToken();
        
        if (!idToken) {
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
            timeout: 30000, // 30 second timeout
        });

        
        if (!response.data) {
            throw new Error("No data received from server");
        }

        if (!response.data.success) {
            throw new Error(response.data.message || "Failed to get presigned URLs");
        }

        if (!response.data.data || !response.data.data.urls) {
            throw new Error("Invalid response structure from server");
        }

        if (!Array.isArray(response.data.data.urls) || response.data.data.urls.length === 0) {
            throw new Error("No presigned URLs returned from server");
        }

        return response.data.data.urls;
    } catch (error: any) {
        if (error.response) {
            // Server responded with error status
            const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            throw new Error(errorMessage);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error("Network error: Could not reach server. Please check your internet connection.");
        } else if (error.message) {
            // Error setting up the request
            throw error;
        } else {
            throw new Error("Unknown error occurred while requesting presigned URLs");
        }
    }
}

