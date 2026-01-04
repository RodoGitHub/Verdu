import api from './api';

const login = async (username, password) => {
    const response = await api.post('token/', {
        username,
        password,
    });

    if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // Fetch full user details using the new token
        try {
            // Force setting header here because the interceptor might not pick it up instantly in the same flow if not using mutable default
            const userResponse = await api.get('users/users/me/', {
                headers: { Authorization: `Bearer ${response.data.access}` }
            });
            localStorage.setItem('user', JSON.stringify(userResponse.data));
            return {
                ...response.data,
                user: userResponse.data
            };
        } catch (error) {
            console.error("Failed to fetch user details", error);
            // Fallback: store basic info
            localStorage.setItem('user', JSON.stringify({ username }));
        }
    }

    return response.data;
};

const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const refreshUserProfile = async () => {
    const response = await api.get('users/users/me/');
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
};

const AuthService = {
    login,
    logout,
    getCurrentUser,
    refreshUserProfile,
};

export default AuthService;
