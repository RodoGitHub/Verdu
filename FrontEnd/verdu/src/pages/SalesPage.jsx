import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SaleService from '../services/sale.service';
import PaymentService from '../services/payment.service';
import { Search, Calendar, DollarSign, User, CheckCircle, XCircle, Clock } from 'lucide-react';

const SalesPage = () => {
    const { user } = useAuth();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
    const [customerFilter, setCustomerFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [hasSearched, setHasSearched] = useState(false);

    // Detail Modal State
    const [selectedSale, setSelectedSale] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Payment Methods
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        try {
            const res = await PaymentService.getAll();
            setPaymentMethods(res.data);
        } catch (e) {
            console.error("Error loading payment methods", e);
        }
    };

    const loadSales = async () => {
        setLoading(true);
        setHasSearched(true);
        try {
            const params = {};
            if (dateFilter) params.date = dateFilter;
            if (customerFilter) params.customer = customerFilter;
            if (statusFilter !== 'ALL') params.status = statusFilter;

            const res = await SaleService.getAll(params);
            setSales(res.data);
        } catch (e) {
            console.error(e);
            setSales([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        loadSales();
    };

    const handleOpenDetail = (sale) => {
        setSelectedSale(sale);
        setSelectedPaymentMethod(''); // Reset selection
        setIsDetailOpen(true);
    };

    const handleUpdateStatus = async (newStatus, paymentMethodId = null) => {
        if (!selectedSale) return;
        try {
            const data = { status: newStatus };
            if (paymentMethodId) data.payment_method = paymentMethodId;

            await SaleService.update(selectedSale.id, data);

            // Update local state
            setSales(sales.map(s => s.id === selectedSale.id ? { ...s, status: newStatus, payment_method: paymentMethodId || s.payment_method } : s));
            setSelectedSale({ ...selectedSale, status: newStatus });
            if (newStatus === 'COMPLETED') setIsDetailOpen(false);

            alert("Estado actualizado correctamente");
        } catch (e) {
            alert("Error al actualizar estado");
            console.error(e);
        }
    };

    // Calculate totals for the summary
    const totalSales = sales.reduce((acc, sale) => acc + parseFloat(sale.total), 0);
    const completedSales = sales.filter(s => s.status === 'COMPLETED').length;
    const pendingSales = sales.filter(s => s.status === 'PENDING').length;
    const canceledSales = sales.filter(s => s.status === 'CANCELED').length;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Mis Ventas</h2>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">

                    {/* Date Filter */}
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-800 dark:text-white"
                            />
                        </div>
                        <button type="button" onClick={() => setDateFilter('')} className="text-xs text-blue-500 mt-1 hover:underline">Ver Todo el Historial</button>
                    </div>

                    {/* Customer Filter */}
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cliente</label>
                        <div className="relative mb-6">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Nombre del cliente..."
                                value={customerFilter}
                                onChange={e => setCustomerFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-3  bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-800 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-3 mb-6 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-gray-800 dark:text-white"
                        >
                            <option value="ALL">Todos</option>
                            <option value="COMPLETED">Finalizados</option>
                            <option value="PENDING">Pendientes</option>
                            <option value="CANCELED">Cancelados</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 mb-6 rounded-xl font-bold shadow-lg shadow-green-500/20 transition-all flex items-center gap-2 active:scale-95 h-[52px]"
                    >
                        <Search className="w-5 h-5" />
                        Filtrar
                    </button>
                </form>
            </div>

            {hasSearched && (
                <div className="animate-[fadeIn_0.5s_ease-out] space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">Total Vendido</p>
                                <p className="text-2xl font-black text-gray-800 dark:text-white">${totalSales.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">Finalizadas</p>
                                <p className="text-2xl font-black text-gray-800 dark:text-white">{completedSales}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">Pendientes</p>
                                <p className="text-2xl font-black text-gray-800 dark:text-white">{pendingSales}</p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-bold uppercase">Canceladas</p>
                                <p className="text-2xl font-black text-gray-800 dark:text-white">{canceledSales}</p>
                            </div>
                        </div>
                    </div>

                    {/* Sales Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Hora/Fecha</th>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Items</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {sales.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                                            No se encontraron ventas con los filtros seleccionados.
                                        </td>
                                    </tr>
                                )}
                                {sales.map(sale => (
                                    <tr
                                        key={sale.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer"
                                        onClick={() => handleOpenDetail(sale)}
                                    >
                                        <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{sale.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-white">
                                            {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                {sale.customer_name || 'Desconocido'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-cyan-600 font-medium">
                                            {sale.items?.length || 0} productos
                                        </td>
                                        <td className="px-6 py-4">
                                            {sale.status === 'COMPLETED' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Finalizado</span>}
                                            {sale.status === 'CANCELED' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Cancelado</span>}
                                            {sale.status === 'PENDING' && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Pendiente</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-gray-800 dark:text-white text-lg">
                                            ${parseFloat(sale.total).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-blue-500 text-sm font-bold hover:underline">Ver Detalle</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Sale Detail Modal */}
            {isDetailOpen && selectedSale && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s]">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                            <div>
                                <h3 className="text-xl font-black text-gray-800 dark:text-white">Venta #{selectedSale.id}</h3>
                                <p className="text-gray-500 text-sm">
                                    {new Date(selectedSale.date).toLocaleDateString()} - {new Date(selectedSale.date).toLocaleTimeString()}
                                </p>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="bg-white dark:bg-gray-600 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors shadow-sm">
                                <XCircle className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Cliente</p>
                                    <p className="font-bold text-gray-800 dark:text-white text-lg">{selectedSale.customer_name}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                                    <p className="text-xs text-gray-400 uppercase font-bold">Vendedor</p>
                                    <p className="font-bold text-gray-800 dark:text-white text-lg">{selectedSale.user_name || 'Sistema'}</p>
                                </div>
                            </div>

                            {/* Items List */}
                            <div>
                                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-3">Productos</h4>
                                <ul className="space-y-2">
                                    {selectedSale.items?.map(item => (
                                        <li key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                                            <div>
                                                <p className="font-medium text-gray-800 dark:text-white">{item.product_name || 'Producto eliminado'}</p>
                                                <p className="text-sm text-gray-400">{item.quantity} x ${parseFloat(item.price / item.quantity).toFixed(2)}</p>
                                            </div>
                                            <p className="font-bold text-gray-800 dark:text-white">${parseFloat(item.price).toFixed(2)}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                                <p className="text-xl font-bold text-gray-600 dark:text-gray-400">Total</p>
                                <p className="text-3xl font-black text-green-600">${parseFloat(selectedSale.total).toFixed(2)}</p>
                            </div>
                        </div>

                        {/* Footer / Actions */}
                        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-500">Estado Actual:</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${selectedSale.status === 'COMPLETED' ? 'bg-green-200 text-green-800' :
                                    selectedSale.status === 'CANCELED' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                                    }`}>
                                    {selectedSale.status === 'COMPLETED' ? 'Finalizado' :
                                        selectedSale.status === 'CANCELED' ? 'Cancelado' : 'Pendiente'}
                                </span>
                            </div>

                            <div className="flex gap-2 items-center">
                                {/* If PENDING, Show Payment Selector and Finish Button */}
                                {selectedSale.status === 'PENDING' && (
                                    <>
                                        <select
                                            value={selectedPaymentMethod}
                                            onChange={e => setSelectedPaymentMethod(e.target.value)}
                                            className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="">Medio de Pago...</option>
                                            {paymentMethods.map(pm => (
                                                <option key={pm.id} value={pm.id}>{pm.name}</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => {
                                                if (!selectedPaymentMethod) {
                                                    alert("Por favor seleccione un medio de pago");
                                                    return;
                                                }
                                                handleUpdateStatus('COMPLETED', selectedPaymentMethod);
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Cobrar y Finalizar
                                        </button>
                                    </>
                                )}

                                {/* If CANCELED, Allow to reopen to Pending */}
                                {selectedSale.status === 'CANCELED' && (
                                    <button
                                        onClick={() => handleUpdateStatus('PENDING')}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-colors"
                                    >
                                        Reabrir Venta
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesPage;
