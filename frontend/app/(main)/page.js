import Link from 'next/link';
import Header from '@/components/Header';

async function getStores() {
  // Ganti URL dengan URL backend Anda
  const res = await fetch('http://localhost:5000/api/stores', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export default async function HomePage() {
  const stores = await getStores();

  return (
    <div>
      <Header />
      <main className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Restoran Terdekat</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Link href={`/toko/${store.id}`} key={store.id}>
              <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Placeholder untuk gambar toko */}
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold">{store.nama_toko}</h2>
                  <p className="text-gray-600 mt-2">{store.deskripsi}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}