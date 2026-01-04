import { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on boot
        const initAuth = async () => {
            const storedUser = AuthService.getCurrentUser();
            const token = localStorage.getItem('access_token');

            if (storedUser && token) {
                // Set initial user from storage to show UI immediately
                setUser(storedUser);

                // Background refresh of user data to ensure permissions are up to date
                try {
                    const latestUser = await AuthService.refreshUserProfile();
                    // Only update state if data changed to avoid unnecessary renders
                    if (JSON.stringify(latestUser) !== JSON.stringify(storedUser)) {
                        setUser(latestUser);
                    }
                } catch (e) {
                    console.error("Failed to refresh user profile", e);
                    // If refresh fails with auth error, user might be invalid.
                    // But typically api.js interceptor handles logout.
                }
            } else {
                // If inconsistent state (user but no token), clean up
                if (storedUser) {
                    AuthService.logout();
                }
                setUser(null);
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (username, password) => {
        try {
            await AuthService.login(username, password);
            const currentUser = AuthService.getCurrentUser();
            setUser(currentUser);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, error: error.response?.data?.detail || "Error de conexión" };
        }
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
