import Header from "@/components/Header";

export default function TokoLayout({ children }) {
  // This layout provides a consistent structure for the store dashboard.
  return (
    <div>
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
}