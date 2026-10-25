// Import komponen Sidebar dari folder komponen sebagai navigasi samping
import Sidebar from './Sidebar';
// Import komponen TopBar dari folder komponen sebagai bilah status atas
import TopBar from './TopBar';

// Deklarasi fungsi komponen publik AppLayout sebagai kerangka tata letak standar halaman aplikasi SPCT
export default function AppLayout({ children, breadcrumb, status }) {
  // Mengembalikan struktur tata letak induk yang menyatukan Sidebar, TopBar, dan konten utama (children)
  return (
    // Wadah terluar dengan latar belakang tema dan pembagian layar penuh
    <div className="bg-background text-on-background font-body-base h-screen overflow-hidden flex">
      {/* Komponen navigasi bilah samping kiri */}
      <Sidebar />
      {/* Wadah konten utama di sebelah kanan sidebar dengan penyesuaian margin kiri responsif */}
      <div className="flex-1 ml-20 lg:ml-64 flex flex-col h-screen relative">
        {/* Bilah atas memuat rekam jejak rute halaman (breadcrumb) dan status operasional */}
        <TopBar breadcrumb={breadcrumb} status={status} />
        {/* Area utama scrollable penampung konten dinamis tiap halaman */}
        <main className="flex-1 overflow-y-auto mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
