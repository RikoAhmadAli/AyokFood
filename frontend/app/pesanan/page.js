'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { parseCookies } from 'nookies';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PesananPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [isDataLoading, setIsDataLoading] = useState(true); // State loading khusus untuk data pesanan

    useEffect(() => {
        // Jika proses loading auth selesai dan pengguna tidak terautentikasi,
        // alihkan ke halaman login.
        if (!loading && !isAuthenticated) {
            router.push('/login');
            return; // Hentikan eksekusi lebih lanjut
        }

        // Jika pengguna sudah terautentikasi, ambil data pesanan.
        if (isAuthenticated) {
            const fetchOrders = async () => {
                setIsDataLoading(true);
                const { token } = parseCookies();
                try {
                    const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/history`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setOrders(data);
                } catch (error) {
                    console.error("Gagal mengambil data pesanan:", error);
                    toast.error("Gagal mengambil riwayat pesanan.");
                } finally {
                    setIsDataLoading(false);
                }
            };

            fetchOrders();
        }
    }, [isAuthenticated, loading, router]); // Dependensi disederhanakan
    
    // Tampilkan loading utama jika auth masih diproses
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Riwayat Pesanan Saya</h1>
                
                <div className="space-y-6">
                    {isDataLoading ? (
                        <div className="text-center py-12"><p>Memuat riwayat pesanan...</p></div>
                    ) : orders.length > 0 ? (
                        orders.map(order => (
                            <div key={order.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg text-gray-900">Pesanan di <span className="text-green-600">{order.nama_toko}</span></p>
                                        <p className="text-sm text-gray-500">Order ID: #{order.id}</p>
                                        <p className="text-sm text-gray-600 mt-1">{order.delivery_address}</p>
                                        <p className="text-md text-green-700 font-semibold mt-2">
                                            Rp{new Intl.NumberFormat('id-ID').format(order.total_price)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${
                                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>{order.status}</span>
                                        <p className="text-xs text-gray-400 mt-2">{new Date(order.order_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg shadow-md">
                            <p className="text-gray-500">Anda belum pernah melakukan pesanan.</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}