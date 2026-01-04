import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <nav className="sticky top-4 z-50 mx-4 mb-10">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg border border-white/20 dark:border-gray-700 shadow-xl rounded-2xl px-6 py-3 flex justify-between items-center transition-all duration-300 hover:shadow-2xl hover:bg-white/80 dark:hover:bg-gray-800/90">

                {/* Left: Breadcrumb / Title */}
                <div className="flex items-center gap-4">
                    <button className="md:hidden text-gray-500 hover:text-green-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent hidden sm:block">
                        Verdu System
                    </h2>
                </div>


                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-500 hover:text-green-500 transition-colors rounded-full hover:bg-green-50 dark:hover:bg-gray-700/50">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    </button>

                    {/* Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-3 p-1 pr-3 rounded-full border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all hover:bg-white dark:hover:bg-gray-700 group"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 p-[2px]">
                                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                                    <span className="font-bold text-green-600 text-xs">{user?.username?.substring(0, 2).toUpperCase()}</span>
                                </div>
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block group-hover:text-green-500 transition-colors">
                                {user?.username}
                            </span>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden text-sm animate-[fadeIn_0.2s_ease-out] origin-top-right">
                                <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Cuenta</p>
                                    <p className="font-medium text-gray-800 dark:text-white truncate">{user?.email || 'admin@verdu.com'}</p>
                                </div>
                                <div className="py-1">
                                    <Link to="/admin/profile" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-600 transition-colors">
                                        Mi Perfil
                                    </Link>
                                    <Link to="/admin/settings" className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-600 transition-colors">
                                        Configuración
                                    </Link>
                                </div>
                                <div className="border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        onClick={logout}
                                        className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
