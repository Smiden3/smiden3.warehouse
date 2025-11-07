import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { Product, SortKey, SortDirection, CartItem, Invoice, Receipt } from './types';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';
import { useFirestore } from './hooks/useFirestore';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { Auth } from './components/Auth';
import { DashboardWidget } from './components/DashboardWidget';
import { ProductCard } from './components/ProductCard';
import { ProductListItem } from './components/ProductListItem';
import { ProductModal } from './components/ProductModal';
import { LowStockModal } from './components/LowStockModal';
import { CartModal } from './components/CartModal';
import { InvoiceHistoryModal } from './components/InvoiceHistoryModal';
import { InvoiceDetailModal } from './components/InvoiceDetailModal';
import { RevenueModal } from './components/RevenueModal';
import { FullscreenImage } from './components/FullscreenImage';
import { ReceiptModal } from './components/ReceiptModal';
import { LedgerModal } from './components/LedgerModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { generateInvoicePDF } from './utils/pdfGenerator';
import {
  SunIcon, MoonIcon, GridIcon, ListIcon, PlusIcon,
  BoxIcon, WarningIcon, MoneyIcon, ChevronLeftIcon, ChevronRightIcon,
  ArrowUpIcon, ArrowDownIcon, CartIcon, HistoryIcon, TrendingUpIcon, ExitFill, ArchiveBoxArrowDownIcon, RoundPendingActions
} from './constants';
import { ProductCardSkeleton } from './components/ProductCardSkeleton';
import { ProductListItemSkeleton } from './components/ProductListItemSkeleton';

const logoUrl = 'https://i.postimg.cc/1tdy0QLp/reve-v1.png';

type ViewMode = 'grid' | 'list';
const ITEMS_PER_PAGE = 20;

