import Sidebar from './Sidebar';
import TopBar from './TopBar';

// Layout wrapper untuk semua halaman fitur menu (Dashboard, Gate, Anomaly, Reports)
export default function AppLayout({ children, breadcrumb, status }) {
  return (
    <div className="bg-background text-on-background font-body-base h-screen overflow-hidden flex">
      <Sidebar />
      <div className="flex-1 ml-20 lg:ml-64 flex flex-col h-screen relative">
        <TopBar breadcrumb={breadcrumb} status={status} />
        <main className="flex-1 overflow-y-auto mt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
