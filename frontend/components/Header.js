'use client';
import { Store, UserCog, ShoppingBag } from "lucide-react"; 
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-extrabold text-green-600 hover:text-green-700 transition"
        >
          AyokFood
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="font-medium text-gray-700 hover:text-green-600 transition"
          >
            Home
          </Link>
          <Link
            href="/hemat"
            className="font-medium text-gray-700 hover:text-green-600 transition"
          >
            AyokFood Hemat
          </Link>
        </nav>

        {/* User Section */}
        <div className="flex items-center space-x-3">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline text-gray-600">
                Halo, <span className="font-semibold">{user.nama}</span>
              </span>
                {user.role === 'toko' && (
                  <Link
                    href="/toko"
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Store className="w-5 h-5" />
                    <span className="hidden sm:inline font-medium">Dasbor Toko</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    <UserCog className="w-5 h-5" />
                    <span className="hidden sm:inline font-medium">Dasbor Admin</span>
                  </Link>
                )}

                {user.role === 'pembeli' && (
                  <Link
                    href="/pesanan"
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="hidden sm:inline font-medium">Pesanan Saya</span>
                  </Link>
                )}
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-full shadow-sm transition"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
