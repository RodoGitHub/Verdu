import { useState } from 'react';
import { Plus, Edit, Trash2, Check, X, Keyboard } from 'lucide-react';
import VirtualKeyboard from './VirtualKeyboard';
import { useUI } from '../context/UIContext';

const SimpleCrudManager = ({ title, items, onAdd, onUpdate, onDelete, type = 'item', user }) => {
    const [newItem, setNewItem] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const [activeKeyboard, setActiveKeyboard] = useState(null); // 'new' | 'edit'
    const { confirm } = useUI();

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        await onAdd(newItem);
        setNewItem('');
    };

    const handleStartEdit = (item) => {
        setEditingId(item.id);

        // If item name has extra info like "Name (ID)", try to extract just the name if needed, 
        // OR let the parent handle display vs value. 
        // For TerminalsPage, we passed "Name (ID)" as name for display, which might be tricky for editing.
        // Ideally, items passed here should have the raw name for editing.
        // But let's assume item.name is what we want to edit.
        setEditName(item.name);
    };

    const handleSaveEdit = async () => {
        if (!editName.trim()) return;
        await onUpdate(editingId, editName);
        setEditingId(null);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{title}</h3>

            {/* Default to allowing actions if user prop is missing or is_staff is true */}
            {(user?.is_staff !== false) && onAdd && (
                <form onSubmit={handleCreate} className="flex gap-2 mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder={`Nueva ${type}`}
                            required
                            value={newItem}
                            onChange={e => setNewItem(e.target.value)}
                            className="w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setActiveKeyboard('new')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-500 p-2"
                        >
                            <Keyboard className="w-5 h-5" />
                        </button>
                    </div>
                    <button className="bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 font-bold shadow-md transition-all flex items-center gap-2 active:scale-95">
                        <Plus className="w-5 h-5" /> Agregar
                    </button>
                </form>
            )}

            <ul className="space-y-3">
                {items.length === 0 && <li className="text-center text-gray-400 py-4">No hay elementos registrados.</li>}
                {items.map(item => (
                    <li
                        key={item.id}
                        className={`flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors ${user?.is_staff !== false ? 'cursor-pointer' : ''}`}
                        onClick={(e) => {
                            // Only trigger edit if clicking the row background, not buttons
                            // And only if not already editing
                            if (editingId !== item.id && user?.is_staff !== false && !e.target.closest('button') && !e.target.closest('input')) {
                                handleStartEdit(item);
                            }
                        }}
                    >

                        {editingId === item.id ? (
                            // Edit Mode
                            <div className="flex-1 flex flex-col md:flex-row gap-2 animate-[fadeIn_0.2s] w-full">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className="w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white"
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setActiveKeyboard('edit'); }}
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 p-1"
                                    >
                                        <Keyboard className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button onClick={handleSaveEdit} className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 font-bold shadow-sm" title="Guardar"><Check className="w-4 h-4" /></button>
                                    <button onClick={handleCancelEdit} className="bg-gray-300 text-gray-700 p-2 rounded-lg hover:bg-gray-400 font-bold shadow-sm" title="Cancelar"><X className="w-4 h-4" /></button>
                                    {onDelete && (
                                        <button
                                            onClick={() => {
                                                confirm({
                                                    title: 'Eliminar Elemento',
                                                    message: '¿Confirma eliminar este elemento?',
                                                    isDestructive: true,
                                                    onConfirm: () => onDelete(item.id)
                                                });
                                            }}
                                            className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 font-bold shadow-sm md:hidden"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // View Mode
                            <>
                                <span className="font-medium text-gray-700 dark:text-gray-300 text-lg">{item.name}</span>
                                {(user?.is_staff !== false) && (
                                    <div className="hidden md:flex gap-2">
                                        {onUpdate && (
                                            <button onClick={(e) => { e.stopPropagation(); handleStartEdit(item); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors" title="Editar">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors" title="Eliminar">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </li>
                ))}
            </ul>
            {activeKeyboard && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] w-[800px]">
                    <VirtualKeyboard
                        value={activeKeyboard === 'new' ? newItem : editName}
                        onKeyPress={(key) => activeKeyboard === 'new' ? setNewItem(prev => prev + key) : setEditName(prev => prev + key)}
                        onBackspace={() => activeKeyboard === 'new' ? setNewItem(prev => prev.slice(0, -1)) : setEditName(prev => prev.slice(0, -1))}
                        onClose={() => setActiveKeyboard(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default SimpleCrudManager;
