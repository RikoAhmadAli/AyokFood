'use client'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { parseCookies } from 'nookies';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import { FiUsers, FiBox, FiDollarSign, FiArchive, FiTrash2, FiEdit, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

// Komponen Card Statistik
const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
        <div className={`text-3xl p-3 rounded-full ${color}`}>{icon}</div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

// Komponen Tabel (Reusable)
const DataTable = ({ headers, data, renderRow }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    {headers.map((header) => <th key={header} scope="col" className="px-6 py-3">{header}</th>)}
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => renderRow(item, index))}
            </tbody>
        </table>
    </div>
);

export default function AdminDashboard() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    
    // States untuk data
    const [stats, setStats] = useState({});
    const [usersData, setUsersData] = useState([]);
    const [storesData, setStoresData] = useState([]);
    const [productsData, setProductsData] = useState([]);
    const [ordersData, setOrdersData] = useState([]);
    const [activeTab, setActiveTab] = useState('users');

    // Fungsi untuk fetch semua data dari backend
    const fetchData = async () => {
        const { token } = parseCookies();
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const [statsRes, usersRes, storesRes, productsRes, ordersRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, config),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users`, config),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/stores`, config),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/products`, config),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders`, config)
            ]);
            setStats(statsRes.data);
            setUsersData(usersRes.data);
            setStoresData(storesRes.data);
            setProductsData(productsRes.data);
            setOrdersData(ordersRes.data);
        } catch (error) {
            toast.error("Gagal memuat data dashboard.");
        }
    };

    useEffect(() => {
        if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
            toast.error("Akses ditolak.");
            router.push('/login');
            return;
        }
        if (!loading && user) fetchData();
    }, [user, isAuthenticated, loading, router]);
    
    // ================== HANDLER FUNGSI CRUD ==================

    const handleRoleChange = async (userId, newRole) => {
        // (Kode dari respons sebelumnya, tidak ada perubahan)
    };

    const handleDelete = async (id, type) => {
        const endpoints = {
            user: `/users/${id}`,
            store: `/admin/stores/${id}`,
            product: `/admin/products/${id}`,
        };
        if (!window.confirm(`Apakah Anda yakin ingin menghapus ${type} ini?`)) return;

        try {
            const { token } = parseCookies();
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}${endpoints[type]}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} berhasil dihapus.`);
            fetchData(); // Refresh data
        } catch (error) {
            toast.error(error.response?.data?.message || `Gagal menghapus ${type}.`);
        }
    };

    if (loading || !user || user.role !== 'admin') {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p>Memuat...</p></div>
    }

    const renderContent = () => {
        switch(activeTab) {
            case 'users':
                return <DataTable headers={['Nama', 'Email', 'Role', 'Aksi']} data={usersData} renderRow={(u) => (
                    <tr key={u.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{u.nama}</td>
                        <td className="px-6 py-4">{u.email}</td>
                        <td className="px-6 py-4"><select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} disabled={u.id === user.id} className="p-1 border rounded text-xs"><option>pembeli</option><option>toko</option><option>admin</option></select></td>
                        <td className="px-6 py-4"><button onClick={() => handleDelete(u.id, 'user')} disabled={u.id === user.id} className="text-red-500 disabled:text-gray-300"><FiTrash2 /></button></td>
                    </tr>
                )}/>;
            case 'stores':
                return <DataTable headers={['Nama Toko', 'Pemilik', 'Status', 'Aksi']} data={storesData} renderRow={(s) => (
                     <tr key={s.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{s.nama_toko}</td>
                        <td className="px-6 py-4">{s.pemilik} ({s.email})</td>
                        <td className="px-6 py-4">{s.is_open ? <span className="text-green-500">Buka</span> : <span className="text-red-500">Tutup</span>}</td>
                        <td className="px-6 py-4"><button onClick={() => handleDelete(s.id, 'store')} className="text-red-500"><FiTrash2 /></button></td>
                    </tr>
                )}/>;
            case 'products':
                 return <DataTable headers={['Nama Produk', 'Toko', 'Harga', 'Status', 'Aksi']} data={productsData} renderRow={(p) => (
                     <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">{p.nama}</td>
                        <td className="px-6 py-4">{p.nama_toko}</td>
                        <td className="px-6 py-4">Rp{new Intl.NumberFormat('id-ID').format(p.price)}</td>
                        <td className="px-6 py-4">{p.is_available ? <span className="text-green-500">Tersedia</span> : <span className="text-red-500">Habis</span>}</td>
                        <td className="px-6 py-4"><button onClick={() => handleDelete(p.id, 'product')} className="text-red-500"><FiTrash2 /></button></td>
                    </tr>
                )}/>;
            case 'orders':
                return <DataTable headers={['ID', 'Pembeli', 'Toko', 'Total', 'Status', 'Tanggal']} data={ordersData} renderRow={(o) => (
                     <tr key={o.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-bold">#{o.id}</td>
                        <td className="px-6 py-4">{o.pembeli}</td>
                        <td className="px-6 py-4">{o.nama_toko}</td>
                        <td className="px-6 py-4">Rp{new Intl.NumberFormat('id-ID').format(o.total_price)}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{o.status}</span></td>
                        <td className="px-6 py-4">{new Date(o.order_date).toLocaleDateString('id-ID')}</td>
                    </tr>
                )}/>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />
            <div className="container mx-auto p-6 lg:p-8">
                <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
                <p className="text-gray-500 mb-8">Selamat datang, {user.nama}.</p>

                {/* Bagian Statistik */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard icon={<FiUsers />} title="Total Pengguna" value={stats.totalUsers} color="bg-blue-100 text-blue-600" />
                    <StatCard icon={<FiBox />} title="Total Toko" value={stats.totalStores} color="bg-green-100 text-green-600" />
                    <StatCard icon={<FiArchive />} title="Pesanan Sukses" value={stats.totalOrders} color="bg-yellow-100 text-yellow-600" />
                    <StatCard icon={<FiDollarSign />} title="Total Pendapatan" value={`Rp${new Intl.NumberFormat('id-ID').format(stats.totalRevenue || 0)}`} color="bg-purple-100 text-purple-600" />
                </div>

                {/* Bagian Manajemen Data */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                             {['users', 'stores', 'products', 'orders'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`capitalize py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                    {tab.replace('_', ' ')}
                                </button>
                             ))}
                        </nav>
                    </div>
                    <div className="mt-6">{renderContent()}</div>
                </div>
            </div>
        </div>
    );
}