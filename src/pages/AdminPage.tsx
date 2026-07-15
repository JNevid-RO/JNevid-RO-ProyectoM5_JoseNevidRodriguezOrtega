import { useState } from 'react';
import { products as initialProducts } from '../data/products';
import { useOrders } from '../contexts/OrdersContext';
import { formatPrice } from '../lib/utils';
import { uploadProductImage } from '../services/uploadService';
import type { Product } from '../types';

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const { orders, cancelOrder } = useOrders();

  // Form states for new product
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Computación');
  const [stock, setStock] = useState('10');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !category) return;

    setUploading(true);
    setMessage('');

    try {
      let imageUrl = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80';

      if (imageFile) {
        const uploadResult = await uploadProductImage(imageFile);
        imageUrl = uploadResult.publicUrl;
      }

      const newProduct: Product = {
        id: `p-${Date.now()}`,
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl,
        stock: parseInt(stock, 10) || 0,
        createdAt: new Date().toISOString(),
      };

      setProductList((prev) => [newProduct, ...prev]);
      setName('');
      setDescription('');
      setPrice('');
      setImageFile(null);
      setMessage('Producto agregado exitosamente al catálogo.');
    } catch (error) {
      setMessage('Error al subir la imagen o registrar el producto.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProductList((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <section className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Panel de Administración</h1>
        <p className="page-subtitle">Gestión integral del catálogo de productos y control de órdenes</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <button
          className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('products')}
        >
          Gestión de Productos ({productList.length})
        </button>
        <button
          className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('orders')}
        >
          Gestión de Órdenes ({orders.length})
        </button>
      </div>

      {message && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          {message}
        </div>
      )}

      {activeTab === 'products' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 360px) 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* Create Product Form */}
          <div className="card card-lg" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Nuevo Producto
            </h2>
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <label className="label">Imagen (Carga vía Presigned URL S3)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="input"
                  style={{ padding: '0.4rem' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={uploading}
                style={{ marginTop: '0.5rem' }}
              >
                {uploading ? 'Subiendo imagen a S3...' : 'Guardar producto'}
              </button>
            </form>
          </div>

          {/* Product List */}
          <div style={{ display: 'grid', gap: '1rem' }}>
            {productList.map((p) => (
              <div
                key={p.id}
                className="card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                }}
              >
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: 'var(--text)' }}>{p.name}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Categoría: {p.category} | Stock: {p.stock} unidades
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '0.4rem' }}>
                    {formatPrice(p.price)}
                  </p>
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
        /* Orders List Tab */
        <div style={{ display: 'grid', gap: '1rem' }}>
          {orders.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-title">No hay órdenes registradas</p>
              <p className="empty-state-desc">Las órdenes realizadas por los clientes aparecerán en este panel</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>ID: {ord.id}</span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Usuario: {ord.userId} | Fecha: {new Date(ord.createdAt).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <span className={`badge badge-${ord.status === 'pending' ? 'pending' : ord.status === 'completed' ? 'success' : 'cancelled'}`}>
                    Estado: {ord.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                  Envío: {ord.shippingAddress}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Total: {formatPrice(ord.total)}</span>
                  {ord.status === 'pending' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => cancelOrder(ord.id)}
                    >
                      Cancelar Orden
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