const formatCurrency = (amount: number) => `${amount.toLocaleString('ru-RU')} ₽`;

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    products, invoices, receipts, ledger, loading: productsLoading,
    addProduct, updateProduct, deleteProduct, deleteProducts, createInvoice, createReceipt 
  } = useFirestore();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <div className="text-xl font-semibold text-light-text dark:text-dark-text">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }
  
  const { theme, toggleTheme } = useTheme();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedCategory, setSelectedCategory] = useState<string>('Все категории');
  const [shouldDownloadPdf, setShouldDownloadPdf] = useState(true);
  const [lightboxState, setLightboxState] = useState<{ images: string[], currentIndex: number, alt: string } | null>(null);

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isInvoiceHistoryModalOpen, setIsInvoiceHistoryModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [confirmState, setConfirmState] = useState<
    | { type: 'single'; productId: string; message: string }
    | { type: 'bulk'; message: string }
    | null
  >(null);

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    return ['Все категории', ...uniqueCategories.sort((a, b) => String(a).localeCompare(String(b), 'ru'))];
  }, [products]);

  const filteredProducts = useMemo(() =>
    products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
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
    
    invoices.forEach(invoice => {
        const invoiceDate = invoice.createdAt.toDate();
        const diffDays = Math.floor((now.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 7) {
            const dayIndex = 6 - diffDays;
            if (dailyData[dayIndex]) {
                dailyData[dayIndex].value += invoice.total;
                dailyTotal += invoice.total;
            }
        }
    });

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

    invoices.forEach(invoice => {
        const invoiceDate = invoice.createdAt.toDate();
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

  const handleCartChange = useCallback((productId: string, newQuantity: number) => {
    setCart(prevCart => {
      const product = products.find(p => p.id === productId);
      if (!product) return prevCart;

      const quantity = Math.max(0, Math.min(newQuantity, product.quantity));

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
  }, [products]);
  
 const handleCreateInvoice = useCallback(async () => {
    if (cart.length === 0) return;
    const newInvoice = await createInvoice(cart, products);
    if (newInvoice) {
      setCart([]);
      if (shouldDownloadPdf) {
          generateInvoicePDF(newInvoice);
      }
      setIsCartModalOpen(false);
    }
}, [cart, products, createInvoice, shouldDownloadPdf]);
  
  const handleCreateReceipt = useCallback(async (itemsToReceive: {productId: string, quantity: number}[]) => {
    await createReceipt(itemsToReceive);
    setIsReceiptModalOpen(false);
  }, [createReceipt]);

  const handleLogout = () => {
    signOut(auth).catch(error => console.error("Logout Error:", error));
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
  
  const handleDeleteProduct = useCallback((productId: string) => {
    setConfirmState({ type: 'single', productId, message: 'Вы уверены, что хотите удалить этот товар?' });
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedProducts.length === 0) return;
    setConfirmState({ type: 'bulk', message: `Удалить ${selectedProducts.length} товар(ов)?` });
  }, [selectedProducts]);
  
  const performDeletion = useCallback(async () => {
    if (!confirmState) return;

    if (confirmState.type === 'single') {
        await deleteProduct(confirmState.productId);
        setCart(prev => prev.filter(i => i.productId !== confirmState.productId));
        setSelectedProducts(prev => prev.filter(id => id !== confirmState.productId));
    } else {
        await deleteProducts(selectedProducts);
        const setIds = new Set(selectedProducts);
        setCart(prev => prev.filter(i => !setIds.has(i.productId)));
        setSelectedProducts([]);
    }

    setConfirmState(null);
}, [confirmState, selectedProducts, deleteProduct, deleteProducts]);
  
  const handleSaveProduct = useCallback(async (productData: Omit<Product, 'id' | 'photos'> & { id?: string; photos: string[] }) => {
    const finalPhotos = productData.photos.filter(p => p && p.trim() !== '');
    if (finalPhotos.length === 0) {
        alert('Необходимо указать хотя бы одну фотографию.');
        return;
    }
    
    const productToSave = { 
      ...productData, 
      photos: finalPhotos,
      quantity: Number(productData.quantity) || 0,
      price: Number(productData.price) || 0,
    };
    
    if (productToSave.id) {
        await updateProduct(productToSave.id, productToSave);
    } else {
        const { id, ...newProductData } = productToSave;
        await addProduct(newProductData);
    }
    
    setIsProductModalOpen(false);
  }, [addProduct, updateProduct]);
  
  const handleImageClick = (images: string[], startIndex: number, productName: string) => {
    setLightboxState({ images, currentIndex: startIndex, alt: productName });
  };

  const handleLightboxNext = useCallback(() => {
    setLightboxState(prevState => {
      if (!prevState || prevState.images.length <= 1) return prevState;
      const nextIndex = (prevState.currentIndex + 1) % prevState.images.length;
      return { ...prevState, currentIndex: nextIndex };
    });
  }, []);

  const handleLightboxPrev = useCallback(() => {
    setLightboxState(prevState => {
      if (!prevState || prevState.images.length <= 1) return prevState;
      const prevIndex = (prevState.currentIndex - 1 + prevState.images.length) % prevState.images.length;
      return { ...prevState, currentIndex: prevIndex };
    });
  }, []);

  const SortButton = ({ sortValue, label }: { sortValue: SortKey, label: string }) => (
     <button 
        type="button"
        onClick={() => handleSortChange(sortValue)} 
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${sortKey === sortValue ? 'bg-light-accent text-white dark:bg-dark-accent' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
     >
        <span>{label}</span>
        {sortKey === sortValue && (sortDirection === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />)}
      </button>
  );
  
  const SkeletonViews = () => (
    <>
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-12 items-center p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase"><div className="col-span-5 pl-10">Товар</div><div className="col-span-2">Категория</div><div className="col-span-5 grid grid-cols-4 items-center"><div className="col-span-1 text-center">Запас</div><div className="col-span-1 text-right">Цена</div><div className="col-span-2 text-center">В корзину</div></div><div className="col-span-1"></div></div>
          {Array.from({ length: 8 }).map((_, i) => <ProductListItemSkeleton key={i} />)}
        </div>
      )}
    </>
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
            {user?.email && <span className="hidden sm:inline text-sm text-gray-500 dark:text-gray-400">{user.email}</span>}
             <button type="button" onClick={() => setIsLedgerModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="Журнал операций">
                <RoundPendingActions className="h-6 w-6" />
            </button>
             <button type="button" onClick={() => setIsReceiptModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="Поступление товара">
                <ArchiveBoxArrowDownIcon className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => setIsInvoiceHistoryModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="История накладных">
                <HistoryIcon className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => setIsCartModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative" title="Корзина">
                <CartIcon className="h-6 w-6" />
                {cart.length > 0 && <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs">{cart.reduce((acc, item) => acc + item.quantity, 0)}</span>}
            </button>
            <button type="button" onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="Сменить тему">
              {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
            </button>
             <button type="button" onClick={handleLogout} title="Выйти" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <ExitFill className="h-6 w-6 text-red-500" />
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
                  {categories.map(category => (<button key={category} type="button" onClick={() => setSelectedCategory(category)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === category ? 'bg-light-accent text-white dark:bg-dark-accent shadow' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{category}</button>))}
              </div>
          </div>
          {/* Search, Sort, View Controls */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
             <input type="text" placeholder="Поиск..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:max-w-xs px-4 py-2 rounded-lg bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent" />
             <div className="flex items-center justify-end flex-wrap gap-2"><SortButton sortValue="default" label="По умолчанию" /><SortButton sortValue="name" label="По названию" /><SortButton sortValue="quantity" label="По количеству" /><SortButton sortValue="price" label="По цене" /></div>
          </div>
          <div className="flex items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={selectedProducts.length > 0 && paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProducts.includes(p.id))} onChange={handleSelectAll} className="h-5 w-5 rounded border-gray-300 text-light-accent focus:ring-light-accent dark:bg-gray-700 dark:border-gray-600" />
                <span className="text-sm text-gray-500 dark:text-gray-400">{selectedProducts.length} выбрано</span>
                {selectedProducts.length > 0 && 
                  <button 
                    type="button"
                    onClick={handleDeleteSelected} 
                    className="px-3 py-1 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-dark-glass"
                  >
                    Удалить
                  </button>
                }
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg p-1"><button type="button" onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-gray-500 shadow' : ''}`}><GridIcon className="h-5 w-5" /></button><button type="button" onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-gray-500 shadow' : ''}`}><ListIcon className="h-5 w-5" /></button></div>
                <button type="button" onClick={handleOpenAddModal} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-semibold hover:opacity-90 transition-opacity"><PlusIcon className="h-5 w-5" /><span>Добавить</span></button>
              </div>
          </div>
          
          {/* Product List/Grid */}
          {productsLoading ? (
            <SkeletonViews />
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-16"><p className="text-gray-500 dark:text-gray-400">Товары не найдены.</p></div>
          ) : viewMode === 'grid' ? (
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
          {!productsLoading && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">Страница {currentPage} из {totalPages}</span>
                <div className="flex items-center space-x-2"><button type="button" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"><ChevronLeftIcon className="h-5 w-5" /></button><button type="button" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"><ChevronRightIcon className="h-5 w-5" /></button></div>
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
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        products={products}
        onCreateReceipt={handleCreateReceipt}
      />
      <LedgerModal
        isOpen={isLedgerModalOpen}
        onClose={() => setIsLedgerModalOpen(false)}
        ledger={ledger}
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
      {lightboxState && (
        <FullscreenImage
          images={lightboxState.images}
          currentIndex={lightboxState.currentIndex}
          alt={lightboxState.alt}
          onClose={() => setLightboxState(null)}
          onNext={handleLightboxNext}
          onPrev={handleLightboxPrev}
        />
      )}
      <ConfirmDialog
        open={!!confirmState}
        message={confirmState?.message ?? ''}
        onCancel={() => setConfirmState(null)}
        onConfirm={performDeletion}
      />
    </div>
  );
};

export default App;