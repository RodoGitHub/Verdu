import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import UserService from '../services/user.service';
import { Keyboard } from 'lucide-react';
import VirtualKeyboard from '../components/VirtualKeyboard';
import PinPad from '../components/PinPad';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [sellers, setSellers] = useState([]);
    const [activeKeyboardInput, setActiveKeyboardInput] = useState(null); // 'username' | 'password' | null

    // Pin Modal State
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    // Load sellers on mount
    useEffect(() => {
        const fetchSellers = async () => {
            try {
                const res = await UserService.getPublicSellers();
                setSellers(res.data);
            } catch (err) {
                console.error("Error fetching sellers:", err);
            }
        };
        fetchSellers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(username, password);
        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setError(result.error);
        }
    };

    const handleQuickAccess = (seller) => {
        setSelectedSeller(seller);
        setPin('');
        setPinError('');
    };

    const closePinModal = () => {
        setSelectedSeller(null);
        setPin('');
        setPinError('');
    };

    const handlePinSubmit = async () => {
        if (!selectedSeller) return;
        setPinError(''); // Clear error before new attempt
        const result = await login(selectedSeller.username, pin);
        if (result.success) {
            navigate('/admin/dashboard');
        } else {
            setPinError('PIN Incorrecto');
            setPin('');
        }
    };

    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-red-500', 'bg-teal-500'];

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden">

            {/* Background Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-500/20 rounded-full blur-[128px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[128px]"></div>

            <div className="flex flex-col md:flex-row gap-8 w-full max-w-8xl z-10">

                {/* SECCIÓN 1: ACCESO RÁPIDO (VENDEDORES) */}
                <div className="flex-2 bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl flex flex-col justify-center items-center shadow-2xl transition-transform hover:scale-[1.01]">
                    <h2 className="text-3xl font-bold text-white mb-6">Acceso Vendedores</h2>
                    <p className="text-gray-400 mb-8 text-center max-w-sm">
                        Selecciona tu usuario para entrar directamente a la caja.
                    </p>

                    <div className="grid grid-cols-3 gap-6 w-full overflow-y-auto max-h-[800px] scrollbar-hide p-2">
                        {sellers.length === 0 && (
                            <div className="col-span-2 text-center text-gray-500">
                                <p>Cargando vendedores...</p>
                                <p className="text-xs mt-2">(Asegúrate de haber creado usuarios con rol 'Vendedor')</p>
                            </div>
                        )}
                        {sellers.map((seller, index) => (
                            <button
                                key={seller.id}
                                onClick={() => handleQuickAccess(seller)}
                                className={`${colors[index % colors.length]} hover:brightness-110 text-white p-8 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 group relative overflow-hidden`}
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center text-4xl font-bold group-hover:scale-110 transition-transform shadow-inner border-2 border-white/10">
                                    {(seller.name || seller.username).substring(0, 1).toUpperCase()}
                                </div>
                                <span className="font-bold text-lg text-shadow-sm text-center">{seller.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* SECCIÓN 2: ACCESO ADMINISTRATIVO (LOGIN FORM) */}
                <div className="flex-1 bg-gray-900/80 backdrop-blur-md border border-gray-700 p-10 rounded-3xl shadow-2xl flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-green-500 mb-2">Verdu System</h2>
                        <h3 className="text-xl text-gray-400">Panel Administrativo</h3>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group relative">
                            <label className="block text-sm font-medium mb-2 text-gray-400 group-focus-within:text-green-500 transition-colors">Usuario</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white transition-all placeholder-gray-600"
                                    placeholder="Ej: admin"
                                    required
                                    autoComplete="username"
                                    readOnly={activeKeyboardInput === 'username'}
                                    onFocus={() => setActiveKeyboardInput(null)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setActiveKeyboardInput('username')}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-green-500"
                                >
                                    <Keyboard className="w-5 h-5" />
                                </button>
                            </div>
                            {activeKeyboardInput === 'username' && (
                                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] w-[800px]">
                                    <VirtualKeyboard
                                        value={username}
                                        onKeyPress={(key) => setUsername(prev => prev + key)}
                                        onBackspace={() => setUsername(prev => prev.slice(0, -1))}
                                        onClose={() => setActiveKeyboardInput(null)}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="group relative">
                            <label className="block text-sm font-medium mb-2 text-gray-400 group-focus-within:text-green-500 transition-colors">Contraseña</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-white transition-all placeholder-gray-600"
                                    placeholder="•••••••"
                                    required
                                    autoComplete="current-password"
                                    readOnly={activeKeyboardInput === 'password'}
                                    onFocus={() => setActiveKeyboardInput(null)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setActiveKeyboardInput('password')}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-green-500"
                                >
                                    <Keyboard className="w-5 h-5" />
                                </button>
                            </div>
                            {activeKeyboardInput === 'password' && (
                                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] w-[800px]">
                                    <VirtualKeyboard
                                        value={password}
                                        isPassword={true}
                                        onKeyPress={(key) => setPassword(prev => prev + key)}
                                        onBackspace={() => setPassword(prev => prev.slice(0, -1))}
                                        onClose={() => setActiveKeyboardInput(null)}
                                    />
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-green-900/20 hover:shadow-green-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            Ingresar al Panel
                        </button>
                    </form>
                </div>

            </div>

            {/* PIN MODAL OVERLAY */}
            {selectedSeller && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s]">
                    <div className="bg-gray-900 border border-gray-700 p-8 rounded-3xl w-full max-w-md shadow-2xl transform scale-100 flex flex-col items-center">
                        <div className="flex w-full justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Hola, {selectedSeller.name}</h3>
                            <button onClick={closePinModal} className="text-gray-500 hover:text-white p-2">✕</button>
                        </div>

                        <p className="text-gray-400 text-sm mb-4">Ingresa tu PIN/Contraseña</p>

                        <PinPad
                            value={pin}
                            onChange={(val) => { setPin(val); setPinError(''); }}
                            onSubmit={handlePinSubmit}
                            error={pinError}
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default LoginPage;
