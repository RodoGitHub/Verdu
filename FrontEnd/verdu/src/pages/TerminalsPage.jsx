import { useState, useEffect } from 'react';
import TerminalService from '../services/terminal.service';
import SimpleCrudManager from '../components/SimpleCrudManager';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { Navigate } from 'react-router-dom';

const TerminalsPage = () => {
    const { user } = useAuth();
    const { addToast, confirm } = useUI();
    const [terminals, setTerminals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await TerminalService.getAll();
            setTerminals(res.data);
        } catch (error) {
            console.error("Failed to load terminals", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---
    const handleAddTerminal = async (name) => {
        // SimpleCrudManager gives us 'name'. We also need a device_id.
        // For simplicity, we can auto-generate a slug from name or prompt differently.
        // Since SimpleCrudManager is basic, let's assume 'name' is the friendly name 
        // and we auto-generate device_id = name.toUpperCase().replace(/\s/g, '_')
        const device_id = name.toUpperCase().replace(/\s+/g, '_');

        try {
            const res = await TerminalService.create({ name, device_id, is_active: true });
            setTerminals([...terminals, res.data]);
            setTerminals([...terminals, res.data]);
            addToast("Terminal creado exitosamente", 'success');
        } catch (error) {
            addToast("Error al crear terminal. Asegúrese que el ID sea único.", 'error');
            console.error(error);
        }
    };

    const handleUpdateTerminal = async (id, newName) => {
        try {
            // Only updating name for simplicity in this view
            const terminal = terminals.find(t => t.id === id);
            await TerminalService.update(id, { ...terminal, name: newName });
            setTerminals(terminals.map(t => t.id === id ? { ...t, name: newName } : t));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTerminal = async (id) => {
        confirm({
            title: 'Eliminar Terminal',
            message: '¿Confirma eliminar este terminal?',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await TerminalService.remove(id);
                    setTerminals(terminals.filter(t => t.id !== id));
                    addToast("Terminal eliminado", 'info');
                } catch (error) {
                    addToast("Error al eliminar", 'error');
                    console.error(error);
                }
            }
        });
    };

    // Protect route: Only Staff/Admin
    if (user && !user.is_staff) {
        return <div className="p-10 text-center text-red-500">Acceso Restringido. Solo administradores.</div>;
    }

    if (loading) return <div className="p-10">Cargando...</div>;

    const mappedTerminals = terminals.map(t => ({
        id: t.id,
        name: `${t.name} (${t.device_id})` // Show ID for clarity
    }));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black text-gray-800 dark:text-white">Gestión de Cajas</h1>
            <p className="text-gray-500">Administre los terminales POS activos.</p>

            <SimpleCrudManager
                title="Cajas Registradas"
                items={mappedTerminals}
                onAdd={handleAddTerminal}
                onUpdate={handleUpdateTerminal} // Pasar update permite editar nombre
                onDelete={handleDeleteTerminal}
                type="Caja" // Placeholder: Nueva Caja
                user={user}
            />
        </div>
    );
};

export default TerminalsPage;
