'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { parseCookies } from 'nookies';
import ProductCard from '@/components/ProductCard';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

// --- Komponen Cart (Tidak ada perubahan) ---
function Cart({ cart, onCheckout }) {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="sticky top-24 p-6 bg-white rounded-lg shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Keranjang Anda</h3>
            {cart.length === 0 ? (
                <p className="text-gray-500">Keranjang masih kosong.</p>
            ) : (
                <>
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold">{item.nama}</p>
                                    <p className="text-gray-500">x{item.quantity}</p>
                                </div>
                                <p>Rp{new Intl.NumberFormat('id-ID').format(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                    <hr className="my-4"/>
                    <div className="flex justify-between font-bold text-lg">
                        <p>Total</p>
                        <p>Rp{new Intl.NumberFormat('id-ID').format(total)}</p>
                    </div>
                    <button 
                        onClick={onCheckout}
                        className="w-full mt-6 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-all"
                    >
                        Pesan Sekarang
                    </button>
                </>
            )}
        </div>
    );
}


// --- Komponen Modal Peta (Diperbarui) ---
const MapModal = ({ onLocationSelect, onClose }) => {
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState(''); // State untuk input alamat detail
  const defaultCenter = { lat: -6.2088, lng: 106.8456 }; // Jakarta

  const handleMapClick = useCallback((event) => {
    setMarker({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
    });
  }, []);

  const handleConfirmLocation = () => {
    if (!marker) {
      toast.error("Silakan pilih lokasi di peta terlebih dahulu.");
      return;
    }
    if (!address.trim()) {
      toast.error("Detail alamat (nama jalan, patokan) wajib diisi.");
      return;
    }
    // Kirim kembali objek berisi koordinat dan teks alamat
    onLocationSelect({ location: marker, address: address });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <h3 className="text-xl font-bold mb-2">Pilih Lokasi Pengiriman</h3>
        <p className="text-sm text-gray-500 mb-4">Klik pada peta untuk menandai lokasi, lalu isi detail alamat di bawah.</p>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '350px', borderRadius: '8px' }}
          center={defaultCenter}
          zoom={12}
          onClick={handleMapClick}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Detail Alamat</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Cth: Jl. Sudirman No. 2, seberang halte bus"
            className="w-full px-3 py-2 mt-1 border rounded-md"
            required
          />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
          <button onClick={handleConfirmLocation} className="px-4 py-2 bg-green-600 text-white rounded-lg">Konfirmasi Pesanan</button>
        </div>
      </div>
    </div>
  );
};


// Halaman Detail Toko
export default function StoreDetailPage() {
  const params = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { isLoaded, loadError } = useLoadScript({
      googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      libraries: ['places'],
  });

  useEffect(() => {
    async function fetchData() {
        if (!params.id) return;
        setLoading(true);
        try {
            const storeRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/stores/${params.id}`);
            setStore(storeRes.data);
            
            const productsRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products/store/${params.id}`);
            setProducts(productsRes.data);
        } catch (error) {
            toast.error("Gagal mengambil data toko.");
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [params.id]);

  const handleAddToCart = (product) => {
    setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === product.id);
        if (existingItem) {
            return prevCart.map(item => 
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        }
        return [...prevCart, { ...product, quantity: 1 }];
    });
    toast.success(`${product.nama} ditambahkan ke keranjang!`);
  };
  
  // Fungsi ini sekarang menerima objek berisi lokasi dan alamat
  const handleLocationSelected = async (data) => {
    setIsMapModalOpen(false);
    const { location, address } = data;
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
        toko_id: store.id,
        total_price: totalPrice,
        delivery_address: address, // Gunakan alamat dari modal
        delivery_latitude: location.lat,
        delivery_longitude: location.lng,
        items: cart.map(item => ({
            produk_id: item.id,
            quantity: item.quantity,
            price: item.price,
        })),
    };

    try {
        const { token } = parseCookies();
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/orders`, orderData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Pesanan berhasil dibuat!");
        setCart([]);
        router.push('/pesanan');
    } catch (error) {
        toast.error(error.response?.data?.message || "Gagal membuat pesanan.");
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
        toast.error("Anda harus login untuk melakukan pesanan.");
        router.push('/login');
        return;
    }
    if (cart.length === 0) {
        toast.error("Keranjang Anda kosong.");
        return;
    }
    setIsMapModalOpen(true);
  };

  if (loadError) return <div className="text-center p-10">Error memuat peta.</div>;
  if (!isLoaded || loading) return <div className="text-center p-10">Loading...</div>;
  if (!store) return <div className="text-center p-10">Toko tidak ditemukan.</div>;

  return (
    <div className="container mx-auto p-6">
        {isMapModalOpen && <MapModal onLocationSelect={handleLocationSelected} onClose={() => setIsMapModalOpen(false)} />}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-4xl font-extrabold mb-2 text-gray-800">{store.nama_toko}</h1>
            <p className="text-lg text-gray-600">{store.alamat}</p>
            <p className="text-md text-gray-500 mt-2">{store.deskripsi}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg-col-span-2">
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">Menu</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                  ))}
                </div>
            </div>
            <div>
                <Cart cart={cart} onCheckout={handleCheckout} />
            </div>
        </div>
    </div>
  );
}