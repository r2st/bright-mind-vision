import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from './inventory.module.css';

export default function InventoryManagement() {
  // Tab state
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' or 'products'
  
  // Inventory state
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [selectedSku, setSelectedSku] = useState(null);
  
  // Products state
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [generatingEmbeddings, setGeneratingEmbeddings] = useState(false);

  // Fetch inventory on mount
  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventory();
    } else if (activeTab === 'products') {
      fetchProducts();
    }
  }, [filterCategory, filterBrand, showLowStock, activeTab]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);
      if (filterBrand) params.append('brand', filterBrand);
      if (showLowStock) params.append('lowStock', 'true');

      const response = await fetch(`/api/inventory?${params}`);
      const data = await response.json();

      if (data.success) {
        setInventory(data.items || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to load inventory');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'inventory') {
      fetchInventory();
    } else {
      fetchProducts();
    }
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
    setShowAddForm(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/inventory/${editingItem.sku}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_name: editingItem.product_name,
          brand: editingItem.brand,
          category: editingItem.category,
          quantity: parseInt(editingItem.quantity),
          reserved_quantity: parseInt(editingItem.reserved_quantity || 0),
          location: editingItem.location,
          reason: 'Manual update from inventory management'
        })
      });

      const data = await response.json();
      if (data.success) {
        setEditingItem(null);
        fetchInventory();
        alert('Inventory updated successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const item = {
        sku: formData.get('sku'),
        product_name: formData.get('product_name'),
        brand: formData.get('brand'),
        category: formData.get('category'),
        quantity: parseInt(formData.get('quantity')),
        location: formData.get('location')
      };

      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      const data = await response.json();
      if (data.success) {
        setShowAddForm(false);
        fetchInventory();
        alert('Inventory item added successfully!');
        e.target.reset();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDelete = async (sku) => {
    if (!confirm(`Are you sure you want to delete ${sku}?`)) return;

    try {
      const response = await fetch(`/api/inventory/${sku}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        fetchInventory();
        alert('Inventory item deleted successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const viewTransactions = async (sku) => {
    try {
      const response = await fetch(`/api/inventory/transactions?sku=${sku}&limit=50`);
      const data = await response.json();
      if (data.success) {
        setTransactions(data.transactions || []);
        setSelectedSku(sku);
      }
    } catch (err) {
      alert(`Error loading transactions: ${err.message}`);
    }
  };

  // Products management functions
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory) params.append('category', filterCategory);
      if (filterBrand) params.append('brand', filterBrand);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to load products');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleProductSave = async (e) => {
    e.preventDefault();
    try {
      setGeneratingEmbeddings(true);
      const formData = new FormData(e.target);
      
      // Parse category (comma-separated or array)
      const categoryInput = formData.get('category') || '';
      const category = categoryInput.includes(',') 
        ? categoryInput.split(',').map(c => c.trim()).filter(Boolean)
        : (categoryInput ? [categoryInput.trim()] : []);

      // Parse tags (comma-separated)
      const tagsInput = formData.get('tags') || '';
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

      // Parse badges (comma-separated)
      const badgesInput = formData.get('badges') || '';
      const badges = badgesInput.split(',').map(b => b.trim()).filter(Boolean);

      // Parse images (comma-separated)
      const imagesInput = formData.get('images') || '';
      const images = imagesInput.split(',').map(i => i.trim()).filter(Boolean);

      // Build attributes object
      const attributes = {};
      const attributeFields = ['material', 'color', 'gender', 'collection', 'size', 'hardware', 'movement', 'water_resistance'];
      attributeFields.forEach(field => {
        const value = formData.get(`attr_${field}`);
        if (value && value.trim()) {
          attributes[field] = value.trim();
        }
      });

      const productData = {
        sku: formData.get('sku'),
        title: formData.get('title'),
        brand: formData.get('brand'),
        category: category,
        subcategory: formData.get('subcategory') || null,
        price: parseFloat(formData.get('price')) || 0,
        currency: formData.get('currency') || 'AED',
        description: formData.get('description') || '',
        tags: tags,
        rating: parseFloat(formData.get('rating')) || 0,
        reviews: parseInt(formData.get('reviews')) || 0,
        attributes: attributes,
        badges: badges,
        images: images,
        pdp_url: formData.get('pdp_url') || null,
        region: formData.get('region') || 'UAE',
        in_stock: formData.get('in_stock') === 'true' || formData.get('in_stock') === 'on'
      };

      const url = editingProduct 
        ? `/api/products/${editingProduct.sku}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });

      const data = await response.json();
      if (data.success) {
        setEditingProduct(null);
        setShowProductForm(false);
        fetchProducts();
        alert(`Product ${editingProduct ? 'updated' : 'created'} successfully! Embeddings generated automatically.`);
        e.target.reset();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setGeneratingEmbeddings(false);
    }
  };

  const handleProductEdit = (product) => {
    // Format product for editing
    const formatted = {
      ...product,
      category: Array.isArray(product.category) ? product.category.join(', ') : product.category,
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : product.tags,
      badges: Array.isArray(product.badges) ? product.badges.join(', ') : (product.badges || ''),
      images: Array.isArray(product.images) ? product.images.join(', ') : (product.images || ''),
      price: typeof product.price === 'object' ? product.price.amount : product.price,
      reviews: product.reviews || 0,
      pdp_url: product.urls?.pdp || product.pdp_url || '',
      region: product.availability?.region?.[0] || product.region || 'UAE',
      in_stock: product.availability?.in_stock !== false && product.in_stock !== false
    };
    
    // Extract attributes
    if (product.attributes) {
      Object.keys(product.attributes).forEach(key => {
        formatted[`attr_${key}`] = product.attributes[key];
      });
    }
    
    setEditingProduct(formatted);
    setShowProductForm(true);
  };

  const handleProductDelete = async (sku) => {
    if (!confirm(`Are you sure you want to delete product ${sku}? This will also delete all embeddings.`)) return;

    try {
      const response = await fetch(`/api/products/${sku}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        fetchProducts();
        alert('Product deleted successfully!');
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Get unique categories and brands for filters
  const categories = [...new Set(inventory.map(item => item.category).filter(Boolean))].sort();
  const brands = [...new Set(inventory.map(item => item.brand).filter(Boolean))].sort();

  // Calculate stats
  const totalItems = inventory.length;
  const inStockItems = inventory.filter(item => item.available_quantity > 0).length;
  const outOfStockItems = inventory.filter(item => item.available_quantity === 0).length;
  const lowStockItems = inventory.filter(item => item.available_quantity <= 5 && item.available_quantity > 0).length;
  const totalValue = inventory.reduce((sum, item) => {
    // Estimate value (would need price from product catalog)
    return sum + (item.quantity || 0);
  }, 0);

  return (
    <>
      <Head>
        <title>Inventory Management - Bright Mind Vision</title>
        <meta name="description" content="Manage inventory for luxury products" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>📦 Product & Inventory Management</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {activeTab === 'inventory' && (
              <button 
                className={styles.addButton}
                onClick={() => {
                  setShowAddForm(true);
                  setEditingItem(null);
                }}
              >
                + Add Inventory Item
              </button>
            )}
            <button 
              className={styles.addButton}
              onClick={() => {
                if (activeTab !== 'products') {
                  setActiveTab('products');
                }
                setShowProductForm(true);
                setEditingProduct(null);
              }}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              ➕ Add New Product
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'inventory' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            📦 Inventory
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'products' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🛍️ Products & Embeddings
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <button 
              className={styles.addButton}
              onClick={() => {
                if (activeTab !== 'products') {
                  setActiveTab('products');
                }
                setShowProductForm(true);
                setEditingProduct(null);
              }}
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                fontSize: '0.95rem',
                fontWeight: '600',
                padding: '0.625rem 1.25rem'
              }}
            >
              ➕ Add New Product
            </button>
          </div>
        </div>

        {/* Stats Cards - Show different stats based on active tab */}
        {activeTab === 'inventory' && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{totalItems}</div>
            <div className={styles.statLabel}>Total Items</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#10b981' }}>{inStockItems}</div>
            <div className={styles.statLabel}>In Stock</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#ef4444' }}>{outOfStockItems}</div>
            <div className={styles.statLabel}>Out of Stock</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#f59e0b' }}>{lowStockItems}</div>
            <div className={styles.statLabel}>Low Stock (≤5)</div>
          </div>
        </div>
        )}

        {activeTab === 'products' && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{products.length}</div>
            <div className={styles.statLabel}>Total Products</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#3b82f6' }}>
              {products.filter(p => p.rating >= 4.5).length}
            </div>
            <div className={styles.statLabel}>High Rated (≥4.5)</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#10b981' }}>
              {[...new Set(products.map(p => p.brand).filter(Boolean))].length}
            </div>
            <div className={styles.statLabel}>Brands</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#8b5cf6' }}>
              🔍
            </div>
            <div className={styles.statLabel}>Embeddings Auto-Generated</div>
          </div>
        </div>
        )}

        {/* Search and Filters */}
        <div className={styles.filters}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search products, SKU, brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchButton}>🔍 Search</button>
          </form>

          <div className={styles.filterGroup}>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
              />
              Show Low Stock Only
            </label>
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingItem) && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>{editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h2>
              <form onSubmit={editingItem ? handleSave : handleAdd}>
                <div className={styles.formGroup}>
                  <label>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={editingItem?.sku || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, sku: e.target.value })}
                    required
                    disabled={!!editingItem}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="product_name"
                    value={editingItem?.product_name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, product_name: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Brand</label>
                    <input
                      type="text"
                      name="brand"
                      value={editingItem?.brand || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, brand: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Category</label>
                    <input
                      type="text"
                      name="category"
                      value={editingItem?.category || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={editingItem?.quantity || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, quantity: e.target.value })}
                      required
                      min="0"
                    />
                  </div>
                  {editingItem && (
                    <div className={styles.formGroup}>
                      <label>Reserved Quantity</label>
                      <input
                        type="number"
                        name="reserved_quantity"
                        value={editingItem?.reserved_quantity || 0}
                        onChange={(e) => setEditingItem({ ...editingItem, reserved_quantity: e.target.value })}
                        min="0"
                      />
                    </div>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={editingItem?.location || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                    placeholder="e.g., Dubai Warehouse"
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.saveButton}>
                    {editingItem ? 'Update' : 'Add'} Item
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                      setEditingItem(null);
                      setShowAddForm(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions Modal */}
        {selectedSku && transactions.length > 0 && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2>Transaction History: {selectedSku}</h2>
              <div className={styles.transactionsList}>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Change</th>
                      <th>Before</th>
                      <th>After</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx.transaction_id}>
                        <td>{new Date(tx.created_at).toLocaleString()}</td>
                        <td>{tx.transaction_type}</td>
                        <td style={{ color: tx.quantity_change > 0 ? '#10b981' : '#ef4444' }}>
                          {tx.quantity_change > 0 ? '+' : ''}{tx.quantity_change}
                        </td>
                        <td>{tx.quantity_before}</td>
                        <td>{tx.quantity_after}</td>
                        <td>{tx.reason || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setSelectedSku(null);
                  setTransactions([]);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={styles.error}>
            ⚠️ {error}
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'inventory' && (
          <>
            {/* Inventory Table */}
            {loading ? (
              <div className={styles.loading}>Loading inventory...</div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.inventoryTable}>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Product Name</th>
                      <th>Brand</th>
                      <th>Category</th>
                      <th>Total Qty</th>
                      <th>Reserved</th>
                      <th>Available</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.length === 0 ? (
                      <tr>
                        <td colSpan="10" className={styles.noData}>
                          No inventory items found
                        </td>
                      </tr>
                    ) : (
                      inventory.map(item => {
                        const isLowStock = item.available_quantity <= 5 && item.available_quantity > 0;
                        const isOutOfStock = item.available_quantity === 0;
                        
                        return (
                          <tr key={item.sku} className={isOutOfStock ? styles.outOfStock : isLowStock ? styles.lowStock : ''}>
                            <td><strong>{item.sku}</strong></td>
                            <td>{item.product_name}</td>
                            <td>{item.brand || '-'}</td>
                            <td>{item.category || '-'}</td>
                            <td>{item.quantity || 0}</td>
                            <td>{item.reserved_quantity || 0}</td>
                            <td>
                              <span className={isOutOfStock ? styles.badgeOut : isLowStock ? styles.badgeLow : styles.badgeIn}>
                                {item.available_quantity || 0}
                              </span>
                            </td>
                            <td>{item.location || '-'}</td>
                            <td>
                              {isOutOfStock ? (
                                <span className={styles.statusBadge} style={{ background: '#fee2e2', color: '#dc2626' }}>
                                  Out of Stock
                                </span>
                              ) : isLowStock ? (
                                <span className={styles.statusBadge} style={{ background: '#fef3c7', color: '#d97706' }}>
                                  Low Stock
                                </span>
                              ) : (
                                <span className={styles.statusBadge} style={{ background: '#d1fae5', color: '#059669' }}>
                                  In Stock
                                </span>
                              )}
                            </td>
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={styles.actionBtn}
                                  onClick={() => handleEdit(item)}
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  className={styles.actionBtn}
                                  onClick={() => viewTransactions(item.sku)}
                                  title="View Transactions"
                                >
                                  📊
                                </button>
                                <button
                                  className={styles.actionBtn}
                                  onClick={() => handleDelete(item.sku)}
                                  title="Delete"
                                  style={{ color: '#ef4444' }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'products' && (
          <>
            {/* Products Table */}
            {productsLoading ? (
              <div className={styles.loading}>Loading products...</div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.inventoryTable}>
                  <thead>
                    <tr>
                      <th>SKU</th>
                      <th>Title</th>
                      <th>Brand</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Rating</th>
                      <th>Tags</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="8" className={styles.noData}>
                          No products found. Add your first product to get started!
                        </td>
                      </tr>
                    ) : (
                      products.map(product => {
                        const category = Array.isArray(product.category) 
                          ? product.category.join(', ') 
                          : product.category;
                        const tags = Array.isArray(product.tags) 
                          ? product.tags.join(', ') 
                          : product.tags;
                        const price = typeof product.price === 'object' 
                          ? `${product.price.amount} ${product.price.currency}`
                          : `${product.price} ${product.currency || 'AED'}`;
                        
                        return (
                          <tr key={product.sku}>
                            <td><strong>{product.sku}</strong></td>
                            <td>{product.title}</td>
                            <td>{product.brand || '-'}</td>
                            <td>{category || '-'}</td>
                            <td>{price}</td>
                            <td>{product.rating ? `⭐ ${product.rating}` : '-'}</td>
                            <td>{tags || '-'}</td>
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={styles.actionBtn}
                                  onClick={() => handleProductEdit(product)}
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                                <button
                                  className={styles.actionBtn}
                                  onClick={() => handleProductDelete(product.sku)}
                                  title="Delete"
                                  style={{ color: '#ef4444' }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <div className={styles.modal}>
            <div className={styles.modalContent} style={{ maxWidth: '900px', maxHeight: '95vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h2>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductForm(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '0.25rem 0.5rem'
                  }}
                >
                  ✕
                </button>
              </div>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '0.5rem', border: '1px solid #bae6fd' }}>
                💡 <strong>Automatic Embedding Generation:</strong> When you save this product, embeddings will be automatically generated for semantic search (title, description, and combined embeddings).
              </p>
              <form onSubmit={handleProductSave}>
                <div className={styles.formGroup}>
                  <label>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    defaultValue={editingProduct?.sku || ''}
                    required
                    disabled={!!editingProduct}
                    placeholder="e.g., CH-CFB-MED-BLK"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Product Title *</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingProduct?.title || ''}
                    required
                    placeholder="e.g., Chanel Classic Flap Bag Medium"
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Brand *</label>
                    <input
                      type="text"
                      name="brand"
                      defaultValue={editingProduct?.brand || ''}
                      required
                      placeholder="e.g., Chanel"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Subcategory</label>
                    <input
                      type="text"
                      name="subcategory"
                      defaultValue={editingProduct?.subcategory || ''}
                      placeholder="e.g., Handbags"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Category * (comma-separated)</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingProduct?.category || ''}
                    required
                    placeholder="e.g., Fashion, Bags, Handbags"
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Price *</label>
                    <input
                      type="number"
                      name="price"
                      defaultValue={editingProduct?.price || ''}
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g., 38500"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Currency *</label>
                    <select
                      name="currency"
                      defaultValue={editingProduct?.currency || 'AED'}
                      required
                    >
                      <option value="AED">AED</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingProduct?.description || ''}
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      fontFamily: 'inherit'
                    }}
                    placeholder="Detailed product description for semantic search..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    defaultValue={editingProduct?.tags || ''}
                    placeholder="e.g., luxury, chanel, handbag, classic, investment"
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Rating (0-5)</label>
                    <input
                      type="number"
                      name="rating"
                      defaultValue={editingProduct?.rating || 0}
                      min="0"
                      max="5"
                      step="0.1"
                      placeholder="e.g., 4.9"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Number of Reviews</label>
                    <input
                      type="number"
                      name="reviews"
                      defaultValue={editingProduct?.reviews || 0}
                      min="0"
                      placeholder="e.g., 120"
                    />
                  </div>
                </div>

                {/* Attributes Section */}
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#374151', fontSize: '1.125rem' }}>📋 Product Attributes</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Material</label>
                      <input
                        type="text"
                        name="attr_material"
                        defaultValue={editingProduct?.attr_material || ''}
                        placeholder="e.g., Lambskin Leather"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Color</label>
                      <input
                        type="text"
                        name="attr_color"
                        defaultValue={editingProduct?.attr_color || ''}
                        placeholder="e.g., Black"
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Gender</label>
                      <select
                        name="attr_gender"
                        defaultValue={editingProduct?.attr_gender || ''}
                      >
                        <option value="">Select...</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Collection</label>
                      <input
                        type="text"
                        name="attr_collection"
                        defaultValue={editingProduct?.attr_collection || ''}
                        placeholder="e.g., Classic"
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Size</label>
                      <input
                        type="text"
                        name="attr_size"
                        defaultValue={editingProduct?.attr_size || ''}
                        placeholder="e.g., Medium, 30cm, MM"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Hardware</label>
                      <input
                        type="text"
                        name="attr_hardware"
                        defaultValue={editingProduct?.attr_hardware || ''}
                        placeholder="e.g., Gold-tone"
                      />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Movement (Watches)</label>
                      <input
                        type="text"
                        name="attr_movement"
                        defaultValue={editingProduct?.attr_movement || ''}
                        placeholder="e.g., Automatic"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Water Resistance (Watches)</label>
                      <input
                        type="text"
                        name="attr_water_resistance"
                        defaultValue={editingProduct?.attr_water_resistance || ''}
                        placeholder="e.g., 300m"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details Section */}
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
                  <h3 style={{ marginBottom: '1rem', color: '#374151', fontSize: '1.125rem' }}>🏷️ Additional Details</h3>
                  <div className={styles.formGroup}>
                    <label>Badges (comma-separated)</label>
                    <input
                      type="text"
                      name="badges"
                      defaultValue={editingProduct?.badges || ''}
                      placeholder="e.g., iconic, investment, exclusive, high_resale"
                    />
                    <small style={{ color: '#6b7280', fontSize: '0.75rem', display: 'block', marginTop: '0.25rem' }}>
                      Common badges: iconic, investment, exclusive, versatile, timeless, high_resale, waitlist
                    </small>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Images (comma-separated emojis or URLs)</label>
                    <input
                      type="text"
                      name="images"
                      defaultValue={editingProduct?.images || ''}
                      placeholder="e.g., 👜, 🛍️, ⌚ or https://example.com/image.jpg"
                    />
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Product Page URL</label>
                      <input
                        type="text"
                        name="pdp_url"
                        defaultValue={editingProduct?.pdp_url || ''}
                        placeholder="e.g., /products/chanel-classic-flap-bag"
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Region</label>
                      <select
                        name="region"
                        defaultValue={editingProduct?.region || 'UAE'}
                      >
                        <option value="UAE">UAE</option>
                        <option value="KSA">KSA</option>
                        <option value="Global">Global</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        name="in_stock"
                        defaultChecked={editingProduct?.in_stock !== false}
                      />
                      In Stock
                    </label>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="submit" 
                    className={styles.saveButton}
                    disabled={generatingEmbeddings}
                  >
                    {generatingEmbeddings ? '🔄 Generating Embeddings...' : (editingProduct ? 'Update' : 'Create') + ' Product'}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => {
                      setEditingProduct(null);
                      setShowProductForm(false);
                    }}
                    disabled={generatingEmbeddings}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}


