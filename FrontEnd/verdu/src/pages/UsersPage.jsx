import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import UserService from '../services/user.service';
import { Search, Plus, Edit, Trash2, Keyboard } from 'lucide-react';
import VirtualKeyboard from '../components/VirtualKeyboard';
import { useUI } from '../context/UIContext';

const UsersPage = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeKeyboardInput, setActiveKeyboardInput] = useState(null); // 'search' | 'username' | 'first_name' | 'last_name' | 'password' | 'email'
    const { addToast, confirm } = useUI();

    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        username: '', email: '', first_name: '', last_name: '', password: '', is_staff: false, is_active: true
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const res = await UserService.getAll();
            setUsers(res.data); // Expecting array of users
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setCurrentUser(user);
            setFormData({
                username: user.username,
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                password: '', // Password is blank on edit
                is_staff: user.is_staff,
                is_active: user.is_active
            });
        } else {
            setCurrentUser(null);
            setFormData({
                username: '', email: '', first_name: '', last_name: '', password: '',
                is_staff: false, is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Logic: standard create/update. 
            // Note: If password is empty on update, backend might ignore it or we should remove it from payload.
            // But let's send it as is for now; usually Django User serializer with standard update ignores empty fields, OR we might need logic.
            // Given User's request "cargarle contraseña a todos", we treat it as a standard field.

            // Clean payload
            const payload = { ...formData };
            if (currentUser && !payload.password) {
                delete payload.password; // Don't send empty password on update
            }

            if (currentUser) {
                await UserService.update(currentUser.id, payload);
            } else {
                await UserService.create(payload);
            }

            setIsModalOpen(false);
            loadData();
            addToast("Usuario guardado correctamente", 'success');
        } catch (e) { addToast("Error: " + JSON.stringify(e.response?.data), 'error'); }
    };

    const handleDelete = async (id) => {
        confirm({
            title: 'Eliminar Usuario',
            message: '¿Está seguro que desea eliminar este usuario?',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await UserService.remove(id);
                    loadData();
                    addToast("Usuario eliminado", 'info');
                } catch (e) { addToast("Error eliminando usuario", 'error'); }
            }
        });
    };

    const filtered = users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando Usuarios...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Usuarios del Sistema</h2>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text" placeholder="Buscar usuario..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="bg-gray-50 dark:bg-gray-700/50 border-none rounded-lg pl-10 pr-10 py-2 w-64 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <button
                            onClick={() => setActiveKeyboardInput('search')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 p-1"
                        >
                            <Keyboard className="w-4 h-4" />
                        </button>
                    </div>
                    {user?.is_staff && (
                        <button onClick={() => handleOpenModal()} className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold shadow-md hover:bg-purple-700 transition-all active:scale-95 flex items-center gap-2 text-sm">
                            <Plus className="w-4 h-4" /> Nuevo Usuario
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left bg-transparent">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 font-medium text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4">Usuario</th>
                            <th className="px-6 py-4">Nombre Completo</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Rol</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filtered.length === 0 && <tr><td colSpan="5" className="text-center py-8 text-gray-400">No hay usuarios.</td></tr>}
                        {filtered.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-800 dark:text-gray-200 text-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                                            {u.username.substring(0, 2).toUpperCase()}
                                        </div>
                                        {u.username}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{u.first_name} {u.last_name}</td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{u.email || '-'}</td>
                                <td className="px-6 py-4">
                                    {u.is_staff ? (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Admin</span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">Vendedor</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-3">
                                    {user?.is_staff && (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleOpenModal(u)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors" title="Editar">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(u.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="Eliminar">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl w-full max-w-lg space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
                            {currentUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 relative">
                                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Usuario (Login)</label>
                                <input
                                    type="text" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full p-3 pr-10 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="nombre.usuario"
                                    disabled={!user?.is_staff}
                                />
                                <button
                                    type="button"
                                    onClick={() => setActiveKeyboardInput('username')}
                                    className="absolute right-2 top-[38px] transform -translate-y-1/2 text-gray-400 hover:text-purple-500 p-1"
                                >
                                    <Keyboard className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Nombre</label>
                                <input
                                    type="text" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full p-3 pr-10 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setActiveKeyboardInput('first_name')}
                                    className="absolute right-2 top-[38px] transform -translate-y-1/2 text-gray-400 hover:text-purple-500 p-1"
                                >
                                    <Keyboard className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Apellido</label>
                                <input
                                    type="text" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full p-3 pr-10 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => setActiveKeyboardInput('last_name')}
                                    className="absolute right-2 top-[38px] transform -translate-y-1/2 text-gray-400 hover:text-purple-500 p-1"
                                >
                                    <Keyboard className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="col-span-2 relative">
                                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Contraseña {currentUser && '(Dejar en blanco para mantener)'}</label>
                                <input
                                    type="password"
                                    value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full p-3 pr-10 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder={currentUser ? '••••••••' : 'Requerida para nuevos usuarios'}
                                    required={!currentUser}
                                />
                                <button
                                    type="button"
                                    onClick={() => setActiveKeyboardInput('password')}
                                    className="absolute right-2 top-[38px] transform -translate-y-1/2 text-gray-400 hover:text-purple-500 p-1"
                                >
                                    <Keyboard className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="col-span-2 relative">
                                <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-3 pr-10 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="usuario@ejemplo.com"
                                />
                                <button
                                    type="button"
                                    onClick={() => setActiveKeyboardInput('email')}
                                    className="absolute right-2 top-[38px] transform -translate-y-1/2 text-gray-400 hover:text-purple-500 p-1"
                                >
                                    <Keyboard className="w-4 h-4" />
                                </button>
                            </div>

                            {user?.is_staff && (
                                <div className="col-span-2 flex gap-4 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex-1 hover:bg-gray-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_staff}
                                            onChange={e => setFormData({ ...formData, is_staff: e.target.checked })}
                                            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-white">Es Administrador</p>
                                            <p className="text-xs text-gray-500">Acceso total al sistema</p>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex-1 hover:bg-gray-100 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-5 h-5 text-green-500 rounded focus:ring-green-500 border-gray-300"
                                        />
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-white">Activo</p>
                                            <p className="text-xs text-gray-500">Puede iniciar sesión</p>
                                        </div>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                                Cancelar
                            </button>
                            <button type="submit" className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:bg-purple-700 active:scale-95 transition-all">
                                Guardar Usuario
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeKeyboardInput && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] w-[800px]">
                    <VirtualKeyboard
                        value={activeKeyboardInput === 'search' ? searchTerm : formData[activeKeyboardInput]}
                        isPassword={activeKeyboardInput === 'password'}
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

export default UsersPage;
