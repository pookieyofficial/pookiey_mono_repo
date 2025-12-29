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
    console.log("🔄 Requesting presigned URLs for mimeTypes:", mimeTypes);
    console.log("🔗 API endpoint:", getPresignedUrlAPI);
    
    if (!getPresignedUrlAPI) {
        const error = new Error("API endpoint not configured. Please set EXPO_PUBLIC_BACKEND_API_URL");
        console.error("❌", error.message);
        throw error;
    }
    
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

        console.log("📤 Sending request with payload:", payload);
        console.log("🔑 Using token:", idToken.substring(0, 20) + "...");
        
        const response = await axios.post(getPresignedUrlAPI, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            timeout: 30000, // 30 second timeout
        });

        console.log("📥 Full response:", JSON.stringify(response.data, null, 2));
        
        if (!response.data) {
            console.error("❌ No data in response");
            throw new Error("No data received from server");
        }

        if (!response.data.success) {
            console.error("❌ Request failed:", response.data.message);
            throw new Error(response.data.message || "Failed to get presigned URLs");
        }

        if (!response.data.data || !response.data.data.urls) {
            console.error("❌ Invalid response structure:", response.data);
            throw new Error("Invalid response structure from server");
        }

        if (!Array.isArray(response.data.data.urls) || response.data.data.urls.length === 0) {
            console.error("❌ No URLs in response:", response.data.data.urls);
            throw new Error("No presigned URLs returned from server");
        }

        console.log("✅ Presigned URLs received:", response.data.data.urls);
        return response.data.data.urls;
    } catch (error: any) {
        console.error("❌ Error in requestPresignedURl:");
        if (error.response) {
            // Server responded with error status
            console.error("  Status:", error.response.status);
            console.error("  Data:", JSON.stringify(error.response.data, null, 2));
            console.error("  Headers:", error.response.headers);
            const errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
            throw new Error(errorMessage);
        } else if (error.request) {
            // Request was made but no response received
            console.error("  No response received from server");
            console.error("  Request URL:", error.config?.url);
            throw new Error("Network error: Could not reach server. Please check your internet connection.");
        } else if (error.message) {
            // Error setting up the request
            console.error("  Error message:", error.message);
            throw error;
        } else {
            console.error("  Unknown error:", error);
            throw new Error("Unknown error occurred while requesting presigned URLs");
        }
    }
}

