import dotenv from 'dotenv'
dotenv.config();

const email = process.argv[3];
const password = "Testpassword@123";
const functionToCall = process.argv[2];

// RUN in terminal: npm run test-login signup <email> || npm run test-login login <email>

async function signUpUser(email: string, password: string) {
    try {
        const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/signup`, {
            method: 'POST',
            headers: {
                apikey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) throw data;

        console.log('✅ Signed up user:', data);


        const user = await fetch(`http://localhost:${process.env.PORT || 6969}/api/v1/user/me`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: data.email, user_id: data.id })
        })
        const userData = await user.json();
        console.log('✅ User created:', userData);


        return data.user_metadata.sub;
    } catch (error: any) {
        console.error('❌ Sign-up failed:', error.error_description || error.message || error);
        return null;
    }
}

async function loginUser(email: string, password: string) {
    try {
        const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
                apikey: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) throw data;

        console.log('✅ Logged in user:', data.user.id);
        console.log('✅ Email in user:', data.user.email);
        console.log('🔐 JWT:', data.access_token);
        return { token: data.access_token, userId: data.user.id };
    } catch (error: any) {
        console.error('❌ Login failed:', error.error_description || error.message || error);
        return null;
    }
}

(async () => {
    if (functionToCall === 'signup') {
        await signUpUser(email, password);
    } else if (functionToCall === 'login') {
        await loginUser(email, password);
    }
})();
