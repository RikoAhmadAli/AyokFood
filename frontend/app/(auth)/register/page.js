'use client'
import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';

// Konfigurasi Peta
const mapContainerStyle = {
    width: '100%',
    height: '300px',
    borderRadius: '8px',
};
const libraries = ['places'];

// Center peta default (Jakarta)
const defaultCenter = {
    lat: -6.2088,
    lng: 106.8456,
};

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        phone_number: '',
        role: 'pembeli', // Default role
        nama_toko: '',
        deskripsi: '',
        alamat: ''
    });
    const { register } = useAuth();
    const [marker, setMarker] = useState(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Fungsi untuk menangani klik pada peta
    const handleMapClick = useCallback((event) => {
        setMarker({
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Gabungkan data form dengan data lokasi dari marker
        const fullFormData = {
            ...formData,
            latitude: marker ? marker.lat : null,
            longitude: marker ? marker.lng : null,
        };
        await register(fullFormData);
    };

    if (loadError) return "Error saat memuat peta.";
    if (!isLoaded) return "Memuat Peta...";

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold text-center text-gray-800">Buat Akun Baru</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Input untuk data user */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                        <input type="text" name="nama" onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nomor Telepon</label>
                        <input type="text" name="phone_number" onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Daftar Sebagai</label>
                        <select name="role" onChange={handleChange} value={formData.role} className="w-full px-3 py-2 mt-1 border rounded-md">
                            <option value="pembeli">Pembeli</option>
                            <option value="toko">Pedagang (Toko)</option>
                        </select>
                    </div>

                    {/* Input tambahan jika role adalah 'toko' */}
                    {formData.role === 'toko' && (
                        <>
                            <hr className="my-6"/>
                            <h2 className="text-xl font-semibold text-center text-gray-700">Informasi Toko</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nama Toko</label>
                                <input type="text" name="nama_toko" onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deskripsi Toko</label>
                                <textarea name="deskripsi" onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Alamat Toko</label>
                                <textarea name="alamat" onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md" required></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Pilih Lokasi di Peta</label>
                                <p className="text-xs text-gray-500 mb-2">Klik pada peta untuk menentukan lokasi tokomu.</p>
                                <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                zoom={12}
                                center={defaultCenter}
                                onClick={handleMapClick}
                                >
                                {marker && <Marker position={marker} />}
                                </GoogleMap>
                            </div>
                        </>
                    )}

                    <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700">
                        Register
                    </button>
                    <p className="text-sm text-center text-gray-600">
                        Sudah punya akun? <Link href="/login" className="font-medium text-green-600 hover:underline">Login di sini</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}