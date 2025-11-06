import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Product, SortKey, SortDirection, CartItem, Invoice, InvoiceItem } from './types';
import { useTheme } from './hooks/useTheme';
import { DashboardWidget } from './components/DashboardWidget';
import { ProductCard } from './components/ProductCard';
import { ProductListItem } from './components/ProductListItem';
import { ProductModal } from './components/ProductModal';
import { LowStockModal } from './components/LowStockModal';
import { CartModal } from './components/CartModal';
import { InvoiceHistoryModal } from './components/InvoiceHistoryModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { RevenueModal } from './components/RevenueModal';
import { ImageLightbox } from './components/ImageLightbox';
import { generateInvoicePDF } from './utils/pdfGenerator';
import {
  SunIcon, MoonIcon, GridIcon, ListIcon, PlusIcon,
  BoxIcon, WarningIcon, MoneyIcon, ChevronLeftIcon, ChevronRightIcon,
  ArrowUpIcon, ArrowDownIcon, CartIcon, HistoryIcon, TrendingUpIcon
} from './constants';

const initialProducts: Product[] = [
  { id: 'item-001', name: 'Беспроводные наушники Pro', category: 'Электроника', quantity: 25, price: 12500, photos: ['https://placehold.co/400x400/94a3b8/FFFFFF/png?text=Product+1', 'https://placehold.co/400x400/94a3b8/c084fc/png?text=Side+View'] },
  { id: 'item-002', name: 'Смарт-часы FitTrack 2', category: 'Электроника', quantity: 4, price: 8900, photos: ['https://placehold.co/400x400/7c3aed/FFFFFF/png?text=Product+2'] },
  { id: 'item-003', name: 'Органический кофе "Утро"', category: 'Продукты', quantity: 50, price: 750, photos: ['https://placehold.co/400x400/fb923c/FFFFFF/png?text=Product+3', 'https://placehold.co/400x400/fb923c/eab308/png?text=In+Cup'] },
  { id: 'item-004', name: 'Набор инструментов "Мастер"', category: 'Дом и сад', quantity: 12, price: 3200, photos: ['https://placehold.co/400x400/34d399/FFFFFF/png?text=Product+4'] },
  { id: 'item-005', name: 'Книга "История будущего"', category: 'Книги', quantity: 2, price: 1100, photos: ['https://placehold.co/400x400/f87171/FFFFFF/png?text=Product+5', 'https://placehold.co/400x400/f87171/fca5a5/png?text=Open+Book'] },
  { id: 'item-006', name: 'Рюкзак для путешествий', category: 'Аксессуары', quantity: 30, price: 4500, photos: ['https://placehold.co/400x400/60a5fa/FFFFFF/png?text=Product+6'] },
  { id: 'item-007', name: 'Геймерская мышь X-Ceed', category: 'Электроника', quantity: 8, price: 5600, photos: ['https://placehold.co/400x400/c084fc/FFFFFF/png?text=Product+7'] },
  { id: 'item-008', name: 'Чайник электрический "Aqua"', category: 'Бытовая техника', quantity: 18, price: 2100, photos: ['https://placehold.co/400x400/4ade80/FFFFFF/png?text=Product+8'] },
  { id: 'item-009', name: 'Фитнес-браслет Pulse', category: 'Электроника', quantity: 40, price: 3400, photos: ['https://placehold.co/400x400/f472b6/FFFFFF/png?text=Product+9'] },
  { id: 'item-010', name: 'Коврик для йоги "Zen"', category: 'Спорт', quantity: 22, price: 1500, photos: ['https://placehold.co/400x400/22d3ee/FFFFFF/png?text=Product+10'] },
  { id: 'item-011', name: 'Термос "Everest"', category: 'Аксессуары', quantity: 15, price: 1900, photos: ['https://placehold.co/400x400/a78bfa/FFFFFF/png?text=Product+11'] },
  { id: 'item-012', name: 'Настольная лампа "Lumo"', category: 'Дом и сад', quantity: 3, price: 2800, photos: ['https://placehold.co/400x400/facc15/FFFFFF/png?text=Product+12'] },
  { id: 'item-013', name: 'Внешний аккумулятор PowerUp', category: 'Электроника', quantity: 60, price: 3100, photos: ['https://placehold.co/400x400/818cf8/FFFFFF/png?text=Product+13'] },
  { id: 'item-014', name: 'Скетчбук "Artist Pro"', category: 'Канцтовары', quantity: 100, price: 950, photos: ['https://placehold.co/400x400/e879f9/FFFFFF/png?text=Product+14'] },
  { id: 'item-015', name: 'Bluetooth-колонка "SoundWave"', category: 'Электроника', quantity: 1, price: 6200, photos: ['https://placehold.co/400x400/38bdf8/FFFFFF/png?text=Product+15'] },
  { id: 'item-016', name: 'Ортопедическая подушка', category: 'Дом и сад', quantity: 28, price: 4100, photos: ['https://placehold.co/400x400/4ade80/FFFFFF/png?text=Product+16'] },
  { id: 'item-017', name: 'Дрон "SkyExplorer"', category: 'Электроника', quantity: 7, price: 25000, photos: ['https://placehold.co/400x400/fb7185/FFFFFF/png?text=Product+17'] },
  { id: 'item-018', name: 'Электронная книга "ReadEasy"', category: 'Электроника', quantity: 19, price: 9800, photos: ['https://placehold.co/400x400/a3e635/FFFFFF/png?text=Product+18'] },
  { id: 'item-019', name: 'Набор для рисования "Colors"', category: 'Хобби', quantity: 35, price: 2400, photos: ['https://placehold.co/400x400/2dd4bf/FFFFFF/png?text=Product+19'] },
  { id: 'item-020', name: 'Умные весы "BodyScale"', category: 'Бытовая техника', quantity: 11, price: 3800, photos: ['https://placehold.co/400x400/6366f1/FFFFFF/png?text=Product+20'] },
  { id: 'item-021', name: 'Игровая клавиатура "MechType"', category: 'Электроника', quantity: 9, price: 7200, photos: ['https://placehold.co/400x400/8b5cf6/FFFFFF/png?text=Product+21'] },
  { id: 'item-022', name: 'Проектор "CinemaHome"', category: 'Электроника', quantity: 6, price: 18500, photos: ['https://placehold.co/400x400/d946ef/FFFFFF/png?text=Product+22'] },
];

