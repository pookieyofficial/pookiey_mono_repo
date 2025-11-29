const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_API_URL;

// Ensure BASE_URL ends with /api/v1 if it doesn't already
const getBaseUrl = () => {
  if (!BASE_URL) {
    console.error('❌ EXPO_PUBLIC_BACKEND_API_URL is not set!');
    return '';
  }
  
  // If BASE_URL already includes /api/v1, use it as is
  if (BASE_URL.includes('/api/v1')) {
    return BASE_URL;
  }
  
  // Otherwise, append /api/v1
  const cleanUrl = BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  return `${cleanUrl}/api/v1`;
};

const API_BASE_URL = getBaseUrl();
export const getPresignedUrlAPI = API_BASE_URL ? `${API_BASE_URL}/aws/get-s3-presigned-url` : '';

if (API_BASE_URL) {
  console.log('🔗 AWS API Base URL:', API_BASE_URL);
  console.log('🔗 Presigned URL endpoint:', getPresignedUrlAPI);
} else {
  console.error('❌ Failed to construct API base URL');
}