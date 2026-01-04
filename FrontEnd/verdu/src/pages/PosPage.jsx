import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useScale } from '../hooks/useScale';
import ProductService from '../services/product.service';
import SaleService from '../services/sale.service';
import PaymentService from '../services/payment.service';
import CustomerService from '../services/customer.service';
import UserService from '../services/user.service';
import {
    Search,
    Trash2,
    ShoppingCart,
    Scale,
    ChefHat,
    Apple,
    Carrot,
    Beef,
    Milk,
    Wheat,
    Plus,
    CreditCard,
    XCircle,
    Store,
    Truck,
    Wallet,
    User,
    Minus,
    Settings,
    Keyboard,
    Home,
    Search as SearchIcon
} from 'lucide-react';
import VirtualKeyboard from '../components/VirtualKeyboard';

import PinPad from '../components/PinPad';
import { useUI } from '../context/UIContext';
import { useNavigate } from 'react-router-dom';

const PosPage = () => {
    const { user, login, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // If no user, FORCE open the User Modal (Lock Screen behavior)
    useEffect(() => {
        if (!authLoading && !user) {
            setIsUserModalOpen(true);
            setSelectedSwitchUser(null);
        }
    }, [user, authLoading]);

    // --- Inactivity Timer (5 Minutes) ---
    useEffect(() => {
        let timeout;
        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // Auto logout after 5 minutes of inactivity
                if (user) logout();
            }, 5 * 60 * 1000);
        };

        const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'click', 'scroll'];
        events.forEach(event => window.addEventListener(event, resetTimer));

        resetTimer(); // Start timer on mount

        return () => {
            clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [logout, user]);

    // --- Configuration State ---
    const [posId, setPosId] = useState(() => localStorage.getItem('POS_ID'));
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    // --- State Management ---
    const { weight, connectionStatus, isConnected } = useScale(posId);

    const [serverStatus, setServerStatus] = useState('checking'); // 'ok', 'error', 'checking'

    useEffect(() => {
        const checkHealth = async () => {
            try {
                await UserService.checkHealth();
                setServerStatus('ok');
            } catch (e) {
                setServerStatus('error');
            }
        };

        checkHealth(); // Initial check
        const interval = setInterval(checkHealth, 10000);
        return () => clearInterval(interval);
    }, []);

    // Auto-open config if no POS_ID is set
    useEffect(() => {
        if (!posId) {
            setIsConfigModalOpen(true);
        }
    }, [posId]);

    // Data State
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter non-active sellers if needed, or just show all public ones.

    // UI State
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [orderId, setOrderId] = useState(Date.now().toString().slice(-6));

    // Checkout Modal State
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState(1); // 1: Type, 2: Payment, 3: Customer
    const [saleType, setSaleType] = useState(null); // 'PRESENTIAL' | 'DELIVERY'

    // User Switcher State
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedSwitchUser, setSelectedSwitchUser] = useState(null);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');

    // Quantity Modal State
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
    const [quantityInput, setQuantityInput] = useState('1');

    // Config Modal State (Input)
    const [configPosIdInput, setConfigPosIdInput] = useState(posId || '');
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(true);
    const [isSearchKeyboardOpen, setIsSearchKeyboardOpen] = useState(false);

    // --- Global UI ---
    const { addToast, confirm: openConfirm } = useUI();

    // Cart State
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('POS_CART');
        return saved ? JSON.parse(saved) : [];
    });

    // --- Effects ---
    useEffect(() => {
        localStorage.setItem('POS_CART', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            // Independent loads
            try {
                const prodRes = await ProductService.getAll();
                setProducts(prodRes.data || []);
            } catch (e) { console.error("Failed to load products", e); }

            try {
                const catRes = await ProductService.getCategories();
                setCategories(catRes.data || []);
            } catch (e) { console.error("Failed to load categories", e); }

            try {
                const payRes = await PaymentService.getAll();
                setPaymentMethods(payRes.data || []);
            } catch (e) { console.error("Failed to load payment methods", e); }

            try {
                const custRes = await CustomerService.getAll();
                setCustomers(custRes.data || []);
            } catch (e) { console.error("Failed to load customers", e); }

            try {
                const sellRes = await UserService.getPublicSellers();
                setSellers(sellRes.data || []);
            } catch (e) { console.error("Failed to load sellers", e); }

        } catch (error) {
            console.error("Unexpected error loading POS data", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Computed ---
    const filteredProducts = useMemo(() => {
        let filtered = products;
        if (activeCategory !== 'all') {
            filtered = filtered.filter(p => Number(p.category) === Number(activeCategory));
        }
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(lowerTerm));
        }
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
    }, [products, activeCategory, searchTerm]);

    const cartTotal = useMemo(() => {
        return cart.reduce((total, item) => total + item.finalPrice, 0);
    }, [cart]);

    const currentWeightKg = weight;
    const currentPrice = selectedProduct ? (Number(selectedProduct.selling_price) * currentWeightKg) : 0;

    // --- Handlers ---
    const handleProductSelect = (product) => {
        if (selectedProduct?.id === product.id) {
            setSelectedProduct(null);
        } else {
            setSelectedProduct(product);
        }
    };

    const handleAddToCart = () => {
        if (!selectedProduct) return;

        // Logic split based on Unit
        // If product.unit is 'UN' (Unit), ask for quantity
        if (selectedProduct.unit === 'UN') {
            setQuantityInput('1');
            setIsQuantityModalOpen(true);
            return;
        }

        // Default 'KG' behavior
        if (currentWeightKg <= 0.005) {
            addToast("Por favor coloque el producto en la balanza (peso > 0.005 kg).", 'info', 'Pesar Producto');
            return;
        }

        const newItem = {
            uniqueId: Date.now(),
            ...selectedProduct,
            qty: currentWeightKg,
            finalPrice: Number(selectedProduct.selling_price) * currentWeightKg,
        };

        setCart([...cart, newItem]);
        setSelectedProduct(null);
    };

    const handleQuantityConfirm = () => {
        const qty = parseFloat(quantityInput);
        if (!qty || qty <= 0) return;

        const newItem = {
            uniqueId: Date.now(),
            ...selectedProduct,
            qty: qty,
            finalPrice: Number(selectedProduct.selling_price) * qty
        };

        setCart([...cart, newItem]);
        setSelectedProduct(null);
        setIsQuantityModalOpen(false);
    };

    const handleQuantityKeypad = (num) => {
        setQuantityInput(prev => {
            if (prev === '0') return num;
            return prev + num;
        });
    };

    const handleRemoveFromCart = (uniqueId) => {
        setCart(cart.map(item => {
            if (item.uniqueId === uniqueId) {
                // If it's already voided, don't change it (or maybe allow un-void? User didn't specify, but for security usually it's one way or requires admin)
                // User requirement: "que lo marque en color rojo... valor cero... no lo quite"
                if (item.voided) return item; // Already voided

                return {
                    ...item,
                    voided: true,
                    originalPrice: item.finalPrice, // Keep track just in case
                    finalPrice: 0 // Set price to 0 so it doesn't add to total
                };
            }
            return item;
        }));
    };

    const initiateCheckout = () => {
        setCheckoutStep(1);
        setSaleType(null);
        setIsCheckoutOpen(true);
    };

    const handleSelectSaleType = (type) => {
        setSaleType(type);
        if (type === 'DELIVERY') {
            // Go to Customer Selection
            setCheckoutStep(3);
        } else {
            // If Presential, go to payment method selection
            setCheckoutStep(2);
        }
    };

    const handleSaveConfig = () => {
        if (!configPosIdInput.trim()) {
            addToast("El ID del punto de venta es requerido", 'error');
            return;
        }
        localStorage.setItem('POS_ID', configPosIdInput.trim());
        setPosId(configPosIdInput.trim());
        setIsConfigModalOpen(false);
        window.location.reload();
    };

    const handleSelectPayment = (methodId) => {
        finalizeSale('PRESENTIAL', 'COMPLETED', methodId, null);
    };

    const handleSelectCustomer = (customer) => {
        openConfirm({
            title: 'Confirmar Delivery',
            message: `¿Desea asignar este pedido al cliente ${customer.name}?`,
            onConfirm: () => finalizeSale('DELIVERY', 'PENDING', null, customer.id)
        });
    };

    const finalizeSale = async (type, status, paymentMethodId, customerId) => {
        try {
            await SaleService.create({
                items: cart,
                total: cartTotal,
                status: status,
                type: type,
                payment_method: paymentMethodId,
                customer: customerId
            });
            addToast("Venta registrada correctamente", 'success');
            setIsCheckoutOpen(false);
            resetOrder();
            handleOpenUserModal();
        } catch (error) {
            console.error("Error al cobrar", error);
            addToast("Error al registrar venta (ver consola)", 'error');
        }
    }

    const handleCancelOrder = async () => {
        if (cart.length === 0) return;

        openConfirm({
            title: 'Cancelar Orden',
            message: '¿Está seguro que desea cancelar la orden actual y descartar todos los items?',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await SaleService.create({
                        items: cart,
                        total: 0,
                        status: 'CANCELED',
                        type: 'PRESENTIAL'
                    });
                    resetOrder();
                    logout();
                    addToast("Orden cancelada", 'info');
                } catch (error) {
                    console.error("Error al cancelar", error);
                    resetOrder();
                    logout();
                    addToast("Error al cancelar orden", 'error');
                }
            }
        });
    };

    const resetOrder = () => {
        setCart([]);
        setOrderId(Date.now().toString().slice(-6));
        setSelectedProduct(null);
    };

    // --- User Switcher Logic ---
    const handleOpenUserModal = () => {
        setIsUserModalOpen(true);
        setSelectedSwitchUser(null);
        setPin('');
        setPinError('');
    };

    const handleSwitchUserSelect = (seller) => {
        setSelectedSwitchUser(seller);
        setPin('');
        setPinError('');
    };

    const handleSwitchUserSubmit = async () => {
        if (!pin || !selectedSwitchUser) return;

        const result = await login(selectedSwitchUser.username, pin);
        if (result.success) {
            setIsUserModalOpen(false); // Close Modal, User state updates automatically
        } else {
            setPinError('PIN Incorrecto');
            setPin('');
        }
    };

    // --- Render Helpers ---
    const getCategoryIcon = (catName) => {
        const name = (catName || "").toLowerCase();
        if (name.includes('fruta')) return <Apple className="w-5 h-5" />;
        if (name.includes('verdura')) return <Carrot className="w-5 h-5" />;
        if (name.includes('hoja')) return <Carrot className="w-5 h-5 " />;
        if (name.includes('pasta')) return <Wheat className="w-5 h-5" />;
        if (name.includes('hongo')) return <ChefHat className="w-5 h-5" />;
        if (name.includes('carne')) return <Beef className="w-5 h-5" />;
        if (name.includes('lacteo')) return <Milk className="w-5 h-5" />;
        return <Store className="w-5 h-5" />; // Default / Otros
    };

    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-red-500', 'bg-teal-500'];

    if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-gray-500">Cargando Sistema POS...</div>;

    return (
        <div className="flex h-screen overflow-hidden bg-gray-100 font-sans text-gray-800 relative">

            {/* --- LEFT SECTION: Products & Scale (75%) --- */}
            <div className="w-[70%] flex flex-col h-full border-r border-gray-200">
                {/* Header / Search / User Info */}
                <div className="bg-white p-4 shadow-sm z-10 flex gap-4 items-center justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            className="w-full pl-10 pr-12 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            onClick={() => setIsSearchKeyboardOpen(!isSearchKeyboardOpen)}
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${isSearchKeyboardOpen ? 'bg-green-100 text-green-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Keyboard className="w-5 h-5" />
                        </button>

                    </div>

                    {/* User Display Section */}
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-100">

                        <div className="text-right hidden lg:block mr-2 pr-4 border-r border-gray-100">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Terminal</p>
                            <div className="flex flex-col items-end">
                                <p className="font-black text-xl text-blue-600 leading-none font-mono">{posId || 'NODEF'}</p>
                                <div className="flex gap-4 mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                                        <span className="text-xs font-bold text-gray-500 uppercase">Balanza</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${serverStatus === 'ok' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                                        <span className="text-xs font-bold text-gray-500 uppercase">Server</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsConfigModalOpen(true)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-3 rounded-xl transition-colors font-bold"
                            title="Configurar Punto de Venta"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <div className="text-right hidden md:block">
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Cajero</p>
                            <p className="font-black text-3xl text-gray-800 leading-none">{user?.name || user?.username || 'Desconocido'}</p>
                        </div>
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-12 h-12 rounded-xl bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-600 transition-colors"
                            title="Ir al Inicio"
                        >
                            <Home className="w-6 h-6" />
                        </button>
                        <button
                            onClick={handleOpenUserModal}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-3 font-bold transform active:scale-95 border-2 border-indigo-400/50"
                        >
                            <div className="p-1.5 bg-white/20 rounded-full backdrop-blur-sm">
                                <User className="w-6 h-6" />
                            </div>
                            <span className="hidden xl:inline text-lg tracking-tight">Cambiar</span>
                        </button>

                    </div>
                </div>

                {/* Categories Tab */}
                <div className="bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`
                            px-5 py-2 rounded-xl flex items-center gap-3 text-lg font-bold whitespace-nowrap transition-all
                            ${activeCategory === 'all'
                                ? 'bg-gray-800 text-white shadow-lg shadow-gray-800/20'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
                        `}
                    >
                        <ChefHat className="w-6 h-6" /> Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`
                                px-5 py-2 rounded-xl flex items-center gap-3 text-lg font-bold whitespace-nowrap transition-all
                                ${Number(activeCategory) === Number(cat.id)
                                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/20'
                                    : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50'}
                            `}
                        >
                            {getCategoryIcon(cat.name)}
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                    <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-24">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => handleProductSelect(product)}
                                className={`
                                    relative overflow-hidden rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-200 group
                                    ${selectedProduct?.id === product.id
                                        ? 'bg-green-50 ring-2 ring-green-500 shadow-xl scale-[1.02]'
                                        : 'bg-white hover:shadow-lg border border-gray-100 hover:border-green-200'}
                                `}
                            >
                                <div className={`
                                    w-32 h-32 mb-4 rounded-full flex items-center justify-center text-3xl overflow-hidden shadow-sm
                                    ${selectedProduct?.id === product.id ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-400 group-hover:bg-green-50 group-hover:text-green-500'}
                                    transition-colors
                                `}>
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold">{product.name.substring(0, 2).toUpperCase()}</span>
                                    )}
                                </div>

                                <h3 className="font-black text-2xl text-gray-800 leading-tight mb-2 line-clamp-3">{product.name}</h3>
                                <p className="text-xl font-medium text-gray-600">${product.selling_price} / {product.unit === 'UN' ? 'un' : 'kg'}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bottom Scale & Action Panel */}
                <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
                    <div className="flex items-center gap-6">

                        <div className={`
                            flex-1 p-4 rounded-2xl border-2 flex items-center justify-between transition-colors
                            ${isConnected ? 'border-green-500 bg-green-50' : 'border-red-300 bg-red-50'}
                        `}>
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                    <Scale className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-0.5">
                                        {isConnected ? 'Balanza Conectada' : 'Balanza Desconectada'}
                                    </p>
                                    <div className="text-4xl font-black text-gray-800">
                                        {currentWeightKg.toFixed(3)} <span className="text-xl text-gray-400 font-bold">kg</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!selectedProduct}
                            className={`
                                flex-1 h-full min-h-[5rem] rounded-2xl flex flex-col items-center justify-center transition-all duration-200 px-4
                                ${(!selectedProduct)
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-900 text-white hover:bg-black hover:scale-[1.02] shadow-xl shadow-gray-900/30 active:scale-95'}
                            `}
                        >
                            {selectedProduct ? (
                                <>
                                    <div className="flex items-center gap-3 ">
                                        <Plus className="w-8 h-8" />
                                        <span className="text-2xl font-black">AGREGAR</span>
                                    </div>
                                    <div className="text-3xl opacity-90 font-bold">
                                        {selectedProduct.unit === 'UN' ? (
                                            selectedProduct.name
                                        ) : (
                                            <>
                                                {selectedProduct.name} &bull; <span className="text-green-300 text-3xl">${(currentWeightKg > 0.005 ? currentPrice : Number(selectedProduct.selling_price)).toFixed(2)}</span>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <span className="font-bold text-2xl text-gray-400">Seleccione Producto</span>
                            )}
                        </button>

                    </div>
                </div>
            </div>

            {/* --- RIGHT SECTION: Shopping Cart --- */}
            <div className="w-[30%] bg-white flex flex-col h-full shadow-2xl z-20">
                <div className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <ShoppingCart className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Orden Actual</h2>
                                <p className="text-xs text-gray-400">#{orderId}</p>
                            </div>
                        </div>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{cart.length} items</span>
                    </div>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-50">
                            <ShoppingCart className="w-16 h-16" />
                            <p className="text-lg font-medium">Carrito Vacío</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div
                                key={item.uniqueId}
                                className={`
                                    p-4 rounded-xl shadow-sm border flex items-center justify-between group animate-[fadeIn_0.3s]
                                    ${item.voided
                                        ? 'bg-red-50 border-red-200 opacity-80'
                                        : 'bg-white border-gray-100'}
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold
                                        ${item.voided ? 'bg-red-100 text-red-400' : 'bg-gray-100 text-gray-400'}
                                    `}>
                                        {item.name.substring(0, 1)}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${item.voided ? 'text-red-800 line-through decoration-red-500' : 'text-gray-800'}`}>
                                            {item.name}
                                        </h3>
                                        <div className="text-xs font-medium flex gap-2">
                                            {item.voided ? (
                                                <span className="text-red-600 font-bold text-xs uppercase tracking-wider">ANULADO</span>
                                            ) : (
                                                <>
                                                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                                        {item.unit === 'UN' ? Number(item.qty).toFixed(0) : Number(item.qty).toFixed(3)} {item.unit?.toLowerCase()}
                                                    </span>
                                                    <span className="text-gray-500">x ${Number(item.selling_price).toFixed(2)}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`font-bold text-base ${item.voided ? 'text-red-500' : 'text-gray-800'}`}>
                                        ${Number(item.finalPrice).toFixed(2)}
                                    </span>
                                    {/* Only show/enable remove button if NOT voided */}
                                    {!item.voided && (
                                        <button
                                            onClick={() => handleRemoveFromCart(item.uniqueId)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Cart Footer / Totals */}
                <div className="p-6 bg-white border-t border-gray-200">
                    <div className="space-y-3 mb-6">

                        <div className="flex justify-between text-4xl font-black text-gray-900 pt-4 ">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={handleCancelOrder}
                            disabled={cart.length === 0}
                            className={`
                                col-span-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                                ${cart.length === 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-100'
                                }
                            `}
                        >
                            <XCircle className="w-6 h-6" />
                        </button>

                        <button
                            onClick={initiateCheckout}
                            disabled={cart.length === 0}
                            className={`
                                col-span-2 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
                                ${cart.length === 0
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                                    : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30 active:scale-95'
                                }
                            `}
                        >
                            <CreditCard className="w-6 h-6" />
                            Cobrar
                        </button>
                    </div>
                </div>
            </div>

            {/* --- CHECKOUT MODAL --- */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s]">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl space-y-6">

                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <h2 className="text-2xl font-black text-gray-800">
                                {checkoutStep === 1 && 'Seleccione Tipo de Venta'}
                                {checkoutStep === 2 && 'Seleccione Medio de Pago'}
                                {checkoutStep === 3 && 'Seleccione Cliente'}
                            </h2>
                            <button onClick={() => setIsCheckoutOpen(false)} className="p-2 text-gray-400 hover:text-gray-600">
                                <XCircle className="w-8 h-8" />
                            </button>
                        </div>

                        {checkoutStep === 1 && (
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleSelectSaleType('PRESENTIAL')}
                                    className="p-8 rounded-2xl border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 flex flex-col items-center gap-4 transition-all group"
                                >
                                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Store className="w-10 h-10" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-700">Presencial</span>
                                </button>

                                <button
                                    onClick={() => handleSelectSaleType('DELIVERY')}
                                    className="p-8 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center gap-4 transition-all group"
                                >
                                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Truck className="w-10 h-10" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-700">Delivery / Pedido</span>
                                </button>
                            </div>
                        )}

                        {checkoutStep === 2 && (
                            <div className="space-y-4">
                                <p className="text-gray-500">Seleccione cómo desea abonar el cliente:</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {paymentMethods.length === 0 && <p className="col-span-3 text-center text-gray-400 py-4">No hay medios de pago registrados.</p>}
                                    {paymentMethods.map(method => (
                                        <button
                                            key={method.id}
                                            onClick={() => handleSelectPayment(method.id)}
                                            className="p-6 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 flex flex-col items-center gap-2 transition-all font-bold text-gray-700 hover:text-green-700"
                                        >
                                            <Wallet className="w-8 h-8 opacity-50 mb-1" />
                                            {method.name}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCheckoutStep(1)}
                                    className="w-full py-3 mt-4 text-gray-500 font-medium hover:text-gray-800"
                                >
                                    Volver atrás
                                </button>
                            </div>
                        )}

                        {checkoutStep === 3 && (
                            <div className="space-y-4">
                                <p className="text-gray-500">Seleccione el cliente para el delivery:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                    {customers.length === 0 && <p className="col-span-2 text-center py-4">No hay clientes registrados.</p>}
                                    {customers.map(customer => (
                                        <button
                                            key={customer.id}
                                            onClick={() => handleSelectCustomer(customer)}
                                            className="p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 flex items-center gap-3 transition-all text-left"
                                        >
                                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800">{customer.name}</div>
                                                <div className="text-xs text-gray-500">{customer.address || "Sin dirección"}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCheckoutStep(1)}
                                    className="w-full py-3 mt-4 text-gray-500 font-medium hover:text-gray-800"
                                >
                                    Volver atrás
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* --- QUANTITY MODAL (For 'UN' Products) --- */}
            {isQuantityModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s]">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl space-y-6">
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-gray-800">{selectedProduct.name}</h3>
                            <p className="text-gray-500">Ingrese Cantidad (Unidades)</p>
                        </div>

                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => setQuantityInput(prev => String(Math.max(1, Number(prev) - 1)))}
                                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                            >
                                <Minus className="w-6 h-6" />
                            </button>
                            <div className="text-5xl font-black text-gray-800 w-32 text-center border-b-2 border-green-500 pb-2">
                                {quantityInput}
                            </div>
                            <button
                                onClick={() => setQuantityInput(prev => String(Number(prev) + 1))}
                                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handleQuantityKeypad(num.toString())}
                                    className="h-14 rounded-xl bg-gray-50 text-gray-800 text-xl font-bold hover:bg-gray-100 border border-gray-200"
                                >
                                    {num}
                                </button>
                            ))}
                            <button
                                onClick={() => setQuantityInput('0')}
                                className="h-14 rounded-xl bg-red-50 text-red-500 font-bold hover:bg-red-100 border border-red-100 col-span-2"
                            >
                                BORRAR
                            </button>
                        </div>

                        <button
                            onClick={handleQuantityConfirm}
                            className="w-full py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-xl shadow-lg shadow-green-500/30 transition-all active:scale-95"
                        >
                            CONFIRMAR CANTIDAD
                        </button>

                        <button
                            onClick={() => setIsQuantityModalOpen(false)}
                            className="w-full py-2 text-gray-400 hover:text-gray-600"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* --- USER SWITCHER MODAL --- */}
            {isUserModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s]">
                    <div className="bg-gray-900 border border-gray-700 p-8 rounded-3xl w-full max-w-3xl shadow-2xl transform scale-100 flex flex-col items-center">
                        <div className="flex w-full justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-white">
                                {selectedSwitchUser ? `Hola, ${selectedSwitchUser.name}` : 'Cambiar Cajero'}
                            </h3>
                            {/* Only allow closing if there is a logged in user (optional switching). If logged out -> Force selection */}
                            {user && (
                                <button onClick={() => setIsUserModalOpen(false)} className="text-gray-500 hover:text-white p-2">
                                    <XCircle className="w-8 h-8" />
                                </button>
                            )}
                        </div>

                        {!selectedSwitchUser ? (
                            <div className="grid grid-cols-2 gap-4 w-full overflow-y-auto max-h-[800px]">
                                {sellers.length === 0 && <p className="col-span-2 text-gray-500 text-center">No hay vendedores disponibles.</p>}
                                {sellers.map((seller, index) => (
                                    <button
                                        key={seller.id}
                                        onClick={() => handleSwitchUserSelect(seller)}
                                        className={`${colors[index % colors.length]} hover:brightness-110 text-white p-8 rounded-3xl flex flex-col items-center justify-center gap-4 transition-all duration-200 shadow-xl group relative overflow-hidden`}
                                    >
                                        <div className="bg-white/20 w-32 h-32 rounded-full flex items-center justify-center text-6xl font-bold border-4 border-white/10">
                                            {(seller.name || seller.username).substring(0, 1).toUpperCase()}
                                        </div>
                                        <span className="font-extrabold text-2xl text-center mt-2">{seller.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // PIN PAD
                            <>
                                <p className="text-gray-400 text-sm mb-4">Ingresa tu PIN para cambiar</p>
                                <PinPad
                                    value={pin}
                                    onChange={(val) => { setPin(val); setPinError(''); }}
                                    onSubmit={handleSwitchUserSubmit}
                                    error={pinError}
                                />
                                <button
                                    onClick={() => setSelectedSwitchUser(null)}
                                    className="mt-4 text-gray-500 hover:text-white text-sm"
                                >
                                    Volver a lista
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* --- CONFIG MODAL (POS ID Setup) --- */}
            {(isConfigModalOpen || !localStorage.getItem('POS_ID')) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-[fadeIn_0.3s]">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl w-full max-w-md shadow-2xl space-y-6 border border-gray-100 dark:border-gray-700">
                        <div className="text-center space-y-2">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                                <Settings className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 dark:text-white">Configuración de Punto de Venta</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Ingrese el identificador único de esta terminal (ej: CAJA_1). Esto vinculará la balanza y configuración correspondiente.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">ID de Terminal</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={configPosIdInput}
                                    readOnly={isKeyboardVisible} // Read only when virtual keyboard is open to prevent mobile keyboard
                                    onChange={(e) => !isKeyboardVisible && setConfigPosIdInput(e.target.value.toUpperCase())}
                                    placeholder="EJ: CAJA_1"
                                    className={`w-full text-center text-2xl font-mono p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none uppercase bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all mb-4 ${!isKeyboardVisible ? 'cursor-text' : 'cursor-default'}`}
                                    onClick={() => !isKeyboardVisible && setIsKeyboardVisible(true)}
                                />
                                {!isKeyboardVisible && (
                                    <button
                                        onClick={() => setIsKeyboardVisible(true)}
                                        className="absolute right-3 top-3 p-2 text-gray-400 hover:text-blue-500"
                                        title="Abrir Teclado Virtual"
                                    >
                                        <Keyboard className="w-6 h-6" />
                                    </button>
                                )}
                            </div>

                            {/* Virtual Keypad */}
                            {isKeyboardVisible && (
                                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] w-[800px]">
                                    <VirtualKeyboard
                                        value={configPosIdInput}
                                        onKeyPress={(key) => setConfigPosIdInput(prev => prev + key)}
                                        onBackspace={() => setConfigPosIdInput(prev => prev.slice(0, -1))}
                                        onClose={() => setIsKeyboardVisible(false)}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={handleSaveConfig}
                                disabled={!configPosIdInput.trim()}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                Guardar y Vincular
                            </button>
                            {localStorage.getItem('POS_ID') && (
                                <button
                                    onClick={() => setIsConfigModalOpen(false)}
                                    className="w-full mt-3 py-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- SEARCH KEYBOARD --- */}
            {isSearchKeyboardOpen && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] w-[800px]">
                    <VirtualKeyboard
                        value={searchTerm}
                        onKeyPress={(k) => setSearchTerm(prev => prev + k)}
                        onBackspace={() => setSearchTerm(prev => prev.slice(0, -1))}
                        onClose={() => setIsSearchKeyboardOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default PosPage;