const logoUrl = 'https://i.postimg.cc/1tdy0QLp/reve-v1.png';

type ViewMode = 'grid' | 'list';
const ITEMS_PER_PAGE = 20;

interface LightboxState {
  images: string[];
  currentIndex: number;
}

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  // State Initialization with localStorage
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem('products');
    return savedProducts ? JSON.parse(savedProducts) : initialProducts;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const savedInvoices = localStorage.getItem('invoices');
    return savedInvoices ? JSON.parse(savedInvoices) : [];
  });
  
  // Save to localStorage whenever state changes
  useEffect(() => { localStorage.setItem('products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('invoices', JSON.stringify(invoices)); }, [invoices]);
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все категории');
  const [shouldDownloadPdf, setShouldDownloadPdf] = useState(true);
  const [lightboxState, setLightboxState] = useState<LightboxState | null>(null);

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isInvoiceHistoryModalOpen, setIsInvoiceHistoryModalOpen] = useState(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`;
  
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return ['Все категории', ...uniqueCategories.sort((a, b) => a.localeCompare(b, 'ru'))];
  }, [products]);

  const filteredProducts = useMemo(() =>
    products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Все категории' ? true : p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    }), 
  [products, searchTerm, selectedCategory]);

  const sortedProducts = useMemo(() => {
    const sortableProducts = [...filteredProducts];
    if (sortKey === 'default') return sortableProducts;
    sortableProducts.sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'name') comparison = a.name.localeCompare(b.name, 'ru');
      else if (sortKey === 'price') comparison = a.price - b.price;
      else if (sortKey === 'quantity') comparison = a.quantity - b.quantity;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sortableProducts;
  }, [filteredProducts, sortKey, sortDirection]);
  
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, sortKey, sortDirection, selectedCategory]);

  const dashboardStats = useMemo(() => {
    const source = filteredProducts;
    return {
      totalValue: source.reduce((sum, p) => sum + p.price * p.quantity, 0),
      totalProducts: source.length
    };
  }, [filteredProducts]);
  
  const lowStockProducts = useMemo(() => products.filter(p => p.quantity < 5), [products]);

  const revenueStats = useMemo(() => {
    const now = new Date();
    const invoicesSorted = [...invoices].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Daily Stats (Last 7 days)
    const dailyData: { label: string; value: number }[] = [];
    let dailyTotal = 0;
    const weekDayFormatter = new Intl.DateTimeFormat('ru-RU', { weekday: 'short' });
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        dailyData.push({
            label: weekDayFormatter.format(date),
            value: 0
        });
    }
    
    invoicesSorted.forEach(invoice => {
        const invoiceDate = new Date(invoice.createdAt);
        const diffDays = Math.floor((now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 7) {
            const dayIndex = 6 - diffDays;
            if (dailyData[dayIndex]) {
                dailyData[dayIndex].value += invoice.total;
                dailyTotal += invoice.total;
            }
        }
    });

    // Monthly Stats (Last 12 months)
    const monthlyData: { label: string; value: number }[] = [];
    let monthlyTotal = 0;
    const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'short' });
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        monthlyData.push({
            label: monthFormatter.format(date).replace('.', ''),
            value: 0
        });
    }

    invoicesSorted.forEach(invoice => {
        const invoiceDate = new Date(invoice.createdAt);
        const diffMonths = (now.getFullYear() - invoiceDate.getFullYear()) * 12 + (now.getMonth() - invoiceDate.getMonth());
        if (diffMonths >= 0 && diffMonths < 12) {
            const monthIndex = 11 - diffMonths;
            if (monthlyData[monthIndex]) {
                monthlyData[monthIndex].value += invoice.total;
                monthlyTotal += invoice.total;
            }
        }
    });
    
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);

    return { dailyData, dailyTotal, monthlyData, monthlyTotal, totalRevenue };
  }, [invoices]);

  const handleCartChange = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Clamp quantity to stock
    const quantity = Math.max(0, Math.min(newQuantity, product.quantity));

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.productId === productId);
      if (quantity === 0) {
        return prevCart.filter(item => item.productId !== productId);
      }
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex] = { ...newCart[existingItemIndex], quantity };
        return newCart;
      }
      return [...prevCart, { productId, quantity }];
    });
  };
  
  const handleCreateInvoice = () => {
    if (cart.length === 0) return;

    const invoiceItems: InvoiceItem[] = cart.map(item => {
        const product = products.find(p => p.id === item.productId)!;
        return {
            id: product.id,
            name: product.name,
            quantity: item.quantity,
            price: product.price,
        };
    });

    const newInvoice: Invoice = {
        id: Date.now().toString().slice(-6),
        createdAt: new Date().toISOString(),
        items: invoiceItems,
        total: invoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };

    setInvoices(prev => [...prev, newInvoice]);
    
    // Update stock
    setProducts(prevProducts => {
        const newProducts = [...prevProducts];
        newInvoice.items.forEach(item => {
            const productIndex = newProducts.findIndex(p => p.id === item.id);
            if (productIndex > -1) {
                newProducts[productIndex].quantity -= item.quantity;
            }
        });
        return newProducts;
    });

    if (shouldDownloadPdf) {
      generateInvoicePDF(newInvoice);
    }
    
    setCart([]);
    setIsCartModalOpen(false);
  };
  
  const handleSelectProduct = useCallback((productId: string) => {
    setSelectedProducts(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  }, []);
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedProducts(paginatedProducts.map(p => p.id));
    else setSelectedProducts([]);
  };
  const handleSortChange = (key: SortKey) => {
    if (key === 'default') { setSortKey('default'); return; }
    if (sortKey === key) { setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); } 
    else { setSortKey(key); setSortDirection('asc'); }
  };
  const handleOpenEditModal = (product: Product) => { setProductToEdit(product); setIsProductModalOpen(true); };
  const handleOpenAddModal = () => { setProductToEdit(null); setIsProductModalOpen(true); };
  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Вы уверены?')) setProducts(prev => prev.filter(p => p.id !== productId));
  };
  const handleDeleteSelected = () => {
    if (selectedProducts.length === 0 || !window.confirm(`Удалить ${selectedProducts.length} товар(ов)?`)) return;
    setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
    setSelectedProducts([]);
  };
  const handleSaveProduct = (productData: Omit<Product, 'id' | 'photos'> & { id?: string; photos: string[] }) => {
    const finalPhotos = productData.photos.filter(p => p && p.trim() !== '');
    if (finalPhotos.length === 0) {
        alert('Необходимо указать хотя бы одну фотографию.');
        return;
    }
    
    const productToSave = { 
      ...productData, 
      photos: finalPhotos,
      // Ensure numeric fields are numbers
      quantity: Number(productData.quantity) || 0,
      price: Number(productData.price) || 0,
    };
    
    if (productToSave.id) {
        setProducts(prev => prev.map(p => p.id === productToSave.id ? { ...p, ...productToSave } as Product : p));
        setIsProductModalOpen(false);
    } else {
        const newProduct = { ...productToSave, id: `item-${Date.now()}` };
        setProducts(prev => [newProduct as Product, ...prev]);
        // Do not close modal, form is cleared inside component
    }
  };
  
  const handleImageClick = (images: string[], startIndex: number) => {
    setLightboxState({ images, currentIndex: startIndex });
  };

  const handleLightboxClose = () => setLightboxState(null);

  const handleLightboxNext = () => {
    setLightboxState(prev => {
      if (!prev) return null;
      const nextIndex = (prev.currentIndex + 1) % prev.images.length;
      return { ...prev, currentIndex: nextIndex };
    });
  };

  const handleLightboxPrev = () => {
    setLightboxState(prev => {
      if (!prev) return null;
      const prevIndex = (prev.currentIndex - 1 + prev.images.length) % prev.images.length;
      return { ...prev, currentIndex: prevIndex };
    });
  };

  const SortButton = ({ sortValue, label }: { sortValue: SortKey, label: string }) => (
     <button onClick={() => handleSortChange(sortValue)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${sortKey === sortValue ? 'bg-light-accent text-white dark:bg-dark-accent' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
        <span>{label}</span>
        {sortKey === sortValue && (sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />)}
      </button>
  );

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans">
      <header className="sticky top-0 z-40 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <img src={logoUrl} alt="Логотип" className="h-16 w-auto" />
            <h1 className="text-2xl font-bold">СКЛАД/仓库</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsInvoiceHistoryModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <HistoryIcon className="h-6 w-6" />
            </button>
            <button onClick={() => setIsCartModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative">
                <CartIcon className="h-6 w-6" />
                {cart.length > 0 && <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>}
            </button>
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-2 sm:p-6 lg:p-8">
        {/* Dashboard and Controls */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <DashboardWidget icon={<MoneyIcon className="w-6 h-6 text-green-500" />} title="Стоимость в категории" value={formatCurrency(dashboardStats.totalValue)} colorClass="bg-green-100 dark:bg-green-900/50" />
          <DashboardWidget icon={<BoxIcon className="w-6 h-6 text-blue-500" />} title="Товаров в категории" value={dashboardStats.totalProducts.toString()} colorClass="bg-blue-100 dark:bg-blue-900/50" />
          <DashboardWidget icon={<TrendingUpIcon className="w-6 h-6 text-teal-500" />} title="Выручка" value={formatCurrency(revenueStats.totalRevenue)} colorClass="bg-teal-100 dark:bg-teal-900/50" onClick={() => setIsRevenueModalOpen(true)} blurValue={true} />
          <DashboardWidget icon={<WarningIcon className="w-6 h-6 text-orange-500" />} title="Низкий запас" value={lowStockProducts.length.toString()} colorClass="bg-orange-100 dark:bg-orange-900/50" onClick={() => setIsLowStockModalOpen(true)} />
        </section>

        <section className="bg-light-card dark:bg-dark-glass dark:border dark:border-dark-glass-border rounded-xl p-4 sm:p-6 shadow-md">
          {/* Category Filter */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">Фильтр по категориям</h3>
              <div className="flex flex-wrap items-center gap-2">
                  {categories.map(category => (<button key={category} onClick={() => setSelectedCategory(category)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-light-accent text-white dark:bg-dark-accent shadow' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{category}</button>))}
              </div>
          </div>
          {/* Search, Sort, View Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
             <input type="text" placeholder="Поиск..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:max-w-xs px-4 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent" />
             <div className="flex items-center justify-end flex-wrap gap-2"><SortButton sortValue="default" label="По умолчанию" /><SortButton sortValue="name" label="По названию" /><SortButton sortValue="quantity" label="По количеству" /><SortButton sortValue="price" label="По цене" /></div>
          </div>
          <div className="flex items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={selectedProducts.length > 0 && paginatedProducts.length > 0 && selectedProducts.length === paginatedProducts.length} onChange={handleSelectAll} className="h-5 w-5 rounded border-gray-300 text-light-accent focus:ring-light-accent dark:bg-gray-700 dark:border-gray-600" />
                <span className="text-sm text-gray-500 dark:text-gray-400">{selectedProducts.length} выбрано</span>
                {selectedProducts.length > 0 && <button onClick={handleDeleteSelected} className="text-sm text-red-500 hover:text-red-700 font-medium">Удалить</button>}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1"><button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-gray-500 shadow' : ''}`}><GridIcon className="h-5 w-5" /></button><button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-gray-500 shadow' : ''}`}><ListIcon className="h-5 w-5" /></button></div>
                <button onClick={handleOpenAddModal} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-semibold hover:opacity-90 transition-opacity"><PlusIcon className="h-5 w-5" /><span>Добавить</span></button>
              </div>
          </div>
          
          {/* Product List/Grid */}
          {paginatedProducts.length === 0 && <div className="text-center py-16"><p className="text-gray-500 dark:text-gray-400">Товары не найдены.</p></div>}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
              {paginatedProducts.map(product => <ProductCard key={product.id} product={product} isSelected={selectedProducts.includes(product.id)} onSelect={handleSelectProduct} onEdit={handleOpenEditModal} onDelete={handleDeleteProduct} onImageClick={handleImageClick} cartQuantity={cart.find(item => item.productId === product.id)?.quantity ?? 0} onCartChange={(qty) => handleCartChange(product.id, qty)} />)}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="hidden md:grid grid-cols-12 items-center p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase"><div className="col-span-5 pl-10">Товар</div><div className="col-span-2">Категория</div><div className="col-span-5 grid grid-cols-4 items-center"><div className="col-span-1 text-center">Запас</div><div className="col-span-1 text-right">Цена</div><div className="col-span-2 text-center">В корзину</div></div><div className="col-span-1"></div></div>
              {paginatedProducts.map(product => <ProductListItem key={product.id} product={product} isSelected={selectedProducts.includes(product.id)} onSelect={handleSelectProduct} onEdit={handleOpenEditModal} onDelete={handleDeleteProduct} onImageClick={handleImageClick} cartQuantity={cart.find(item => item.productId === product.id)?.quantity ?? 0} onCartChange={(qty) => handleCartChange(product.id, qty)} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Страница {currentPage} из {totalPages}</span>
                <div className="flex items-center space-x-2"><button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"><ChevronLeftIcon className="h-5 w-5" /></button><button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"><ChevronRightIcon className="h-5 w-5" /></button></div>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      <ProductModal 
        isOpen={isProductModalOpen} 
        onClose={() => setIsProductModalOpen(false)} 
        onSave={handleSaveProduct} 
        productToEdit={productToEdit}
        allCategories={categories.filter(c => c !== 'Все категории')}
      />
      <LowStockModal isOpen={isLowStockModalOpen} onClose={() => setIsLowStockModalOpen(false)} products={lowStockProducts} />
      <CartModal 
        isOpen={isCartModalOpen} 
        onClose={() => setIsCartModalOpen(false)} 
        cart={cart} 
        products={products} 
        onUpdateQuantity={handleCartChange} 
        onRemove={(pid) => handleCartChange(pid, 0)} 
        onCreateInvoice={handleCreateInvoice} 
        shouldDownloadPdf={shouldDownloadPdf}
        onDownloadToggle={setShouldDownloadPdf}
      />
      <InvoiceHistoryModal isOpen={isInvoiceHistoryModalOpen} onClose={() => setIsInvoiceHistoryModalOpen(false)} invoices={invoices} onViewInvoice={(invoice) => setViewingInvoice(invoice)} />
      <InvoiceDetailModal isOpen={!!viewingInvoice} onClose={() => setViewingInvoice(null)} invoice={viewingInvoice} />
      <RevenueModal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
        dailyData={revenueStats.dailyData}
        dailyTotal={revenueStats.dailyTotal}
        monthlyData={revenueStats.monthlyData}
        monthlyTotal={revenueStats.monthlyTotal}
      />
      <ImageLightbox 
        isOpen={!!lightboxState}
        images={lightboxState?.images ?? []}
        currentIndex={lightboxState?.currentIndex ?? 0}
        onClose={handleLightboxClose}
        onNext={handleLightboxNext}
        onPrev={handleLightboxPrev}
      />
    </div>
  );
};

export default App;