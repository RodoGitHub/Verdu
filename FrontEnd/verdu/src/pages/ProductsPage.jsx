import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProductService from '../services/product.service';
import { Search, Plus, Edit, Trash2, Check, X, Upload, Image as ImageIcon, Keyboard } from 'lucide-react';
import SimpleCrudManager from '../components/SimpleCrudManager';
import VirtualKeyboard from '../components/VirtualKeyboard';
import { useUI } from '../context/UIContext';

const ProductsPage = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('products'); // products, categories

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Gestión de Inventario</h2>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                <TabButton label="Productos" isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} />
                <TabButton label="Categorías" isActive={activeTab === 'categories'} onClick={() => setActiveTab('categories')} />
            </div>

            {/* Tab Content */}
            <div className="animate-[fadeIn_0.3s_ease-out]">
                {activeTab === 'products' && <ProductsManager user={user} />}
                {activeTab === 'categories' && <CategoriesManager user={user} />}
            </div>
        </div>
    );
};

const TabButton = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
            ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
    >
        {label}
    </button>
);

const ProductsManager = ({ user }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [activeKeyboardInput, setActiveKeyboardInput] = useState(null); // 'search' | 'productName'
    const { addToast, confirm } = useUI();

    // Form State
    const [currentProduct, setCurrentProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', price: '', percentage: '30.00', discount: true, show_screen: true, category: '', unit: 'KG', image: null
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [p, c] = await Promise.all([ProductService.getAll(), ProductService.getCategories()]);
            setProducts(p.data); setCategories(c.data);
        } catch (e) {
            console.error("Error loading", e);
        } finally { setLoading(false); }
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({
                name: product.name,
                price: product.price,
                percentage: product.percentage,
                discount: product.discount,
                show_screen: product.show_screen,
                category: product.category,
                unit: product.unit || 'KG',
                image: null, // Reset image input on edit
                bulkPrice: product.bulk_price || '',
                bulkQty: product.bulk_quantity || ''
            });
        } else {
            setCurrentProduct(null);
            setFormData({
                name: '', price: '', percentage: '60.00', discount: true, show_screen: true,
                category: categories[0]?.id || '', unit: 'KG', image: null,
                bulkPrice: '', bulkQty: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('price', formData.price);
            data.append('percentage', formData.percentage);
            data.append('discount', formData.discount);
            data.append('show_screen', formData.show_screen);
            data.append('category', formData.category);
            data.append('unit', formData.unit);

            // Append bulk info if present
            if (formData.bulkPrice) data.append('bulk_price', formData.bulkPrice);
            if (formData.bulkQty) data.append('bulk_quantity', formData.bulkQty);

            if (formData.image) {
                data.append('image', formData.image);
            }

            currentProduct ? await ProductService.update(currentProduct.id, data) : await ProductService.create(data);
            setIsModalOpen(false); loadData();
            addToast("Producto guardado correctamente", 'success');
        } catch (e) { addToast("Error: " + JSON.stringify(e.response?.data), 'error'); }
    };

    const handleDelete = async (id) => {
        confirm({
            title: 'Eliminar Producto',
            message: '¿Confirma eliminar este producto?',
            isDestructive: true,
            onConfirm: async () => {
                await ProductService.remove(id);
                setProducts(products.filter(p => p.id !== id));
                addToast("Producto eliminado", 'info');
            }
        });
    };

    if (loading) return <div className="text-center p-8 text-gray-500">Cargando...</div>;

    const filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter ? p.category === parseInt(categoryFilter) : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 gap-4">
                <div className="flex flex-1 gap-4 w-full">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text" placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700/50 border-none rounded-lg pl-10 pr-10 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        />
                        <button
                            onClick={() => setActiveKeyboardInput('search')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500 p-1"
                        >
                            <Keyboard className="w-4 h-4" />
                        </button>
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                        className="bg-gray-50 dark:bg-gray-700/50 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none text-gray-600 dark:text-gray-300 w-48"
                    >
                        <option value="">Todas las Categorías</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                {user?.is_staff && (
                    <button onClick={() => handleOpenModal()} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 shadow-md transition-all flex items-center gap-2 active:scale-95">
                        <Plus className="w-4 h-4" /> Nuevo
                    </button>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3 text-center">Img</th>
                            <th className="px-6 py-3">Nombre</th>
                            <th className="px-6 py-3">Categoría</th>
                            {user?.is_staff && <th className="px-6 py-3">Costo</th>}
                            {user?.is_staff && <th className="px-6 py-3">Margen</th>}
                            <th className="px-6 py-3">Precio Venta</th>
                            {user?.is_staff && <th className="px-6 py-3 text-center">Visible</th>}
                            {user?.is_staff && <th className="px-6 py-3 text-center">Desc.</th>}
                            <th className="px-6 py-3 hidden md:table-cell text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {filtered.map(p => {
                            // Calculate cost based on selling_price and percentage if cost not available?
                            // Backend model has cost_price?
                            // Assuming yes or calculating. 
                            // Wait, typical logic: selling = cost * (1+percentage/100). 
                            // So Cost = selling / (1+percentage/100).
                            // Or maybe backend sends cost_price?
                            // Let's calculate for now if not present, but usually backend has it. 
                            // I will try to display p.cost_price or fallback to calculation.
                            // Actually, let's assume p.cost_price exists or we calculate it.
                            const cost = p.cost_price ? p.cost_price : (p.selling_price / (1 + (p.percentage || 30) / 100)); // Fallback

                            return (
                                <tr
                                    key={p.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer"
                                    onClick={() => handleOpenModal(p)}
                                >
                                    <td className="px-6 py-3">
                                        {p.image ? (
                                            <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-lg shadow-sm border border-gray-100" />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                <ImageIcon className="w-6 h-6 text-gray-400" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full w-fit">{p.category_name}</span>
                                            <span className="text-[10px] text-gray-400 mt-1">{p.unit === 'UN' ? 'Unidad' : 'Kilogramo'}</span>
                                        </div>
                                    </td>
                                    {user?.is_staff && <td className="px-6 py-3 text-gray-500">${parseFloat(cost).toFixed(2)}</td>}
                                    {user?.is_staff && <td className="px-6 py-3 text-gray-500">{p.percentage}%</td>}

                                    <td className="px-6 py-3 font-bold text-green-600">${p.selling_price}</td>

                                    {user?.is_staff && (
                                        <td className="px-6 py-3 text-center">
                                            {p.show_screen ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-red-300 mx-auto" />}
                                        </td>
                                    )}
                                    {user?.is_staff && (
                                        <td className="px-6 py-3 text-center">
                                            {p.discount ? <Check className="w-4 h-4 text-green-500 mx-auto" /> : <X className="w-4 h-4 text-red-300 mx-auto" />}
                                        </td>
                                    )}

                                    <td className="px-6 py-3 text-right space-x-2 hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                                        {user?.is_staff && (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={(e) => { e.stopPropagation(); handleOpenModal(p); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors" title="Editar">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="Eliminar">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-lg space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">{currentProduct ? 'Editar' : 'Crear'} Producto</h3>

                        <div className="flex gap-4 items-start">
                            <div className="flex-1 relative">
                                <label className="block text-sm font-medium mb-1">Nombre</label>
                                <input type="text" placeholder="Ej: Manzana Red" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-2 pr-10 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                                <button
                                    type="button"
                                    onClick={() => setActiveKeyboardInput('productName')}
                                    className="absolute right-2 top-[34px] transform -translate-y-1/2 text-gray-400 hover:text-green-500 p-1"
                                >
                                    <Keyboard className="w-4 h-4" />
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Imagen</label>
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-100 transition-colors h-[42px]">
                                    <Upload className="w-4 h-4 text-gray-500" />
                                    <span className="text-xs text-gray-500 truncate max-w-[100px]">{formData.image ? formData.image.name : 'Subir foto'}</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={e => {
                                            if (e.target.files[0]) {
                                                setFormData({ ...formData, image: e.target.files[0] });
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Precio Compra x Bulto</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.bulkPrice || ''}
                                    onChange={e => {
                                        const bulk = parseFloat(e.target.value) || 0;
                                        const qty = parseFloat(formData.bulkQty) || 1;
                                        setFormData({
                                            ...formData,
                                            bulkPrice: e.target.value,
                                            price: (qty > 0 ? bulk / qty : 0).toFixed(2)
                                        });
                                    }}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cant. x Bulto (KG/UN)</label>
                                <input
                                    type="number"
                                    step="0.001"
                                    placeholder="1"
                                    value={formData.bulkQty || ''}
                                    onChange={e => {
                                        const qty = parseFloat(e.target.value) || 0;
                                        const bulk = parseFloat(formData.bulkPrice) || 0;
                                        setFormData({
                                            ...formData,
                                            bulkQty: e.target.value,
                                            price: (qty > 0 ? bulk / qty : 0).toFixed(2)
                                        });
                                    }}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-500">Costo Unitario (Calc)</label>
                                <input type="number" step="0.01" readOnly value={formData.price} className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-300 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Margen %</label>
                                <input type="number" step="0.01" placeholder="30.00" value={formData.percentage} onChange={e => setFormData({ ...formData, percentage: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Categoría</label>
                                <select required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="">Seleccionar...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Unidad</label>
                                <select required value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <option value="KG">Kilogramo (KG)</option>
                                    <option value="UN">Unidad (UN)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700/50 p-2 rounded flex-1 hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.show_screen}
                                    onChange={e => setFormData({ ...formData, show_screen: e.target.checked })}
                                    className="w-5 h-5 text-green-500 rounded focus:ring-green-500 border-gray-300"
                                />
                                <span className="text-sm font-medium">Visible en Pantalla</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-700/50 p-2 rounded flex-1 hover:bg-gray-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.discount}
                                    onChange={e => setFormData({ ...formData, discount: e.target.checked })}
                                    className="w-5 h-5 text-green-500 rounded focus:ring-green-500 border-gray-300"
                                />
                                <span className="text-sm font-medium">Aplica Descuento</span>
                            </label>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                            {/* Delete Button (Mobile Only) */}
                            {currentProduct && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        handleDelete(currentProduct.id);
                                    }}
                                    className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors font-bold md:hidden flex items-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Eliminar
                                </button>
                            )}

                            <div className="flex justify-end gap-2 ml-auto">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors font-medium">Cancelar</button>
                                <button type="submit" className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg shadow-green-500/20 font-bold transition-all transform active:scale-95">Guardar Producto</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {activeKeyboardInput && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] w-[800px]">
                    <VirtualKeyboard
                        value={activeKeyboardInput === 'search' ? searchTerm : formData.name}
                        onKeyPress={(key) => {
                            if (activeKeyboardInput === 'search') setSearchTerm(prev => prev + key);
                            else setFormData(prev => ({ ...prev, name: prev.name + key }));
                        }}
                        onBackspace={() => {
                            if (activeKeyboardInput === 'search') setSearchTerm(prev => prev.slice(0, -1));
                            else setFormData(prev => ({ ...prev, name: prev.name.slice(0, -1) }));
                        }}
                        onClose={() => setActiveKeyboardInput(null)}
                    />
                </div>
            )}
        </div>
    );
};

const CategoriesManager = ({ user }) => {
    const [items, setItems] = useState([]);
    const { addToast } = useUI();

    useEffect(() => { loadItems(); }, []);

    const loadItems = async () => {
        try {
            const res = await ProductService.getCategories();
            setItems(res.data);
        } catch (e) { console.error(e); }
    };

    const handleCreate = async (name) => {
        try {
            await ProductService.createCategory({ name });
            loadItems();
        } catch (e) { addToast("Error al crear categoría", 'error'); }
    };

    const handleUpdate = async (id, name) => {
        try {
            await ProductService.updateCategory(id, { name });
            loadItems();
        } catch (e) { addToast("Error actualizando: " + e.message, 'error'); }
    };

    const handleDelete = async (id) => {
        try {
            await ProductService.removeCategory(id);
            loadItems();
        } catch (e) { addToast("Error al eliminar (Verifique si está en uso)", 'error'); }
    };

    return (
        <SimpleCrudManager
            title="Categorías"
            items={items}
            onAdd={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            type="categories"
            user={user}
        />
    );
};

export default ProductsPage;
