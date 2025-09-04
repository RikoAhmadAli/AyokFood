'use client';
import Link from 'next/link';
import { MdLocationOn } from 'react-icons/md'; // Impor ikon lokasi

export default function ProductCard({ product, onAddToCart, isLink = false }) {
  const content = (
    <div className="border rounded-lg p-6 flex flex-col justify-between h-full shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 bg-white">
      <div>
        {/* Menampilkan gambar produk */}
        {product.image_url ? (
            <img 
                src={product.image_url} 
                alt={product.nama} 
                className="w-full h-32 object-cover mb-4 rounded"
            />
        ) : (
            <div className="w-full h-32 bg-gray-200 mb-4 rounded flex items-center justify-center text-gray-400">
                <span>Gambar Produk</span>
            </div>
        )}
        <h3 className="font-bold truncate" title={product.nama}>{product.nama}</h3>
        <p className="text-sm text-green-600 font-semibold">{product.nama_toko}</p>
        
        {/* Info Lokasi dan Jarak */}
        {isLink && product.alamat && (
          <div className="flex items-start text-xs text-gray-500 mt-2">
            <MdLocationOn className="mr-1 mt-0.5 flex-shrink-0 text-gray-400" />
            <span className="truncate flex-grow">{product.alamat}</span>
            {/* Tampilkan jarak jika ada */}
            {product.distance !== null && typeof product.distance !== 'undefined' && (
              <span className="ml-2 font-bold whitespace-nowrap text-gray-700">
                ~{product.distance.toFixed(1)} km
              </span>
            )}
          </div>
        )}

        <p className="text-sm text-gray-500 h-10 overflow-hidden mt-2">{product.deskripsi}</p>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <span className="font-semibold text-lg">Rp{new Intl.NumberFormat('id-ID').format(product.price)}</span>
        {onAddToCart && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-full font-bold hover:bg-green-600 transition-colors"
          >
            + Add
          </button>
        )}
      </div>
    </div>
  );

  if (isLink) {
    return (
      <Link href={`/toko/${product.toko_id}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}