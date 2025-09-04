// app/admin/layout.js
export default function AdminLayout({ children }) {
  return (
    <div className="flex bg-gray-50">
      {/* Sidebar akan ditempatkan di sini oleh page.js */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}