import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  query,
  getDocs,
  Timestamp,
  orderBy,
  collectionGroup,
  where,
  getDoc
} from 'firebase/firestore';
import { useAuth } from './useAuth';
import type { Product, Invoice, Receipt, LedgerEntry, InvoiceItem, ReceiptItem, CartItem } from '../types';

const initialProducts: Omit<Product, 'id'>[] = [
  { sku: "БР-001", name: "Серый мышонок - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/HxYPnSd2/gemini-2-5-flash-image-preview-nano-banana-a-Create-a-realistic-p-27.png"] },
  { sku: "БР-002", name: "Бейби Йода - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/B6Swbh4B/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-30.png"] },
  { sku: "БР-003", name: "Лягушка в платье - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/d1sS3Ww8/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-29.png"] },
  { sku: "БР-004", name: "Лягушонок в комбинезоне - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/MT6rHsqt/flux-1-kontext-dev-a-Create-a-realistic-p.png"] },
  { sku: "БР-005", name: "Белый зверек с крыльями - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/DZvY0CnD/seededit-3-0-a-Create-a-realistic-p-1.jpg"] },
  { sku: "БР-006", name: "Фиолетовый зверек с крыльями - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/hj2Zd9GG/flux-1-kontext-pro-b-Create-a-realistic-p-5.png"] },
  { sku: "БР-007", name: "Панда с блестками - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/Hx6vyQLC/gemini-2-5-flash-image-preview-nano-banana-a-Create-a-realistic-p-26.png"] },
  { sku: "БР-008", name: "Единорог с розовой гривой - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/W35YkM4t/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-28.png"] },
  { sku: "БР-009", name: "Ленивец с блестками - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/B6m7Kxvq/gemini-2-5-flash-image-preview-nano-banana-a-Create-a-realistic-p-25.png"] },
  { sku: "БР-010", name: "Белый единорог с золотым рогом - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/XqXHcpZG/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-27.png"] },
  { sku: "БР-011", name: "Толстый рыжий кот - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/sx169vBW/gemini-2-5-flash-image-preview-nano-banana-a-Create-a-realistic-p-24.png"] },
  { sku: "БР-012", name: "Серый кот в галстуке - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/C5dPHzZG/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-26.png"] },
  { sku: "БР-013", name: "Щенок серый с подвеской - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/Zn07FC9H/gemini-2-5-flash-image-preview-nano-banana-a-Create-a-realistic-p-23.png"] },
  { sku: "БР-014", name: "Круглый щенок хаски - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/FzqPPNc3/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-25.png"] },
  { sku: "БР-015", name: "Черно-белый кот - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/qqYmm4nL/gemini-2-0-flash-preview-image-generation-b-Create-a-realistic-p-6.png"] },
  { sku: "БР-016", name: "Трехцветный кот калико - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/T1SkkfmJ/reve-v1-b-Create-a-realistic-p-3.png"] },
  { sku: "БР-017", name: "Черный паук - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/qqYmm4nQ/reve-v1-a-Create-a-realistic-p-11.png"] },
  { sku: "БР-018", name: "Кролик в синем воротнике - брелок", category: "Брелок", quantity: 30, price: 200, photos: ["https://i.postimg.cc/Xqh224Fs/flux-1-kontext-pro-a-Create-a-realistic-p-6.png"] },
  { sku: "МЯ-001", name: "Осьминог Хагги Вагги", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/QCP66h1L/1d199c3f-0c00-4e72-ad54-bcfaedee1211.png"] },
  { sku: "МЯ-002", name: "Мягкая игрушка белка в желуде", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/jdP3GxTx/9ee67315-be5c-4408-ad2e-75424bfa6ab6.png"] },
  { sku: "МЯ-003", name: "Пушистый белый котенок", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/kXKYkJCn/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-24.png"] },
  { sku: "МЯ-004", name: "Пушистый серый котенок", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/xTMpWfQ9/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-23.png"] },
  { sku: "МЯ-005", name: "Зеленый динозаврик Ти-Рекс", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/65nbDWKt/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-22.png"] },
  { sku: "МЯ-006", name: "Оранжевая пушистая птичка", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/J4ZY9r8h/seedream-4-high-res-fal-b-Create-a-realistic-p-2.jpg"] },
  { sku: "МЯ-007", name: "Черно-белый пушистый котенок", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/8PMXqpGz/1761134932.png"] },
  { sku: "МЯ-008", name: "Грустный серый ворон", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/RVKpjSmN/42451cf2-16e0-45d3-98d1-b18947133323.png"] },
  { sku: "МЯ-009", name: "Кот на присосках с надписью", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/m2Cp0L4c/seedream-4-high-res-fal-b-Create-a-realistic-p-1.jpg"] },
  { sku: "МЯ-010", name: "Капибара маленькая", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/MKV3h6w0/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-21.png"] },
  { sku: "МЯ-011", name: "Круглый тигренок", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/9FZgvm2d/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-20.png"] },
  { sku: "МЯ-012", name: "Серый щенок", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/GhGgZLRx/1761134617.png"] },
  { sku: "МЯ-013", name: "Капибара большая", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/65nbDWK0/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-19.png"] },
  { sku: "МЯ-014", name: "Круглый белый тигренок", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/HkmvmqWX/67681a05-28f3-4f1f-a32d-f5f1ffdb0e88.png"] },
  { sku: "МЯ-015", name: "Ежик с розовым бантиком", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/Dwhph9fr/seedream-4-high-res-fal-a-Create-a-realistic-p.jpg"] },
  { sku: "МЯ-016", name: "Мягкая игрушка белый пудель", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/vZy2yJ89/1761134470.png"] },
  { sku: "МЯ-017", name: "Мягкая игрушка кот Гарфилд", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/wjz4zCxh/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-18.png"] },
  { sku: "МЯ-018", name: "Круглый белый котик", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/htnZnk40/gemini-2-5-flash-image-preview-nano-banana-a-Create-a-realistic-p-21.png"] },
  { sku: "МЯ-019", name: "Белый котенок с голубыми глазами", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/rwTZTByN/1761134193.png"] },
  { sku: "МЯ-020", name: "Круглый рыжий котик", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/VkwZwxsg/gemini-2-5-flash-image-preview-nano-banana-b-Create-a-realistic-p-17.png"] },
  { sku: "МЯ-021", name: "Капибара с рюкзаком-черепашкой", category: "Мягкая игрушка", quantity: 30, price: 200, photos: ["https://i.postimg.cc/t4bvbKR2/flux-1-kontext-pro-a-Create-a-realistic-p-5.png"] },
];

interface FirestoreContextType {
  products: Product[];
  invoices: Invoice[];
  receipts: Receipt[];
  ledger: LedgerEntry[];
  loading: boolean;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (productId: string, productData: Partial<Omit<Product, 'id'>>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  deleteProducts: (productIds: string[]) => Promise<void>;
  createInvoice: (cart: CartItem[], allProducts: Product[]) => Promise<Invoice | null>;
  createReceipt: (itemsToReceive: {productId: string, quantity: number}[]) => Promise<void>;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(undefined);

export const FirestoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const seedDatabase = useCallback(async (userPath: string) => {
    console.log('Seeding database for new user...');
    const batch = writeBatch(db);
    initialProducts.forEach(product => {
      const docRef = doc(collection(db, userPath, 'products'));
      batch.set(docRef, product);
    });
    await batch.commit();
    console.log('Seeding complete.');
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const userPath = `users/${user.uid}`;

      const collections = ['products', 'invoices', 'receipts', 'ledger'] as const;
      const unsubscribers = collections.map(colName => {
        const q = query(collection(db, userPath, colName), orderBy('timestamp', 'desc'));

        if (colName === 'products') {
            const productsQuery = query(collection(db, userPath, 'products'));
            return onSnapshot(productsQuery, async (snapshot) => {
                 if (snapshot.empty && !snapshot.metadata.hasPendingWrites) {
                    await seedDatabase(userPath);
                } else {
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
                    setProducts(data);
                }
                setLoading(false);
            }, (error) => {
                console.error(`Error fetching ${colName}: `, error);
                setLoading(false);
            });
        }
        
        const dataQuery = colName === 'invoices' || colName === 'receipts' ? 
            query(collection(db, userPath, colName), orderBy('createdAt', 'desc')) :
            query(collection(db, userPath, colName), orderBy('timestamp', 'desc'));

        return onSnapshot(dataQuery, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          switch(colName) {
            case 'invoices': setInvoices(data as Invoice[]); break;
            case 'receipts': setReceipts(data as Receipt[]); break;
            case 'ledger': setLedger(data as LedgerEntry[]); break;
          }
        }, (error) => console.error(`Error fetching ${colName}: `, error));
      });

      return () => unsubscribers.forEach(unsub => unsub());
    } else {
      // Clear data on logout
      setProducts([]);
      setInvoices([]);
      setReceipts([]);
      setLedger([]);
      setLoading(false);
    }
  }, [user, seedDatabase]);
  
  const getCollectionRef = (col: string) => collection(db, `users/${user!.uid}/${col}`);

  const addProduct = useCallback(async (productData: Omit<Product, 'id'>) => {
    if (!user) return;
    await addDoc(getCollectionRef('products'), productData);
  }, [user]);

  const updateProduct = useCallback(async (productId: string, productData: Partial<Omit<Product, 'id'>>) => {
    if (!user) return;
    const oldProduct = products.find(p => p.id === productId);
    if (!oldProduct) return;

    await runTransaction(db, async (transaction) => {
      const productRef = doc(db, `users/${user.uid}/products`, productId);
      transaction.update(productRef, productData);

      if (productData.quantity !== undefined && oldProduct.quantity !== productData.quantity) {
          const ledgerRef = doc(getCollectionRef('ledger'));
          const newLedgerEntry: Omit<LedgerEntry, 'id'> = {
            timestamp: Timestamp.now(),
            productId: oldProduct.id,
            productName: productData.name || oldProduct.name,
            type: 'edit',
            quantityChange: productData.quantity - oldProduct.quantity,
            beforeQuantity: oldProduct.quantity,
            afterQuantity: productData.quantity,
          };
          transaction.set(ledgerRef, newLedgerEntry);
      }
    });

  }, [user, products]);

  const deleteProduct = useCallback(async (productId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, `users/${user.uid}/products`, productId));
    // Ledger entry for deletion can be handled via a cloud function for robustness
  }, [user]);
  
  const deleteProducts = useCallback(async (productIds: string[]) => {
      if(!user) return;
      const batch = writeBatch(db);
      productIds.forEach(id => {
          const docRef = doc(db, `users/${user.uid}/products`, id);
          batch.delete(docRef);
      });
      await batch.commit();
  }, [user]);

  const createInvoice = useCallback(async (cart: CartItem[], allProducts: Product[]): Promise<Invoice | null> => {
    if (!user || cart.length === 0) return null;
    
    const newInvoiceRef = doc(getCollectionRef('invoices'));
    const timestamp = Timestamp.now();
    let total = 0;
    const newInvoiceItems: InvoiceItem[] = [];

    try {
        await runTransaction(db, async (transaction) => {
            for (const cartItem of cart) {
                const product = allProducts.find(p => p.id === cartItem.productId);
                if (!product) throw new Error(`Товар с ID ${cartItem.productId} не найден.`);

                const productRef = doc(db, `users/${user.uid}/products`, product.id);
                const productDoc = await transaction.get(productRef);

                if (!productDoc.exists()) throw new Error(`Товар ${product.name} не найден в базе данных.`);

                const currentQuantity = productDoc.data().quantity;
                if (currentQuantity < cartItem.quantity) {
                    throw new Error(`Недостаточно товара на складе для "${product.name}". В наличии: ${currentQuantity}, требуется: ${cartItem.quantity}`);
                }
                const newQuantity = currentQuantity - cartItem.quantity;
                transaction.update(productRef, { quantity: newQuantity });
                
                // Add ledger entry
                const ledgerRef = doc(getCollectionRef('ledger'));
                const newLedgerEntry: Omit<LedgerEntry, 'id'> = {
                    timestamp: timestamp,
                    productId: product.id,
                    productName: product.name,
                    type: 'invoice',
                    quantityChange: -cartItem.quantity,
                    beforeQuantity: currentQuantity,
                    afterQuantity: newQuantity
                };
                transaction.set(ledgerRef, newLedgerEntry);

                newInvoiceItems.push({ id: product.id, name: product.name, quantity: cartItem.quantity, price: product.price });
                total += product.price * cartItem.quantity;
            }

            const newInvoiceData: Omit<Invoice, 'id'> = {
                createdAt: timestamp,
                items: newInvoiceItems,
                total: total,
            };
            transaction.set(newInvoiceRef, newInvoiceData);
        });
        return { id: newInvoiceRef.id, createdAt: timestamp, items: newInvoiceItems, total };
    } catch(e) {
        console.error("Транзакция создания накладной не удалась: ", e);
        alert(`Ошибка: ${(e as Error).message}`);
        return null;
    }
}, [user]);

const createReceipt = useCallback(async (itemsToReceive: {productId: string, quantity: number}[]) => {
  if (!user || itemsToReceive.length === 0) return;
  const timestamp = Timestamp.now();

  try {
      await runTransaction(db, async (transaction) => {
          const newReceiptRef = doc(getCollectionRef('receipts'));
          const receiptItems: ReceiptItem[] = [];

          for (const item of itemsToReceive) {
              const productRef = doc(db, `users/${user.uid}/products`, item.productId);
              const productDoc = await transaction.get(productRef);

              if (!productDoc.exists()) throw new Error(`Товар с ID ${item.productId} не найден.`);
              
              const beforeQuantity = productDoc.data().quantity;
              const newQuantity = beforeQuantity + item.quantity;

              transaction.update(productRef, { quantity: newQuantity });

              receiptItems.push({ productId: item.productId, name: productDoc.data().name, quantityAdded: item.quantity, newQuantity });
              
              const ledgerRef = doc(getCollectionRef('ledger'));
              const newLedgerEntry: Omit<LedgerEntry, 'id'> = {
                  timestamp,
                  productId: item.productId,
                  productName: productDoc.data().name,
                  type: 'receipt',
                  quantityChange: item.quantity,
                  beforeQuantity,
                  afterQuantity: newQuantity,
              };
              transaction.set(ledgerRef, newLedgerEntry);
          }
          
          const newReceipt: Omit<Receipt, 'id'> = {
              createdAt: timestamp,
              items: receiptItems,
          };
          transaction.set(newReceiptRef, newReceipt);
      });
  } catch(e) {
      console.error("Транзакция оприходования не удалась:", e);
      alert(`Ошибка: ${(e as Error).message}`);
  }
}, [user]);


  const value = useMemo(() => ({
    products, invoices, receipts, ledger, loading,
    addProduct, updateProduct, deleteProduct, deleteProducts, createInvoice, createReceipt
  }), [products, invoices, receipts, ledger, loading, addProduct, updateProduct, deleteProduct, deleteProducts, createInvoice, createReceipt]);

  return <FirestoreContext.Provider value={value}>{children}</FirestoreContext.Provider>;
};

export const useFirestore = (): FirestoreContextType => {
  const context = useContext(FirestoreContext);
  if (context === undefined) {
    throw new Error('useFirestore must be used within a FirestoreProvider');
  }
  return context;
};
