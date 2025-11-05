import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from './inventory.module.css';

export default function InventoryManagement() {
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

  // Fetch inventory on mount
  useEffect(() => {
    fetchInventory();
  }, [filterCategory, filterBrand, showLowStock]);

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
    fetchInventory();
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
          <h1>📦 Inventory Management</h1>
          <button 
            className={styles.addButton}
            onClick={() => {
              setShowAddForm(true);
              setEditingItem(null);
            }}
          >
            + Add New Item
          </button>
        </div>

        {/* Stats Cards */}
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
      </div>
    </>
  );
}


