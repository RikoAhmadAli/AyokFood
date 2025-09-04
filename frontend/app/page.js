'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MdLocationOn } from "react-icons/md";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTA from '@/components/CTA';
import ProductCard from '@/components/ProductCard';

// ... (Komponen HeroSection tidak perlu diubah)
const HeroSection = ({ onLocationChange }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const foodMovement = (strength) => {
    if (typeof window !== "undefined") {
      const dx = (mousePosition.x - window.innerWidth / 2) / (window.innerWidth / 2);
      const dy = (mousePosition.y - window.innerHeight / 2) / (window.innerHeight / 2);
      return { x: dx * strength, y: dy * strength };
    }
    return { x: 0, y: 0 };
  };

  const floatingFoods = [
    { src: '/assets/foods/martabak.jpeg', top: "20%", left: "15%", size: "w-28 h-28" },
    { src: '/assets/foods/sate.jpeg', top: "10%", left: "70%", size: "w-24 h-24" },
    { src: '/assets/foods/nasgor.jpeg', top: "55%", left: "20%", size: "w-32 h-32" },
    { src: '/assets/foods/cfc.jpeg', top: "45%", left: "75%", size: "w-36 h-36" },
  ];

  return (
    <section 
      className="bg-red-600 bg-cover bg-center py-20 px-6 text-center relative overflow-hidden" 
      style={{
        backgroundImage: `url(/assets/background.jpeg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black opacity-30"></div>
      
      {/* Gambar makanan melayang */}
      <div className="hidden md:block">
        {floatingFoods.map((food, index) => (
          <motion.div
            key={index}
            animate={foodMovement(15)}
            transition={{ type: "spring", stiffness: 50, damping: 10 }}
            whileHover={{ scale: 1.2, rotate: 10 }}
            className={`absolute ${food.size}`}
            style={{ top: food.top, left: food.left }}
          >
            <motion.img
              src={food.src}
              alt={`Food ${index}`}
              className="w-full h-full rounded-xl shadow-lg object-cover"
              animate={{ y: [0, -10, 0], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        ))}
      </div>

      <motion.div 
        className="container mx-auto relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <img src={'/assets/logo.png'} alt="Logo" className="mx-auto mb-4 w-24" />
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
          Lapar? AyokFood aja
        </h2>
        <p className="text-white text-base md:text-lg mb-8 max-w-2xl mx-auto">
          Pesan makanan favoritmu dari tempat favoritmu, kini di web.
        </p>

        <div className="bg-white rounded-2xl shadow-md max-w-2xl mx-auto p-4 flex flex-col md:flex-row items-center gap-3">
          {/* Input dengan icon */}
          <div className="flex items-center w-full md:flex-1 border border-gray-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-500 transition">
            <MdLocationOn className="text-red-500 text-xl mr-2" />
            <input
              type="text"
              onChange={(e) => onLocationChange(e.target.value)}
              placeholder="Cari berdasarkan nama atau lokasi..."
              className="w-full text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none"
            />
          </div>
          {/* Tombol Explore */}
          <button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-sm transition">
            Explore
          </button>
        </div>
      </motion.div>
    </section>
  );
};


export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi fetchProducts sekarang menerima object lokasi
  const fetchProducts = async (location = null) => {
      setIsLoading(true);
      try {
        let url = `${process.env.NEXT_PUBLIC_API_URL}/products`;
        if (location) {
          url += `?lat=${location.lat}&lng=${location.lng}`;
        }
        const { data } = await axios.get(url);
        setProducts(data);
        setAllProducts(data);
      } catch (error) {
        toast.error("Gagal memuat daftar produk.");
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    // Coba dapatkan lokasi pengguna saat komponen dimuat
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchProducts({ lat: latitude, lng: longitude });
        },
        (error) => {
          toast.error("Gagal mendapatkan lokasi. Menampilkan semua produk.");
          fetchProducts(); // Jika gagal, fetch tanpa parameter lokasi
        }
      );
    } else {
      // Jika browser tidak mendukung geolocation
      fetchProducts();
    }
  }, []);

  const handleSearch = (query) => {
      if (!query) {
          setProducts(allProducts);
          return;
      }
      const lowerCaseQuery = query.toLowerCase();
      const filtered = allProducts.filter(p => 
          p.nama.toLowerCase().includes(lowerCaseQuery) || 
          p.nama_toko.toLowerCase().includes(lowerCaseQuery) ||
          p.alamat?.toLowerCase().includes(lowerCaseQuery) // Tambahkan pencarian berdasarkan alamat
      );
      setProducts(filtered);
  };

  return (
    <div className="bg-gray-50">
      <Header />
      <HeroSection onLocationChange={handleSearch} />
      
      <main className="container mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold mb-6">Pilihan Terdekat Untukmu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
                <p className="col-span-full text-center text-gray-500">Mencari produk di sekitarmu...</p>
            ) : products.length > 0 ? (
                products.map(product => (
                    <ProductCard key={product.id} product={product} isLink={true} />
                ))
            ) : (
                <p className="col-span-full text-center text-gray-500">
                    Oops! Produk yang kamu cari tidak ditemukan.
                </p>
            )}
        </div>
      </main>
      
      <CTA />
      <Footer />
    </div>
  );
}