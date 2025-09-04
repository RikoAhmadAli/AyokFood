'use client'
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { parseCookies } from 'nookies';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { FiArchive, FiDollarSign, FiBox, FiEdit, FiTrash2, FiPlus, FiSettings, FiCamera, FiX, FiPackage, FiCheckCircle } from 'react-icons/fi';

// Komponen Modal
const ProductModal = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nama: product?.nama || '',
        deskripsi: product?.deskripsi || '',
        price: product?.price || '',
        category: product?.category || '',
        is_available: product?.is_available !== undefined ? product.is_available : true,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(product?.image_url || null);
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSave = new FormData();
        Object.keys(formData).forEach(key => {
            dataToSave.append(key, key === 'is_available' ? (formData[key] ? '1' : '0') : formData[key]);
        });
        if (imageFile) {
            dataToSave.append('productImage', imageFile);
        } else if (product?.image_url) {
            dataToSave.append('image_url', product.image_url);
        }
        onSave(dataToSave, product?.id);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all" >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">{product ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <div 
                            className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer border-2 border-dashed"
                            onClick={() => fileInputRef.current.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg"/>
                            ) : (
                                <FiCamera className="text-gray-400" size={32}/>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                        <div className="flex-1 space-y-4">
                            <input name="nama" value={formData.nama} onChange={handleChange} placeholder="Nama Produk" className="w-full p-3 border rounded-lg" required />
                            <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Harga" className="w-full p-3 border rounded-lg" required />
                        </div>
                    </div>
                    <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} placeholder="Deskripsi Produk" className="w-full p-3 border rounded-lg" rows="3"></textarea>
                    <input name="category" value={formData.category} onChange={handleChange} placeholder="Kategori (misal: Makanan Utama)" className="w-full p-3 border rounded-lg" />
                    <label className="flex items-center space-x-3 text-gray-700">
                        <input name="is_available" type="checkbox" checked={formData.is_available} onChange={handleChange} className="h-5 w-5 rounded text-green-600 focus:ring-green-500"/>
                        <span>Tersedia untuk dijual</span>
                    </label>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200">Batal</button>
                        <button type="submit" className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Simpan Produk</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Komponen Card Statistik (Tidak ada perubahan)
const StatCard = ({ icon, title, value, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-md flex items-center space-x-4 transition-transform transform hover:scale-105">
        <div className={`p-4 rounded-full ${colorClass.bg}`}>
            {icon({ className: `text-2xl ${colorClass.text}` })}
        </div>
        <div>
            <p className="text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);


export default function TokoDashboard() {
    const { user, isAuthenticated, loading } = useAuth();
    const router = useRouter();
    
    // States
    const [stats, setStats] = useState({});
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [storeProfile, setStoreProfile] = useState({ nama_toko: '', deskripsi: '', alamat: '', is_open: true });
    const [activeTab, setActiveTab] = useState('orders');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    // ... (Fungsi fetchData dan useEffect tidak ada perubahan)
    const fetchData = async () => {
        if (!user || !user.toko) return;
        setIsDataLoading(true);
        const { token } = parseCookies();
        const config = { headers: { Authorization: `Bearer ${token}` } };
        try {
            const [statsRes, ordersRes, productsRes, storeRes] = await Promise.all([
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/stores/my-store/stats`, config),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/orders/myorders`, config),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/store/${user.toko.id}`),
                axios.get(`${process.env.NEXT_PUBLIC_API_URL}/stores/${user.toko.id}`)
            ]);
            setStats(statsRes.data);
            setOrders(ordersRes.data);
            setProducts(productsRes.data);
            setStoreProfile(storeRes.data);
        } catch (error) {
            toast.error("Gagal memuat data dasbor.");
        } finally {
            setIsDataLoading(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || user?.role !== 'toko') {
                router.push('/login');
            } else if (user?.toko) {
                fetchData();
            }
        }
    }, [user, isAuthenticated, loading, router]);

    // ... (Fungsi handler CRUD tidak ada perubahan)
    const handleStatusUpdate = async (orderId, status) => {
        const { token } = parseCookies();
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, { status }, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Status pesanan diperbarui!");
            fetchData();
        } catch (error) { toast.error("Gagal memperbarui status."); }
    };
    const handleProductSave = async (formData, productId) => {
        const { token } = parseCookies();
        const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
        try {
            if (productId) {
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, formData, config);
                toast.success("Produk berhasil diperbarui!");
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/products`, formData, config);
                toast.success("Produk baru berhasil ditambahkan!");
            }
            setIsModalOpen(false); setEditingProduct(null); fetchData();
        } catch (error) { toast.error(error.response?.data?.message || "Gagal menyimpan produk."); }
    };
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
        const { token } = parseCookies();
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Produk berhasil dihapus.");
            fetchData();
        } catch (error) { toast.error("Gagal menghapus produk."); }
    };
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const { token } = parseCookies();
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/stores/my-store`, storeProfile, { headers: { Authorization: `Bearer ${token}` } });
            toast.success("Profil toko berhasil disimpan.");
        } catch (error) { toast.error("Gagal menyimpan profil."); }
    };
    
    if (loading || !user || user.role !== 'toko') {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100"><p className="text-lg">Mempersiapkan dasbor Anda...</p></div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {isModalOpen && <ProductModal product={editingProduct} onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} onSave={handleProductSave} />}
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Dasbor Toko</h1>
                    <p className="text-gray-500 mt-1">Selamat datang kembali, {user.nama}. Kelola semua aspek tokomu dari sini.</p>
                </div>

                {/* Statistik */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={FiDollarSign} title="Total Pemasukan" value={`Rp${new Intl.NumberFormat('id-ID').format(stats.totalRevenue || 0)}`} colorClass={{ bg: 'bg-green-100', text: 'text-green-600' }} />
                    <StatCard icon={FiCheckCircle} title="Pesanan Selesai" value={stats.totalOrders || 0} colorClass={{ bg: 'bg-blue-100', text: 'text-blue-600' }} />
                    <StatCard icon={FiBox} title="Jumlah Produk Aktif" value={stats.totalProducts || 0} colorClass={{ bg: 'bg-yellow-100', text: 'text-yellow-600' }} />
                </div>

                {/* Konten Utama dengan Tabs */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-4 sm:space-x-8">
                            <button onClick={() => setActiveTab('orders')} className={`py-4 px-1 border-b-2 font-semibold text-sm sm:text-base ${activeTab === 'orders' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Pesanan Masuk</button>
                            <button onClick={() => setActiveTab('products')} className={`py-4 px-1 border-b-2 font-semibold text-sm sm:text-base ${activeTab === 'products' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Kelola Produk</button>
                            <button onClick={() => setActiveTab('profile')} className={`py-4 px-1 border-b-2 font-semibold text-sm sm:text-base ${activeTab === 'profile' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Profil Toko</button>
                        </nav>
                    </div>

                    <div className="mt-6">
                        {isDataLoading ? <p>Memuat data...</p> : (
                            <>
                                {activeTab === 'orders' && (
                                    <div className="space-y-4">
                                        {orders.length > 0 ? orders.map(o => (
                                            <div key={o.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start">
                                                   <div>
                                                        <p className="font-bold text-gray-800">Order #{o.id} - {o.pembeli_nama}</p>
                                                        <p className="text-sm text-gray-600">{o.delivery_address}</p>
                                                   </div>
                                                    <p className="text-xs text-gray-400">{new Date(o.order_date).toLocaleString('id-ID')}</p>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <p className="font-semibold text-green-600 text-lg">Rp{new Intl.NumberFormat('id-ID').format(o.total_price)}</p>
                                                    <select value={o.status} onChange={e => handleStatusUpdate(o.id, e.target.value)} className="p-2 border rounded text-sm focus:ring-green-500 focus:border-green-500">
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="cooking">Cooking</option>
                                                        <option value="on_delivery">On Delivery</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )) : <p className="text-center text-gray-500 py-8">Belum ada pesanan yang masuk.</p>}
                                    </div>
                                )}
                                {activeTab === 'products' && (
                                     <div >
                                        <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} className="mb-6 flex items-center space-x-2 px-5 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"><FiPlus /><span>Tambah Produk</span></button>
                                        <div className="space-y-3">
                                            {products.length > 0 ? products.map(p => (
                                                <div key={p.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-gray-50">
                                                    <div className="flex items-center space-x-4">
                                                        <img src={p.image_url ? p.image_url : 'https://via.placeholder.com/64'} alt={p.nama} className="w-16 h-16 object-cover rounded-md"/>
                                                        <div>
                                                            <p className="font-semibold text-gray-800">{p.nama} <span className={`text-xs ${p.is_available ? 'text-green-600' : 'text-red-500'}`}>{p.is_available ? '(Tersedia)' : '(Habis)'}</span></p>
                                                            <p className="text-sm text-gray-600">Rp{new Intl.NumberFormat('id-ID').format(p.price)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-4">
                                                        <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="text-blue-500 hover:text-blue-700"><FiEdit size={20} /></button>
                                                        <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-700"><FiTrash2 size={20} /></button>
                                                    </div>
                                                </div>
                                            )) : <p className="text-center text-gray-500 py-8">Anda belum menambahkan produk apapun.</p>}
                                        </div>
                                     </div>
                                )}
                                {activeTab === 'profile' && (
                                     <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nama Toko</label>
                                            <input value={storeProfile.nama_toko || ''} onChange={e => setStoreProfile({...storeProfile, nama_toko: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Deskripsi Toko</label>
                                            <textarea value={storeProfile.deskripsi || ''} onChange={e => setStoreProfile({...storeProfile, deskripsi: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows="3"></textarea>
                                        </div>
                                         <div>
                                            <label className="block text-sm font-medium text-gray-700">Alamat Toko</label>
                                            <textarea value={storeProfile.alamat || ''} onChange={e => setStoreProfile({...storeProfile, alamat: e.target.value})} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" rows="2"></textarea>
                                        </div>
                                        <div className="flex items-center">
                                            <input type="checkbox" checked={storeProfile.is_open || false} onChange={e => setStoreProfile({...storeProfile, is_open: e.target.checked})} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                                            <label className="ml-2 block text-sm text-gray-900">Toko Buka</label>
                                        </div>
                                        <button type="submit" className="px-5 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Simpan Perubahan</button>
                                     </form>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}