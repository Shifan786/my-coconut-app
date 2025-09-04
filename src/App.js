import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, setLogLevel } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- SVG Icons ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const ArrowUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5l0 14"></path><path d="m18 11-6-6-6 6"></path></svg>;
const ArrowDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"></path><path d="m6 13 6 6 6-6"></path></svg>;
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0z"></path><path d="M12 14.1c-3.2 0-6 2-6 3.9V20h12v-2c0-1.9-2.8-3.9-6-3.9z"></path><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20z"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>;
const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

// --- Firebase Initialization ---
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCymXqriOhpXO_3jOxyP_G9TopFuP0FqwA",
  authDomain: "mycoconutbusiness.firebaseapp.com",
  projectId: "mycoconutbusiness",
  storageBucket: "mycoconutbusiness.firebasestorage.app",
  messagingSenderId: "907044975445",
  appId: "1:907044975445:web:c7c94fe58bbab8f47275dc",
  measurementId: "G-JSHV203EZG"
};

let app, db, auth;
if (Object.keys(firebaseConfig).length > 6) { // Check for a valid config
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        setLogLevel('debug');
    } catch (e) {
        console.error("Firebase initialization error:", e);
    }
}

const App = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [purchases, setPurchases] = useState([]);
    const [sales, setSales] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [customers, setCustomers] = useState([]);
    
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    const [editingPurchase, setEditingPurchase] = useState(null);
    const [editingSale, setEditingSale] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [itemToDelete, setItemToDelete] = useState(null);

    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    const [summaryDate, setSummaryDate] = useState(new Date().toISOString().split('T')[0]);

    // Gemini API states
    const [geminiLoading, setGeminiLoading] = useState(false);
    const [businessInsights, setBusinessInsights] = useState("");
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [reminderMessage, setReminderMessage] = useState("");
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (!auth) return;
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
            } else {
                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    console.error("Error signing in:", error);
                }
            }
            setAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    const dataFetcher = useCallback((collectionName, setter) => {
        if (!authReady || !user) return;
        const q = collection(db, 'users', user.uid, collectionName);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push({ id: doc.id, ...doc.data() });
            });
            setter(items);
        }, (error) => {
            console.error(`Error fetching ${collectionName}:`, error);
        });
        return unsubscribe;
    }, [authReady, user]);

    useEffect(() => {
        const unsubPurchases = dataFetcher('purchases', (items) => setPurchases(items.sort((a,b) => new Date(b.date) - new Date(a.date))));
        const unsubSales = dataFetcher('sales', (items) => setSales(items.sort((a,b) => new Date(b.date) - new Date(a.date))));
        const unsubExpenses = dataFetcher('expenses', (items) => setExpenses(items.sort((a,b) => new Date(b.date) - new Date(a.date))));
        const unsubCustomers = dataFetcher('customers', (items) => setCustomers(items.sort((a,b) => a.name.localeCompare(b.name))));
        
        return () => {
            if (unsubPurchases) unsubPurchases();
            if (unsubSales) unsubSales();
            if (unsubExpenses) unsubExpenses();
            if (unsubCustomers) unsubCustomers();
        };
    }, [dataFetcher]);

    // --- Gemini API Call ---
    const callGeminiAPI = async (prompt, setLoading, setData) => {
        setLoading(true);
        setData("");
        const apiKey = "AIzaSyBd4e7Q0q3HPR-jMSXTO6a8kkYBqJQkHV4"; // Canvas will provide the key
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`API call failed with status: ${response.status}`);
            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            setData(text || "Could not get a response from the AI. Please try again.");
        } catch (error) {
            console.error("Gemini API call error:", error);
            setData("An error occurred while contacting the AI. Check the console for details.");
        } finally {
            setLoading(false);
        }
    };

    const handleGetInsights = () => {
        const prompt = `
            I am a tender coconut wholesale dealer in India. Here are my current business stats:
            - Net Profit: ₹${netProfit.toLocaleString('en-IN')}
            - Total Sales Revenue: ₹${totalSaleRevenue.toLocaleString('en-IN')}
            - Total Purchase Cost: ₹${totalPurchaseCost.toLocaleString('en-IN')}
            - Current Coconut Stock: ${inventory.toLocaleString('en-IN')} coconuts
            - Total number of customers: ${customers.length}
            Based on these numbers, provide me with 3 short, actionable business insights or tips to improve my business. Be encouraging and specific to the Indian context. Format the output as a bulleted list.
        `;
        callGeminiAPI(prompt, setGeminiLoading, setBusinessInsights);
    };

    const handleGenerateReminder = (customer, balance) => {
        const prompt = `
            Generate a polite payment reminder message for a customer of my coconut wholesale business.
            - Customer Name: ${customer.name}
            - Shop Name: ${customer.shopName}
            - Amount Due: ₹${balance.toLocaleString('en-IN')}
            The message should be friendly and professional, suitable for sending via WhatsApp. Provide it in both English and Hinglish (Hindi written in English script).
        `;
        callGeminiAPI(prompt, setGeminiLoading, (data) => {
            setReminderMessage(data);
            setShowReminderModal(true);
        });
    };

    // Overall Stats
    const totalPurchases = purchases.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalSales = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);
    const inventory = totalPurchases - totalSales;
    const totalPurchaseCost = purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
    const totalSaleRevenue = sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalSaleRevenue - totalPurchaseCost - totalExpenses;

    // Daily Summary Stats
    const dailyPurchases = purchases.filter(p => p.date === summaryDate).reduce((sum, p) => sum + (p.totalCost || 0), 0);
    const dailySales = sales.filter(s => s.date === summaryDate).reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    const dailyExpenses = expenses.filter(e => e.date === summaryDate).reduce((sum, e) => sum + (e.amount || 0), 0);
    const dailyProfit = dailySales - dailyPurchases - dailyExpenses;

    const handleAddOrUpdate = async (collectionName, data, id) => {
        if(!user) return;
        try {
            if (id) {
                await updateDoc(doc(db, 'users', user.uid, collectionName, id), data);
            } else {
                await addDoc(collection(db, 'users', user.uid, collectionName), data);
            }
        } catch (error) {
            console.error(`Error saving to ${collectionName}:`, error);
        }
    };
    
    const handleDelete = (collectionName, id) => {
        setItemToDelete({ collectionName, id });
        setShowConfirmModal(true);
    };
    
    const executeDelete = async () => {
        if (!itemToDelete || !user) return;
        const { collectionName, id } = itemToDelete;
        try {
            await deleteDoc(doc(db, 'users', user.uid, collectionName, id));
        } catch (error) {
            console.error(`Error deleting from ${collectionName}:`, error);
        } finally {
            setShowConfirmModal(false);
            setItemToDelete(null);
        }
    };
    
    // --- Components ---

    const Dashboard = () => (
        <div className="p-4 md:p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Business Overview</h1>
                <p className="text-gray-500">A quick look at your overall business performance.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-4">
                    <StatCard title="Coconuts in Stock" value={inventory.toLocaleString('en-IN')} icon={<PackageIcon />} color="blue" />
                    <StatCard title="Total Purchase Cost" value={`₹ ${totalPurchaseCost.toLocaleString('en-IN')}`} icon={<ArrowDownIcon />} color="orange" />
                    <StatCard title="Total Sales Value" value={`₹ ${totalSaleRevenue.toLocaleString('en-IN')}`} icon={<ArrowUpIcon />} color="green" />
                    <StatCard title="Net Profit" value={`₹ ${netProfit.toLocaleString('en-IN')}`} icon={<DollarSignIcon />} color={netProfit >= 0 ? 'teal' : 'red'} />
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">✨ AI Business Insights</h2>
                <button onClick={handleGetInsights} disabled={geminiLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-all duration-200 flex items-center justify-center gap-2">
                    <SparklesIcon /> {geminiLoading ? 'Getting Insights...' : 'Get Business Insights'}
                </button>
                {businessInsights && (
                    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-gray-800 whitespace-pre-wrap font-mono">
                        {businessInsights}
                    </div>
                )}
            </div>
            <div>
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">Daily Summary</h2>
                 <div className="flex items-center bg-white p-3 rounded-lg shadow-sm border mb-4">
                     <CalendarIcon/>
                     <input type="date" value={summaryDate} onChange={e => setSummaryDate(e.target.value)} className="bg-transparent focus:outline-none w-full"/>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                     <StatCard title="Purchases" value={`₹ ${dailyPurchases.toLocaleString('en-IN')}`} icon={<ArrowDownIcon />} color="orange" small />
                     <StatCard title="Sales" value={`₹ ${dailySales.toLocaleString('en-IN')}`} icon={<ArrowUpIcon />} color="green" small />
                     <StatCard title="Expenses" value={`₹ ${dailyExpenses.toLocaleString('en-IN')}`} icon={<DollarSignIcon />} color="red" small />
                     <StatCard title="Profit for Day" value={`₹ ${dailyProfit.toLocaleString('en-IN')}`} icon={<DollarSignIcon />} color={dailyProfit >= 0 ? 'teal' : 'red'} small />
                 </div>
            </div>
             <div className="p-4 bg-gray-100 rounded-lg">
                <h2 className="text-lg font-semibold text-gray-700">User ID</h2>
                <p className="text-sm text-gray-600 break-all">{user ? user.uid : 'Loading...'}</p>
             </div>
        </div>
    );

    const StatCard = ({ title, value, icon, color, small }) => {
        const colors = { blue: 'from-blue-400 to-blue-500', orange: 'from-orange-400 to-orange-500', green: 'from-green-400 to-green-500', teal: 'from-teal-400 to-teal-500', red: 'from-red-400 to-red-500' };
        return (
            <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl shadow-lg flex items-center justify-between ${small ? 'p-4' : 'p-5'}`}>
                <div>
                    <p className={`${small ? 'text-xs' : 'text-sm'} font-light`}>{title}</p>
                    <p className={`${small ? 'text-2xl' : 'text-3xl'} font-bold`}>{value}</p>
                </div>
                <div className="text-white opacity-70">{icon}</div>
            </div>
        );
    };

    const CrudList = ({ title, data, columns, onAdd, onEdit, onDelete, renderRow }) => (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                <button onClick={onAdd} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200 flex items-center gap-2">
                    <PlusCircleIcon /> Add {title.slice(0, -1)}
                </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                 <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            {columns.map(col => <th key={col} scope="col" className="px-6 py-3">{col}</th>)}
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(item => renderRow(item, onEdit, onDelete))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const PurchaseList = () => <CrudList title="Purchases" data={purchases} columns={["Date", "Supplier", "Quantity", "Total Cost", "Vehicle No."]} onAdd={() => { setEditingPurchase(null); setShowPurchaseModal(true); }} renderRow={(p, onEdit, onDelete) => (
        <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4">{new Date(p.date).toLocaleDateString('en-IN')}</td>
            <td className="px-6 py-4 font-medium text-gray-900">{p.supplier}</td>
            <td className="px-6 py-4">{p.quantity.toLocaleString('en-IN')}</td>
            <td className="px-6 py-4">₹{p.totalCost.toLocaleString('en-IN')}</td>
            <td className="px-6 py-4">{p.vehicle}</td>
            <td className="px-6 py-4 flex items-center gap-2">
                <button onClick={() => { setEditingPurchase(p); setShowPurchaseModal(true); }} className="text-blue-600 hover:text-blue-800"><EditIcon /></button>
                <button onClick={() => handleDelete('purchases', p.id)} className="text-red-600 hover:text-red-800"><TrashIcon /></button>
            </td>
        </tr>
    )} />;

    const SaleList = () => <CrudList title="Sales" data={sales} columns={["Date", "Customer", "Quantity", "Total Price", "Amount Paid", "Balance Due"]} onAdd={() => { setEditingSale(null); setShowSaleModal(true); }} renderRow={(s) => {
        const customer = customers.find(c => c.id === s.customerId);
        const balance = (s.totalPrice || 0) - (s.amountPaid || 0);
        return (
            <tr key={s.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4">{new Date(s.date).toLocaleDateString('en-IN')}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{customer ? customer.name : 'N/A'}</td>
                <td className="px-6 py-4">{s.quantity.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4">₹{s.totalPrice.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 text-green-600">₹{s.amountPaid.toLocaleString('en-IN')}</td>
                <td className={`px-6 py-4 font-bold ${balance > 0 ? 'text-red-600' : 'text-gray-500'}`}>₹{balance.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 flex items-center gap-2">
                    <button onClick={() => { setEditingSale(s); setShowSaleModal(true); }} className="text-blue-600 hover:text-blue-800"><EditIcon /></button>
                    <button onClick={() => handleDelete('sales', s.id)} className="text-red-600 hover:text-red-800"><TrashIcon /></button>
                </td>
            </tr>
        );
    }} />;

    const ExpenseList = () => <CrudList title="Expenses" data={expenses} columns={["Date", "Description", "Amount"]} onAdd={() => { setEditingExpense(null); setShowExpenseModal(true); }} renderRow={(e) => (
         <tr key={e.id} className="bg-white border-b hover:bg-gray-50">
            <td className="px-6 py-4">{new Date(e.date).toLocaleDateString('en-IN')}</td>
            <td className="px-6 py-4 font-medium text-gray-900">{e.description}</td>
            <td className="px-6 py-4">₹{e.amount.toLocaleString('en-IN')}</td>
            <td className="px-6 py-4 flex items-center gap-2">
                <button onClick={() => { setEditingExpense(e); setShowExpenseModal(true); }} className="text-blue-600 hover:text-blue-800"><EditIcon /></button>
                <button onClick={() => handleDelete('expenses', e.id)} className="text-red-600 hover:text-red-800"><TrashIcon /></button>
            </td>
        </tr>
    )} />;
    
    const CustomerList = () => <CrudList title="Customers" data={customers} columns={["Customer Name", "Shop Name", "Total Owed"]} onAdd={() => { setEditingCustomer(null); setShowCustomerModal(true); }} renderRow={(c) => {
        const customerSales = sales.filter(s => s.customerId === c.id);
        const totalBilled = customerSales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
        const totalPaid = customerSales.reduce((sum, s) => sum + (s.amountPaid || 0), 0);
        const balance = totalBilled - totalPaid;
        return (
            <tr key={c.id} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4">{c.shopName}</td>
                <td className={`px-6 py-4 font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>₹{balance.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 flex items-center gap-3">
                    <button onClick={() => { setEditingCustomer(c); setShowCustomerModal(true); }} className="text-blue-600 hover:text-blue-800"><EditIcon /></button>
                    <button onClick={() => handleDelete('customers', c.id)} className="text-red-600 hover:text-red-800"><TrashIcon /></button>
                    {balance > 0 && (
                        <button onClick={() => handleGenerateReminder(c, balance)} disabled={geminiLoading} className="text-indigo-600 hover:text-indigo-800 disabled:text-indigo-300"><SparklesIcon /></button>
                    )}
                </td>
            </tr>
        )
    }} />;

    const Modal = ({ show, onClose, title, children }) => {
        if (!show) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h3 className="text-xl font-semibold">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XCircleIcon /></button>
                    </div>
                    <div className="p-4 max-h-[70vh] overflow-y-auto">{children}</div>
                </div>
            </div>
        );
    };

    const PurchaseForm = ({ item, onClose }) => {
        const [supplier, setSupplier] = useState(item?.supplier || '');
        const [quantity, setQuantity] = useState(item?.quantity || '');
        const [totalCost, setTotalCost] = useState(item?.totalCost || '');
        const [vehicle, setVehicle] = useState(item?.vehicle || '');
        const [date, setDate] = useState(item?.date || new Date().toISOString().split('T')[0]);
        const handleSubmit = (e) => {
            e.preventDefault();
            handleAddOrUpdate('purchases', { supplier, quantity: Number(quantity), totalCost: Number(totalCost), vehicle, date }, item?.id);
            onClose();
        };
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField label="Supplier/Market" value={supplier} onChange={e => setSupplier(e.target.value)} required />
                <InputField label="Quantity (Coconuts)" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                <InputField label="Total Cost (₹)" type="number" value={totalCost} onChange={e => setTotalCost(e.target.value)} required />
                <InputField label="Vehicle Number" value={vehicle} onChange={e => setVehicle(e.target.value)} />
                <InputField label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">{item ? 'Update' : 'Add'} Purchase</button>
                </div>
            </form>
        );
    };

    const SaleForm = ({ item, onClose }) => {
        const [customerId, setCustomerId] = useState(item?.customerId || '');
        const [quantity, setQuantity] = useState(item?.quantity || '');
        const [totalPrice, setTotalPrice] = useState(item?.totalPrice || '');
        const [amountPaid, setAmountPaid] = useState(item?.amountPaid || '');
        const [date, setDate] = useState(item?.date || new Date().toISOString().split('T')[0]);
        const handleSubmit = (e) => {
            e.preventDefault();
            handleAddOrUpdate('sales', { customerId, quantity: Number(quantity), totalPrice: Number(totalPrice), amountPaid: Number(amountPaid), date }, item?.id);
            onClose();
        };
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer/Shop</label>
                    <select value={customerId} onChange={e => setCustomerId(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">Select a Customer</option>
                        {customers.map(c => <option key={c.id} value={c.id}>{c.name} - {c.shopName}</option>)}
                    </select>
                </div>
                <InputField label="Quantity (Coconuts)" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required />
                <InputField label="Total Price (₹)" type="number" value={totalPrice} onChange={e => setTotalPrice(e.target.value)} required />
                <InputField label="Amount Paid (₹)" type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} required />
                <InputField label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600">{item ? 'Update' : 'Add'} Sale</button>
                </div>
            </form>
        );
    };

    const ExpenseForm = ({ item, onClose }) => {
        const [description, setDescription] = useState(item?.description || '');
        const [amount, setAmount] = useState(item?.amount || '');
        const [date, setDate] = useState(item?.date || new Date().toISOString().split('T')[0]);
        const handleSubmit = (e) => {
            e.preventDefault();
            handleAddOrUpdate('expenses', { description, amount: Number(amount), date }, item?.id);
            onClose();
        };
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField label="Expense Description" value={description} onChange={e => setDescription(e.target.value)} required />
                <InputField label="Amount (₹)" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                <InputField label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600">{item ? 'Update' : 'Add'} Expense</button>
                </div>
            </form>
        );
    };

     const CustomerForm = ({ item, onClose }) => {
        const [name, setName] = useState(item?.name || '');
        const [shopName, setShopName] = useState(item?.shopName || '');
        const handleSubmit = (e) => {
            e.preventDefault();
            handleAddOrUpdate('customers', { name, shopName }, item?.id);
            onClose();
        };
        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField label="Customer Name" value={name} onChange={e => setName(e.target.value)} required />
                <InputField label="Shop Name" value={shopName} onChange={e => setShopName(e.target.value)} />
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-600">{item ? 'Update' : 'Add'} Customer</button>
                </div>
            </form>
        );
    };

    const InputField = ({ label, ...props }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input {...props} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
    );
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'purchases': return <PurchaseList />;
            case 'sales': return <SaleList />;
            case 'expenses': return <ExpenseList />;
            case 'customers': return <CustomerList />;
            default: return <Dashboard />;
        }
    };
    
    if (!authReady) {
        return <div className="flex items-center justify-center h-screen bg-gray-100"><div className="text-2xl font-semibold text-gray-700">Loading Business Data...</div></div>;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-50 font-sans">
            <header className="bg-white shadow-md p-4 sticky top-0 z-10">
                 <h1 className="text-2xl font-bold text-gray-800 text-center">🥥 Coconut Wholesale Tracker</h1>
            </header>
            <main className="flex-1 overflow-y-auto pb-20">{renderTabContent()}</main>
            <nav className="bg-white border-t-2 border-gray-200 grid grid-cols-5 gap-1 p-2 fixed bottom-0 w-full z-10">
                <TabButton name="dashboard" label="Dashboard" icon={<HomeIcon />} />
                <TabButton name="purchases" label="Purchases" icon={<ArrowDownIcon />} />
                <TabButton name="sales" label="Sales" icon={<ArrowUpIcon />} />
                <TabButton name="customers" label="Customers" icon={<UsersIcon />} />
                <TabButton name="expenses" label="Expenses" icon={<DollarSignIcon />} />
            </nav>

            <Modal show={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title={editingPurchase ? 'Edit Purchase' : 'Add New Purchase'}><PurchaseForm item={editingPurchase} onClose={() => { setShowPurchaseModal(false); setEditingPurchase(null); }} /></Modal>
            <Modal show={showSaleModal} onClose={() => setShowSaleModal(false)} title={editingSale ? 'Edit Sale' : 'Add New Sale'}><SaleForm item={editingSale} onClose={() => { setShowSaleModal(false); setEditingSale(null); }} /></Modal>
            <Modal show={showExpenseModal} onClose={() => setShowExpenseModal(false)} title={editingExpense ? 'Edit Expense' : 'Add New Expense'}><ExpenseForm item={editingExpense} onClose={() => { setShowExpenseModal(false); setEditingExpense(null); }} /></Modal>
            <Modal show={showCustomerModal} onClose={() => setShowCustomerModal(false)} title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}><CustomerForm item={editingCustomer} onClose={() => { setShowCustomerModal(false); setEditingCustomer(null); }} /></Modal>
            
            <Modal show={showReminderModal} onClose={() => setShowReminderModal(false)} title="✨ AI-Generated Reminder">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Here is a draft message you can send to your customer.</p>
                    <div className="p-4 bg-gray-100 border rounded-lg text-gray-800 whitespace-pre-wrap font-mono">
                         {geminiLoading ? 'Generating...' : reminderMessage}
                    </div>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(reminderMessage).then(() => {
                                setCopySuccess(true);
                                setTimeout(() => setCopySuccess(false), 2000);
                            });
                        }} 
                        className={`w-full font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 ${copySuccess ? 'bg-teal-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
                    >
                        {copySuccess ? <><CheckCircleIcon/> Copied!</> : <><CopyIcon /> Copy Message</>}
                    </button>
                </div>
            </Modal>
            
            <Modal show={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Deletion">
                <div className="space-y-4">
                    <p className="text-gray-700">Are you sure you want to permanently delete this item? This action cannot be undone.</p>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => { setShowConfirmModal(false); setItemToDelete(null); }} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button type="button" onClick={executeDelete} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Yes, Delete</button>
                    </div>
                </div>
            </Modal>
        </div>
    );

    function TabButton({ name, label, icon }) {
        const isActive = activeTab === name;
        return (
            <button
                onClick={() => setActiveTab(name)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors duration-200 ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}
            >
                {icon}
                <span className="text-xs font-medium mt-1">{label}</span>
            </button>
        );
    }
};

export default App;

