import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { registerFCMToken } from '../services/pushNotificationService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user on startup
    useEffect(() => {
        const path = window.location.pathname;
        let tokenKey = 'sands_token';
        let userKey = 'sands_current_user';

        if (path.startsWith('/admin')) {
            tokenKey = 'sands_admin_token';
            userKey = 'sands_admin_user';
        }

        const token = localStorage.getItem(tokenKey);
        if (token) {
            const cachedUser = localStorage.getItem(userKey);
            if (cachedUser) {
                try {
                    setUser(JSON.parse(cachedUser));
                } catch {
                    localStorage.removeItem(userKey);
                }
            }
            loadUser(userKey);
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async (userKey) => {
        try {
            const res = await api.get('auth/me');
            if (res.data.success) {
                // The backend success utility wraps everything in a 'data' field
                const userData = res.data.data?.user || res.data.user;
                if (userData) {
                    setUser(userData);
                    localStorage.setItem(userKey, JSON.stringify(userData));
                }
            }
        } catch (err) {
            console.error("Failed to load user:", err.message);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const authRequest = async (path, payload, fallbackMessage) => {
        try {
            const res = await api.post(path, payload);
            return res.data;
        } catch (err) {
            return { success: false, message: err.response?.data?.message || fallbackMessage, error: err.response?.data?.error };
        }
    };

    const establishCustomerSession = (result) => {
        if (!result?.success) return result;
        const { user: userData, token } = result.data;
        setUser(userData);
        localStorage.setItem('sands_token', token);
        localStorage.setItem('sands_current_user', JSON.stringify(userData));
        registerFCMToken(true).catch(err => console.error("FCM registration error:", err));
        return result;
    };

    const startLogin = async (email, password) => {
        const result = await authRequest('auth/login', { email, password }, 'Unable to log in. Please try again.');
        if (result.success) {
            establishCustomerSession(result);
            toast.success(result.message || 'Login successful!');
        }
        return result;
    };

    const startRegistration = (profile) =>
        authRequest('auth/register', profile, 'Unable to create account. Please try again.');

    const verifyEmailOtp = async (challengeId, otp) => {
        const result = await authRequest(
            'auth/verify-email-otp',
            { challengeId, otp },
            'Unable to verify the code. Please try again.'
        );
        if (result.success) {
            establishCustomerSession(result);
            toast.success(result.message || 'Login successful!');
        }
        return result;
    };

    const resendEmailOtp = (challengeId) =>
        authRequest('auth/resend-email-otp', { challengeId }, 'Unable to resend the verification email.');

    const requestPasswordReset = (email) =>
        authRequest('auth/forgot-password', { email }, 'Unable to process this request.');

    const verifyPasswordResetOtp = (challengeId, otp) =>
        authRequest('auth/verify-password-reset-otp', { challengeId, otp }, 'Unable to verify the code.');

    const resetPassword = (challengeId, resetToken, newPassword) =>
        authRequest('auth/reset-password', { challengeId, resetToken, newPassword }, 'Unable to reset the password.');

    // --- ADMIN AUTH ---
    const adminLogin = async (email, password) => {
        try {
            const res = await api.post('auth/admin/login', { email, password });
            if (res.data.success) {
                // Backend returns { success: true, data: { token, user } }
                const { user: userData, token } = res.data.data;
                setUser(userData);
                localStorage.setItem('sands_admin_token', token);
                localStorage.setItem('sands_admin_user', JSON.stringify(userData));
                toast.success("Admin login successful!");
                // Register FCM token
                registerFCMToken(true).catch(err => console.error("FCM registration error:", err));
            }
            return res.data;
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Invalid admin credentials" };
        }
    };

    const logout = (options = {}) => {
        setUser(null);
        const path = window.location.pathname;
        if (path.startsWith('/admin')) {
            localStorage.removeItem('sands_admin_token');
            localStorage.removeItem('sands_admin_user');
        } else {
            localStorage.removeItem('sands_token');
            localStorage.removeItem('sands_current_user');
        }
        if (!options?.silent) {
            toast.success("Logged out successfully");
        }
    };

    const deleteAccount = async () => {
        try {
            const res = await api.delete('user/profile/me');
            if (res.data.success) {
                logout({ silent: true });
                toast.success("Account deleted successfully");
                return { success: true, message: res.data.message || "Account deleted successfully" };
            }
            return { success: false, message: res.data.message || "Failed to delete account" };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Failed to delete account" };
        }
    };

    const refreshUser = async () => {
        const path = window.location.pathname;
        let userKey = 'sands_current_user';
        if (path.startsWith('/admin')) {
            userKey = 'sands_admin_user';
        }
        try {
            const res = await api.get('auth/me');
            if (res.data.success) {
                const userData = res.data.data?.user || res.data.user;
                if (userData) {
                    setUser(userData);
                    localStorage.setItem(userKey, JSON.stringify(userData));
                }
            }
        } catch (err) {
            console.error("Failed to refresh user:", err.message);
        }
    };

    const updateProfile = async (profileData) => {
        const originalUser = user;
        // Optimistically update frontend user state immediately
        const optimisticUser = {
            ...user,
            ...profileData
        };
        setUser(optimisticUser);

        try {
            const res = await api.put('user/profile/me', profileData);
            if (res.data.success) {
                const updatedUser = res.data.data?.user || res.data.user;
                if (updatedUser) {
                    setUser(updatedUser);
                    localStorage.setItem('sands_current_user', JSON.stringify(updatedUser));
                }
                return { success: true, user: updatedUser, message: res.data.message || "Profile updated successfully" };
            }
            // Revert on failure
            setUser(originalUser);
            return { success: false, message: res.data.message || "Failed to update profile" };
        } catch (err) {
            // Revert on error
            setUser(originalUser);
            return { success: false, message: err.response?.data?.message || err.message || "Failed to update profile" };
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            startLogin,
            startRegistration,
            verifyEmailOtp,
            resendEmailOtp,
            requestPasswordReset,
            verifyPasswordResetOtp,
            resetPassword,
            adminLogin, 
            logout,
            deleteAccount,
            updateProfile,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};
