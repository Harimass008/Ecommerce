import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, clearSession, getUser, saveSession } from '../services/api.js';

async function fetchProducts(search, category) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (category !== 'All') params.set('category', category);
  const data = await api(`/products?${params}`);
  return data.products || [];
}

async function fetchAccount(user) {
  if (user.role === 'customer') {
    const data = await api('/orders/my');
    return { orders: data.orders || [] };
  }
  if (user.role === 'seller') {
    const [orders, products] = await Promise.all([
      api('/orders/seller'),
      api('/products'),
    ]);
    return {
      orders: orders.orders || [],
      myProducts: (products.products || []).filter(
        (product) => String(product.seller?._id || product.seller) === String(user.id),
      ),
    };
  }
  if (user.role === 'admin') {
    const [overview, orders] = await Promise.all([
      api('/admin/overview'),
      api('/orders/seller'),
    ]);
    return { overview: overview.overview, orders: orders.orders || [] };
  }
  return {};
}

export default function useMarketplaceController(onNavigate) {
  const [user, setUser] = useState(getUser());
  const [products, setProducts] = useState([]); const [search, setSearch] = useState(''); const [category, setCategory] = useState('All');
  const [cart, setCart] = useState([]); const [page, setPage] = useState('shop'); const [modal, setModal] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' }); const [resetForm, setResetForm] = useState({ token: '', password: '', confirmPassword: '' }); const [notice, setNotice] = useState(''); const [error, setError] = useState('');
  const [orders, setOrders] = useState([]); const [overview, setOverview] = useState(null); const [myProducts, setMyProducts] = useState([]);
  const [productForm, setProductForm] = useState({ name: '', category: 'Electronics', description: '', price: '', stock: '1', imageUrl: '' });
  const [address, setAddress] = useState(''); const [busy, setBusy] = useState(false);
  const loadProducts = useCallback(async () => {
    try {
      setProducts(await fetchProducts(search, category));
    } catch (e) {
      setError(e.message);
    }
  }, [search, category]);
  useEffect(() => {
    let canceled = false;
    fetchProducts(search, category)
      .then((nextProducts) => {
        if (!canceled) setProducts(nextProducts);
      })
      .catch((e) => {
        if (!canceled) setError(e.message);
      });
    return () => {
      canceled = true;
    };
  }, [search, category]);
  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category).filter(Boolean))], [products]);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const applyAccountData = useCallback((data) => {
    if (data.orders) setOrders(data.orders);
    if (data.myProducts) setMyProducts(data.myProducts);
    if (data.overview) setOverview(data.overview);
  }, []);
  const refreshAccount = useCallback(async () => {
    if (!user) return;
    try {
      applyAccountData(await fetchAccount(user));
    } catch (e) {
      setError(e.message);
    }
  }, [user, applyAccountData]);
  useEffect(() => {
    if (!user) return undefined;
    let canceled = false;
    fetchAccount(user)
      .then((data) => {
        if (!canceled) applyAccountData(data);
      })
      .catch((e) => {
        if (!canceled) setError(e.message);
      });
    return () => {
      canceled = true;
    };
  }, [user, applyAccountData]);
  async function submitAuth(e) { e.preventDefault(); setBusy(true); setError(''); try { const path = modal === 'register' ? '/auth/register' : '/auth/login'; const payload = modal === 'register' ? form : { email: form.email, password: form.password }; const data = await api(path, { method: 'POST', body: JSON.stringify(payload) }); saveSession(data); setUser(data.user); setModal(''); setNotice(`Welcome, ${data.user.name}!`); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  async function requestPasswordReset(e) { e?.preventDefault?.(); setBusy(true); setError(''); try { const data = await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email: form.email }) }); setNotice(data.message || 'If an account exists, reset instructions have been sent.'); setModal('login'); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  async function submitPasswordReset(e) { e?.preventDefault?.(); setBusy(true); setError(''); try { const data = await api('/auth/reset-password', { method: 'POST', body: JSON.stringify(resetForm) }); setNotice(data.message || 'Password reset successfully.'); setResetForm({ token: '', password: '', confirmPassword: '' }); setForm({ ...form, password: '' }); setModal('login'); window.history.replaceState({}, '', window.location.pathname); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  async function changePassword(payload) { const data = await api('/auth/change-password', { method: 'POST', body: JSON.stringify(payload) }); setNotice(data.message || 'Password updated successfully.'); return data; }
  function logout() { clearSession(); setUser(null); setPage('shop'); onNavigate?.('shop'); setCart([]); setNotice('You have signed out.'); }
  function addToCart(p) { setCart(old => { const found = old.find(x => x._id === p._id); if (found) return old.map(x => x._id === p._id ? { ...x, quantity: Math.min(x.quantity + 1, p.stock) } : x); return [...old, { ...p, quantity: 1, price: p.price }]; }); setNotice(`${p.name} added to cart`); }
  async function checkout() { if (!user) { setModal('login'); setError('Sign in before checkout.'); return; } if (user.role !== 'customer') { setError('Only customer accounts can place orders.'); return; } if (!cart.length || !address.trim()) { setError('Add items and enter a shipping address.'); return; } setBusy(true); try { const d = await api('/orders', { method: 'POST', body: JSON.stringify({ items: cart.map(i => ({ productId: i._id, quantity: i.quantity })), shippingAddress: address }) }); setCart([]); setAddress(''); setNotice(`Demo order ${d.order._id.slice(-6)} created. No payment was collected.`); setPage('orders'); onNavigate?.('orders'); await refreshAccount(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  async function createProduct(e) { e.preventDefault(); setBusy(true); setError(''); try { await api('/products', { method: 'POST', body: JSON.stringify({ ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) }) }); setNotice('Product published successfully.'); setProductForm({ name: '', category: 'Electronics', description: '', price: '', stock: '1', imageUrl: '' }); await loadProducts(); await refreshAccount(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  async function updateOrder(id, status) { try { await api(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); await refreshAccount(); setNotice('Order status updated.'); } catch (e) { setError(e.message); } }
  async function loadAdminUsers() { try { const d = await api('/admin/users'); setMyProducts(d.users || []); } catch (e) { setError(e.message); } }
  async function changeRole(id, role) { try { await api(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }); await loadAdminUsers(); setNotice('User role updated.'); } catch (e) { setError(e.message); } }

  return {
    user, setUser, products, setProducts, search, setSearch, category, setCategory,
    cart, setCart, page, setPage, modal, setModal, form, setForm, resetForm, setResetForm, requestPasswordReset, submitPasswordReset, changePassword, notice, setNotice,
    error, setError, orders, setOrders, overview, setOverview, myProducts, setMyProducts,
    productForm, setProductForm, address, setAddress, busy, setBusy, categories, total,
    loadProducts, refreshAccount, submitAuth, logout, addToCart, checkout, createProduct,
    updateOrder, loadAdminUsers, changeRole
  };
}
