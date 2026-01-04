import { useState, useEffect } from 'react';
import SaleService from '../services/sale.service';
import ProductService from '../services/product.service';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Clock, User, Award, TrendingUp, CreditCard } from 'lucide-react';

const DashboardPage = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [modifiedProducts, setModifiedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [salesRes, productsRes] = await Promise.all([
                SaleService.getAll({ date: today }),
                ProductService.getAll({ modified_date: today })
            ]);

            setSales(salesRes.data);
            setModifiedProducts(productsRes.data);
        } catch (e) {
            console.error("Error loading dashboard", e);
        } finally {
            setLoading(false);
        }
    };

    // --- Calculations ---

    // 1. Total Sales (Completed)
    const completedSales = sales.filter(s => s.status === 'COMPLETED');
    const totalSalesAmount = completedSales.reduce((acc, s) => acc + parseFloat(s.total), 0);

    // 2. Pending Sales
    const pendingSales = sales.filter(s => s.status === 'PENDING');
    const totalPendingAmount = pendingSales.reduce((acc, s) => acc + parseFloat(s.total), 0);

    // 3. User Sales (My Sales)
    // Assuming auth user has 'user_id' or 'id' matching sale 'user' field
    const mySales = sales.filter(s => s.status === 'COMPLETED' && (s.user === user?.user_id || s.user === user?.id));
    const totalMySales = mySales.reduce((acc, s) => acc + parseFloat(s.total), 0);

    // 4. Payment Methods Breakdown (Completed only)
    const paymentMethods = completedSales.reduce((acc, s) => {
        const method = s.payment_method_name || 'Sin Asignar';
        if (!acc[method]) acc[method] = 0;
        acc[method] += parseFloat(s.total);
        return acc;
    }, {});

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando Dashboard...</div>;

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white">Dashboard</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">{new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Sales */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg shadow-green-500/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-green-100 font-bold uppercase text-xs mb-1">Ventas Totales (Hoy)</p>
                        <h3 className="text-4xl font-black">${totalSalesAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</h3>
                        <p className="text-sm text-green-100 mt-2 flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" /> {completedSales.length} ventas finalizadas
                        </p>
                    </div>
                    <DollarSign className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/10 rotate-12" />
                </div>

                {/* Pending Sales */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-gray-400 font-bold uppercase text-xs mb-1">Pendiente de Cobro</p>
                        <h3 className="text-4xl font-black text-yellow-500">${totalPendingAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</h3>
                        <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {pendingSales.length} ventas abiertas
                        </p>
                    </div>
                    <div className="absolute right-4 top-4 bg-yellow-100 text-yellow-600 p-2 rounded-xl">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>

                {/* My Sales */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-gray-400 font-bold uppercase text-xs mb-1">Mis Ventas (Hoy)</p>
                        <h3 className="text-4xl font-black text-blue-600">${totalMySales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</h3>
                        <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                            <User className="w-4 h-4" /> {user?.username}
                        </p>
                    </div>
                    <div className="absolute right-4 top-4 bg-blue-100 text-blue-600 p-2 rounded-xl">
                        <Award className="w-6 h-6" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Payment Methods Breakdown */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-purple-500" />
                        Ventas por Medio de Pago
                    </h3>
                    <div className="space-y-4">
                        {Object.keys(paymentMethods).length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No hay ventas registradas aún.</p>
                        ) : (
                            Object.entries(paymentMethods).map(([method, amount], index) => {
                                const percentage = totalSalesAmount > 0 ? (amount / totalSalesAmount) * 100 : 0;
                                return (
                                    <div key={method}>
                                        <div className="flex justify-between text-sm font-medium mb-1">
                                            <span className="text-gray-600 dark:text-gray-300">{method}</span>
                                            <span className="text-gray-800 dark:text-white font-bold">${amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                                            <div
                                                className={`h-2.5 rounded-full ${['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'][index % 4]}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Modified Products List */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm max-h-[400px] overflow-y-auto">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        Productos Modificados Hoy
                    </h3>
                    {modifiedProducts.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">No se han modificado productos hoy.</p>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                            {modifiedProducts.map(product => (
                                <li key={product.id} className="py-3 flex justify-between items-center group hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white">{product.name}</p>
                                        <p className="text-xs text-gray-400">{product.category_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">${product.selling_price}</p>
                                        <p className="text-xs text-gray-400">{new Date(product.upgrade_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
