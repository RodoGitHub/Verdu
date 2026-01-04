import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const AdminLayout = () => {
    const { logout } = useAuth(); // Navbar handles logout now, but sidebar might need it too if kept
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
            {/* Sidebar (Sleek new version) */}
            <aside className="w-20 lg:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 z-40 fixed h-full shadow-lg">
                <div className="h-20 flex items-center justify-center border-b border-gray-100 dark:border-gray-700">
                    <span className="text-3xl font-extrabold text-green-500 tracking-tighter">V<span className="hidden lg:inline text-gray-700 dark:text-white">.</span></span>
                </div>

                <nav className="flex-1 py-6 space-y-2 px-3">
                    <NavItem to="/admin/dashboard" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>} label="Dashboard" />
                    <NavItem to="/admin/products" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>} label="Productos" />
                    <NavItem to="/admin/sales" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>} label="Ventas" />
                    <NavItem to="/admin/customers" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>} label="Clientes" />
                    <NavItem to="/admin/users" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>} label="Usuarios" />
                    <NavItem to="/admin/payments" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>} label="Pagos" />
                    <NavItem to="/admin/terminals" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>} label="Cajas" />
                    <div className="pt-4 mt-auto">
                        <Link to="/pos" className="flex items-center gap-4 px-4 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-95 transition-all duration-200 group">
                            <svg className="w-8 h-8 flex-shrink-0 group-hover:rotate-3 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            <span className="font-bold text-lg hidden lg:block">Ir al POS</span>
                        </Link>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 ml-20 lg:ml-64 flex flex-col min-h-screen">
                {/* Floating Navbar */}
                <Navbar />

                {/* Content */}
                <main className="flex-1 p-6 pt-0 animate-[fadeIn_0.5s_ease-out]">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

const NavItem = ({ to, icon, label }) => (
    <Link to={to} className="flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-green-400 rounded-xl transition-all duration-200 group">
        <svg className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
        <span className="font-medium hidden lg:block">{label}</span>
    </Link>
);

export default AdminLayout;
