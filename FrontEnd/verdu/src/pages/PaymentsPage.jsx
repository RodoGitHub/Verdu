import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PaymentService from '../services/payment.service';
import { useUI } from '../context/UIContext';
import { Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';

const PaymentsPage = () => {
    const { user } = useAuth();
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { addToast, confirm } = useUI();

    // Form State
    const [currentMethod, setCurrentMethod] = useState(null);
    const [formData, setFormData] = useState({ name: '', active: true });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await PaymentService.getAll();
            setMethods(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (method = null) => {
        if (method) {
            setCurrentMethod(method);
            setFormData({ name: method.name, active: method.active });
        } else {
            setCurrentMethod(null);
            setFormData({ name: '', active: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentMethod) {
                await PaymentService.update(currentMethod.id, formData);
            } else {
                await PaymentService.create(formData);
            }
            setIsModalOpen(false);
            loadData();
            addToast("Guardado correctamente", 'success');
        } catch (e) {
            addToast("Error al guardar", 'error');
        }
    };

    const handleDelete = async (id) => {
        confirm({
            title: 'Eliminar Método de Pago',
            message: '¿Confirma eliminar este método de pago?',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await PaymentService.remove(id);
                    loadData();
                    addToast("Eliminado correctamente", 'info');
                } catch (e) {
                    addToast("Error al eliminar", 'error');
                }
            }
        });
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Medios de Pago</h2>
                {user?.is_staff && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition shadow-lg shadow-green-500/30"
                    >
                        + Nuevo Medio
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 uppercase text-xs font-bold">
                        <tr>
                            <th className="px-6 py-4">Nombre</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {methods.map(method => (
                            <tr key={method.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{method.name}</td>
                                <td className="px-6 py-4">
                                    {method.active ? (
                                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-bold w-fit">
                                            <CheckCircle className="w-3 h-3" /> Activo
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs font-bold w-fit">
                                            <XCircle className="w-3 h-3" /> Inactivo
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {user?.is_staff && (
                                        <>
                                            <button onClick={() => handleOpenModal(method)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(method.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {methods.length === 0 && <div className="p-8 text-center text-gray-400">No hay medios de pago configurados.</div>}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            {currentMethod ? 'Editar' : 'Crear'} Medio de Pago
                        </h3>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-300">Nombre</label>
                            <input
                                type="text"
                                placeholder="Ej: Efectivo, Tarjeta Visa, MercadoPago"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl hover:bg-gray-100 transition-colors">
                            <input
                                type="checkbox"
                                checked={formData.active}
                                onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                className="w-5 h-5 text-green-500 rounded focus:ring-green-500 border-gray-300"
                            />
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Habilitado</span>
                        </label>

                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button>
                            <button type="submit" className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-lg shadow-green-500/20 font-bold transition-all">Guardar</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PaymentsPage;
