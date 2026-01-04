import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductService from '../services/product.service';

const BoardPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [pageIndex, setPageIndex] = useState(0);

    // Configurable params
    // rows: items per column (approx)
    // cols: number of columns
    // speed: seconds per slide
    const rowsParam = parseInt(searchParams.get('rows')) || 7;
    const colsParam = parseInt(searchParams.get('cols')) || 4;
    const speedParam = (parseInt(searchParams.get('speed')) || 10) * 1000;
    const catParam = searchParams.get('cat');

    // Calculate items per page (approximate, since headers take space)
    // We treat a header as 1 item for simplicity, but in grid it spans full width.
    // Actually, for a clean grid, we want simpler logic:
    // We will just slice the flat list.
    const ITEMS_PER_PAGE = rowsParam * colsParam;

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 60000); // Reload data every 60s
        return () => clearInterval(interval);
    }, []);

    const loadData = async () => {
        try {
            const res = await ProductService.getAll();
            const visibleProducts = res.data.filter(p => p.show_screen);

            // Sort
            visibleProducts.sort((a, b) => {
                if (a.category_name === b.category_name) return a.name.localeCompare(b.name);
                return (a.category_name || '').localeCompare(b.category_name || '');
            });

            setProducts(visibleProducts);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Prepare Display List (Flatter structure: Headers + Items)
    const grouped = products.reduce((acc, product) => {
        const cat = product.category_name || 'Varios';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {});

    // Filter Categories
    const visibleCategoryNames = Object.keys(grouped).filter(catName => {
        if (!catParam) return true;
        const allowed = catParam.toLowerCase().split(',').map(s => s.trim());
        return allowed.some(term => catName.toLowerCase().includes(term));
    });

    // Create Flat List
    let flatList = [];
    visibleCategoryNames.forEach(cat => {
        flatList.push({ type: 'header', content: cat });
        grouped[cat].forEach(p => flatList.push({ type: 'product', content: p }));
    });

    // Auto-Fit Logic with CSS Columns
    const totalItems = flatList.length;
    const activeCols = colsParam || 4;
    const numHeaders = visibleCategoryNames.length;
    const numProducts = totalItems - numHeaders;

    // Advanced Layout calculation:
    // We have H headers (spanning full width) and P products (distributed in C cols).
    // The visual vertical space required is approx:
    // Height = (H * HeaderHeight) + ((P / C) * ProductHeight)
    // We want Height <= 90vh.
    // Let's assume HeaderHeight is approx 2x ProductHeight (due to spacing).
    // So EquivalentRowUnits = (H * 2) + (P / activeCols).
    // This gives us how many "units" of height we need.
    const effectiveRows = (numHeaders * 2.5) + (numProducts / activeCols);

    // We have roughly 88vh available (100 - 12 for top header approx).
    // Let's be conservative.
    const availableVh = 85;

    // Calculate raw font size. Use a multiplier because line-height + styling adds up.
    // 1 unit of text is not 1vh height. Usually block is ~2.5em height.
    // So if font is F vh, block is ~2.5*F vh.
    // F = (availableVh / effectiveRows) / 2.5
    let calculatedSize = (availableVh / effectiveRows) / 2.2;

    // Clamp limits: Min 0.5vh (readable-ish), Max 3vh.
    const baseFontSize = Math.min(3.0, Math.max(0.8, calculatedSize));

    if (loading) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white text-3xl font-bold">Cargando...</div>;

    return (
        <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden p-4 flex flex-col">
            <div
                className="flex-1 min-h-0"
                style={{
                    columnCount: activeCols,
                    columnGap: '1em',
                    columnFill: 'balance'
                }}
            >
                {/* We iterate by Categories to group them logically in code, 
                    but visually CSS columns handle the flow.
                    Actually, if we want headers to span ALL columns as separators, 
                    we need to output: [Header Span All] [Prod] [Prod] ... [Header Span All]
                */}
                {flatList.map((item, idx) => {
                    if (item.type === 'header') {
                        return (
                            <div
                                key={`h-${idx}`}
                                className="break-inside-avoid border-b-2 border-yellow-500/50"
                                style={{
                                    columnSpan: 'all',
                                    marginBottom: '0.5em',
                                    marginTop: idx === 0 ? '0' : '0.5em',
                                    pageBreakInside: 'avoid'
                                }}
                            >
                                <h2
                                    className="font-black text-yellow-400 uppercase tracking-widest pl-[0.2em] border-l-4 border-yellow-500 leading-none"
                                    style={{ fontSize: `${baseFontSize * 1.5}vh`, paddingBottom: '0.2em' }}
                                >
                                    {item.content}
                                </h2>
                            </div>
                        );
                    } else {
                        const p = item.content;
                        return (
                            <div
                                key={p.id}
                                className="break-inside-avoid bg-gray-800/40 rounded border border-gray-700/30 flex justify-between items-center shadow-sm"
                                style={{
                                    marginBottom: '0.4em',
                                    padding: '0.4em 0.6em',
                                    // Use font-size relative to base, so padding scales with it!
                                    fontSize: `${baseFontSize}vh`
                                }}
                            >
                                <div className="flex flex-col min-w-0 mr-2">
                                    <span className="font-bold text-gray-100 truncate leading-tight" style={{ fontSize: '1em' }}>
                                        {p.name}
                                    </span>
                                    <span className="text-gray-500 uppercase font-bold tracking-wider leading-none" style={{ fontSize: '0.6em', marginTop: '0.1em' }}>
                                        {p.unit === 'UN' ? 'Unidad' : 'Kg'}
                                    </span>
                                </div>
                                <div
                                    className="font-black text-green-400 font-mono tracking-tighter leading-none"
                                    style={{ fontSize: '1.4em' }}
                                >
                                    ${parseFloat(p.selling_price).toFixed(0)}
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
};

export default BoardPage;
