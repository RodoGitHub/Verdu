import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CustomerService from '../services/customer.service';
import { Search, Plus, Edit, Trash2, Keyboard } from 'lucide-react';
import VirtualKeyboard from '../components/VirtualKeyboard';
import { useUI } from '../context/UIContext';

const CustomersPage = () => {
    const { user } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeKeyboardInput, setActiveKeyboardInput] = useState(null); // 'search' | 'name' | 'phone' | 'address'
    const { addToast, confirm } = useUI();

    // Form State
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [formData, setFormData] = useState({
        name: '', phone: '', address: ''
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const res = await CustomerService.getAll();
            setCustomers(res.data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleOpenModal = (customer = null) => {
        if (customer) {
            setCurrentCustomer(customer);
            setFormData({ name: customer.name, phone: customer.phone || '', address: customer.address || '' });
        } else {
            setCurrentCustomer(null);
            setFormData({ name: '', phone: '', address: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            currentCustomer
                ? await CustomerService.update(currentCustomer.id, formData)
                : await CustomerService.create(formData);
            setIsModalOpen(false); loadData();
            addToast("Cliente guardado correctamente", 'success');
        } catch (e) { addToast("Error: " + JSON.stringify(e.response?.data), 'error'); }
    };

    const handleDelete = async (id) => {
        confirm({
            title: 'Eliminar Cliente',
            message: '¿Confirma eliminar este cliente?',
            isDestructive: true,
            onConfirm: async () => {
                await CustomerService.remove(id);
                loadData();
                addToast("Cliente eliminado", 'info');
            }
        });
    };

    const filtered = customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando Clientes...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Clientes</h2>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-700/50 border-none rounded-lg pl-10 pr-10 py-2 w-64 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            onClick={() => setActiveKeyboardInput('search')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 p-1"
                        >
                            <Keyboard className="w-4 h-4" />
                        </button>
                    </div>
                    <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2 text-sm">
                        <Plus className="w-4 h-4" /> Nuevo Cliente
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Nombre</th>
                            <th className="px-6 py-4">Teléfono</th>
                            <th className="px-6 py-4">Dirección</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filtered.length === 0 && <tr><td colSpan="4" className="text-center py-8 text-gray-400">No se encontraron clientes.</td></tr>}
                        {filtered.map(c => (
                            <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200 text-lg">{c.name}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{c.phone || '-'}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 truncate max-w-xs">{c.address || '-'}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-3">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleOpenModal(c)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors" title="Editar">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        {user?.is_staff && (
                                            <button onClick={() => handleDelete(c.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="Eliminar">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-md space-y-6 shadow-2xl transform scale-100">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
                            {currentCustomer ? 'Editar Cliente' : 'Nuevo Cliente'}
                        </h3>

                        <div className="space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Nombre Completo</label>
                                <input
                                    type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-3 pr-10 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Ej: Juan Perez"
                                />
                                <button
                                    type="button"
                                    onClick={() => setActiveKeyboardInput('name')}
                                    className="absolute right-2 top-[38px] transform -translate-y-1/2 text-gray-400 hover:text-blue-500 p-1"
                                >
                                    <Keyboard className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Teléfono</label>
                                <input
                                    type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full p-3 pr-10 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Ej: 351 123 4567"
                                />
                                <button
                                    type="button"
                                    onClick={() => setActiveKeyboardInput('phone')}
                                    className="absolute right-2 top-[38px] transform -translate-y-1/2 text-gray-400 hover:text-blue-500 p-1"
                                >
                                    <Keyboard className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Dirección</label>
                                <textarea
                                    value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full p-3 pr-10 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white h-24 resize-none"
                                    placeholder="Calle, Número, Barrio..."
                                />
                                <button
                                    type="button"
                                    onClick={() => setActiveKeyboardInput('address')}
                                    className="absolute right-2 top-[38px] transform -translate-y-1/2 text-gray-400 hover:text-blue-500 p-1"
                                >
                                    <Keyboard className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeKeyboardInput && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] w-[800px]">
                    <VirtualKeyboard
                        value={activeKeyboardInput === 'search' ? searchTerm : formData[activeKeyboardInput]}
                        onKeyPress={(key) => {
                            if (activeKeyboardInput === 'search') setSearchTerm(prev => prev + key);
                            else setFormData(prev => ({ ...prev, [activeKeyboardInput]: prev[activeKeyboardInput] + key }));
                        }}
                        onBackspace={() => {
                            if (activeKeyboardInput === 'search') setSearchTerm(prev => prev.slice(0, -1));
                            else setFormData(prev => ({ ...prev, [activeKeyboardInput]: prev[activeKeyboardInput].slice(0, -1) }));
                        }}
                        onClose={() => setActiveKeyboardInput(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default CustomersPage;
