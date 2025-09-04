'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const { token } = parseCookies();
        if (token) {
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(response => {
                setUser(response.data);
            }).catch(() => {
                destroyCookie(null, 'token');
                setUser(null);
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, { email, password });
            setCookie(null, 'token', data.token, { maxAge: 30 * 24 * 60 * 60, path: '/' });
            axios.defaults.headers.Authorization = `Bearer ${data.token}`;
            setUser(data);
            toast.success('Login berhasil!');
            // Redirect berdasarkan role
            if (data.role === 'admin') router.push('/admin');
            else if (data.role === 'toko') router.push('/toko');
            else router.push('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Email atau password salah.');
        }
    };
    
    const register = async (userData) => {
        try {
            const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, userData);
            setCookie(null, 'token', data.token, { maxAge: 30 * 24 * 60 * 60, path: '/' });
            axios.defaults.headers.Authorization = `Bearer ${data.token}`;
            setUser(data);
            toast.success('Registrasi berhasil!');
            // Redirect berdasarkan role
            if (data.role === 'toko') router.push('/toko');
            else router.push('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registrasi gagal.');
        }
    };

    const logout = () => {
        destroyCookie(null, 'token');
        delete axios.defaults.headers.Authorization;
        setUser(null);
        toast.success('Logout berhasil!');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);