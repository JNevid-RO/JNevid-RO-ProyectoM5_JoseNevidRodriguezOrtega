import { useState } from 'react';
import { products as initialProducts } from '../data/products';
import { useOrders } from '../contexts/OrdersContext';
import { formatPrice } from '../lib/utils';
import { uploadProductImage } from '../services/uploadService';
import type { Product } from '../types';

type AdminTab = 'products' | 'orders';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [productList, setProductList] = useState<Product[]>(
    initialProducts.map((p) => ({ ...p, available: p.available !== false }))
  );
  const { orders, updateOrderStatus } = useOrders();

  // ── Product form states ──
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Computación');
  const [stock, setStock] = useState('10');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const resetForm = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Computación');
    setStock('10');
    setImageFile(null);
  };

  const startEditing = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description);
    setPrice(String(product.price));
    setCategory(product.category);
    setStock(String(product.stock));
    setImageFile(null);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) return;

    setUploading(true);
    setMessage('');

    try {
      let imageUrl = editingProduct?.imageUrl ||
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80';

      if (imageFile) {
        const uploadResult = await uploadProductImage(imageFile);
        imageUrl = uploadResult.publicUrl;
      }

      if (editingProduct) {
        // Actualizar producto existente
        setProductList((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name,
                  description,
                  price: parseFloat(price),
                  category,
                  stock: parseInt(stock, 10) || 0,
                  imageUrl,
                }
              : p
          )
        );
        setMessage(`Producto "${name}" actualizado correctamente.`);
      } else {
        // Crear producto nuevo
        const newProduct: Product = {
          id: `p-${Date.now()}`,
          name,
          description,
          price: parseFloat(price),
          category,
          imageUrl,
          stock: parseInt(stock, 10) || 0,
          available: true,
          createdAt: new Date().toISOString(),
        };
        setProductList((prev) => [newProduct, ...prev]);
        setMessage(`Producto "${name}" agregado al catálogo.`);
      }

      resetForm();
    } catch (error) {
      setMessage('Error al subir la imagen o registrar el producto.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    const product = productList.find((p) => p.id === productId);
    if (product && confirm(`¿Eliminar "${product.name}" del catálogo?`)) {
      setProductList((prev) => prev.filter((p) => p.id !== productId));
      setMessage(`Producto "${product.name}" eliminado.`);
    }
  };

  const toggleAvailability = (productId: string) => {
    setProductList((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, available: !p.available }
          : p
      )
    );
  };

  // ── Helpers de órdenes ──
  const statusLabel: Record<string, string> = {
    pending: 'Pendiente',
    shipped: 'Enviada',
    completed: 'Completada',
    cancelled: 'Cancelada',
  };

  const statusBadgeClass: Record<string, string> = {
    pending: 'badge-pending',
    shipped: 'badge-shipped',
    completed: 'badge-success',
    cancelled: 'badge-cancelled',
  };

  return (
    <section className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Panel de Administración</h1>
        <p className="page-subtitle">Gestión integral del catálogo de productos y control de órdenes</p>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'products' ? 'admin-tab-active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Productos ({productList.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'orders' ? 'admin-tab-active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Órdenes ({orders.length})
        </button>
      </div>

      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {message}
        </div>
      )}

      {/* ═══ TAB: PRODUCTOS ═══ */}
      {activeTab === 'products' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 380px) 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Formulario crear / editar */}
          <div className="card" style={{ padding: '1.75rem', position: 'sticky', top: '5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              {editingProduct && (
                <button className="btn btn-ghost btn-sm" onClick={resetForm}>
                  Cancelar edición
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="label">Nombre del producto</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Teclado Mecánico RGB"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">Categoría</label>
                <select
                  className="filter-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Computación">Computación</option>
                  <option value="Audio">Audio</option>
                  <option value="Wearables">Wearables</option>
                  <option value="Accesorios">Accesorios</option>
                  <option value="Smartphones">Smartphones</option>
                  <option value="Gaming">Gaming</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="label">Precio ($)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="99.99"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Stock</label>
                  <input
                    className="input"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="10"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Descripción</label>
                <textarea
                  className="input textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles y características del producto..."
                />
              </div>

              <div className="form-group">
                <label className="label">
                  {editingProduct ? 'Cambiar imagen (opcional)' : 'Imagen del producto'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="input"
                  style={{ padding: '0.4rem' }}
                />
              </div>

              {editingProduct && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={editingProduct.imageUrl}
                    alt="Imagen actual"
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Imagen actual</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={uploading}
                style={{ marginTop: '0.5rem' }}
              >
                {uploading
                  ? 'Subiendo imagen a S3...'
                  : editingProduct
                  ? 'Guardar cambios'
                  : 'Agregar producto'}
              </button>
            </form>
          </div>

          {/* Lista de productos */}
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {productList.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  opacity: p.available === false ? 0.5 : 1,
                  transition: 'opacity 0.2s ease',
                }}
              >
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <p style={{ fontWeight: 700, color: 'var(--text)' }}>{p.name}</p>
                    {p.available === false && (
                      <span className="badge badge-cancelled" style={{ fontSize: '0.65rem' }}>No disponible</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {p.category} · Stock: {p.stock} · {formatPrice(p.price)}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    className={`btn btn-sm ${p.available === false ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => toggleAvailability(p.id)}
                    title={p.available === false ? 'Habilitar' : 'Deshabilitar'}
                  >
                    {p.available === false ? 'Habilitar' : 'Deshabilitar'}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => startEditing(p)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteProduct(p.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ═══ TAB: ÓRDENES ═══ */
        <div style={{ display: 'grid', gap: '1rem' }}>
          {orders.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No hay órdenes registradas</p>
              <p className="empty-state-desc">Las órdenes realizadas por los clientes aparecerán aquí</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="card" style={{ padding: '1.25rem' }}>
                {/* Cabecera de la orden */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '0.9rem' }}>
                      {ord.id}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      Cliente: {ord.userId} · {new Date(ord.createdAt).toLocaleDateString('es-MX', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`badge ${statusBadgeClass[ord.status] || 'badge-pending'}`}>
                    {statusLabel[ord.status] || ord.status}
                  </span>
                </div>

                {/* Productos de la orden */}
                <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '0.75rem' }}>
                  {ord.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.25rem 0' }}>
                      <span>{item.name} × {item.quantity}</span>
                      <span style={{ fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                {/* Dirección de envío */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Dirección de envío: {ord.shippingAddress}
                </p>

                {/* Total + Acciones */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.15rem' }}>
                    Total: {formatPrice(ord.total)}
                  </span>

                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {ord.status !== 'pending' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => updateOrderStatus(ord.id, 'pending')}
                      >
                        Marcar Pendiente
                      </button>
                    )}
                    {ord.status !== 'shipped' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => updateOrderStatus(ord.id, 'shipped')}
                      >
                        Marcar Enviada
                      </button>
                    )}
                    {ord.status !== 'completed' && (
                      <button
                        className="btn btn-sm"
                        style={{ background: 'var(--success)', color: '#0f172a' }}
                        onClick={() => updateOrderStatus(ord.id, 'completed')}
                      >
                        Completar
                      </button>
                    )}
                    {ord.status !== 'cancelled' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => updateOrderStatus(ord.id, 'cancelled')}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
