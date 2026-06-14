import { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import api from '../../services/api';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

const CATEGORIES = ['All', 'base', 'sauce', 'cheese', 'veggie', 'meat'];

const categoryLabels = {
  All: 'All',
  base: 'Bases',
  sauce: 'Sauces',
  cheese: 'Cheese',
  veggie: 'Veggies',
  meat: 'Meats',
};

const Inventory = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'base',
    quantity: '',
    threshold: '',
    price: '',
  });

  const fetchInventory = useCallback(async () => {
    try {
      const { data } = await api.get('/inventory/admin');
      setItems(data.data || data.items || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      toast.error('Failed to load inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter((item) => item.category === activeCategory);

  const openAddModal = () => {
    setEditItem(null);
    setFormData({ name: '', category: 'base', quantity: '', threshold: '', price: '' });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name || '',
      category: item.category || 'base',
      quantity: item.quantity?.toString() || '',
      threshold: item.threshold?.toString() || '',
      price: item.price?.toString() || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      category: formData.category,
      quantity: parseInt(formData.quantity, 10),
      threshold: parseInt(formData.threshold, 10),
      price: parseFloat(formData.price),
    };

    try {
      if (editItem) {
        await api.put(`/inventory/${editItem._id}`, payload);
        toast.success('Item updated successfully!');
      } else {
        await api.post('/inventory', payload);
        toast.success('Item added successfully!');
      }
      closeModal();
      fetchInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/inventory/${id}`);
      toast.success('Item deleted.');
      setDeleteConfirm(null);
      fetchInventory();
    } catch (err) {
      toast.error('Failed to delete item.');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-wrapper">
          <LoadingSpinner text="Loading inventory..." />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <div className="flex-between mb-xl" style={{ flexWrap: 'wrap', gap: 16 }}>
            <h1>Inventory Management 📋</h1>
            <button className="btn btn-primary" onClick={openAddModal}>
              <FiPlus /> Add Item
            </button>
          </div>

          {/* Category Filter */}
          <div className="filter-tabs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          {/* Table */}
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3 className="empty-state-title">No items found</h3>
              <p className="empty-state-text">Add inventory items to get started.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Threshold</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => {
                    const isLow = item.quantity < (item.threshold || 10);
                    const stockPercent = Math.min((item.quantity / Math.max(item.threshold || 10, 1)) * 100, 100);

                    return (
                      <tr key={item._id} className={isLow ? 'low-stock' : ''}>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>
                          <span style={{
                            textTransform: 'capitalize',
                            color: 'var(--text-secondary)',
                          }}>
                            {item.category}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ minWidth: 30 }}>{item.quantity}</span>
                            <div className="stock-bar">
                              <div
                                className={`stock-bar-fill ${isLow ? 'stock-low' : 'stock-ok'}`}
                                style={{ width: `${stockPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{item.threshold || 10}</td>
                        <td style={{ fontWeight: 600 }}>₹{item.price}</td>
                        <td>
                          <span className={`status-badge ${isLow ? 'status-unpaid' : 'status-paid'}`}>
                            {isLow ? '⚠ Low Stock' : '✓ In Stock'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => openEditModal(item)}
                              title="Edit"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setDeleteConfirm(item._id)}
                              title="Delete"
                              style={{ color: 'var(--color-danger)' }}
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editItem ? '✏️ Edit Item' : '➕ Add Item'}
              </h3>
              <button className="modal-close" onClick={closeModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  className="form-input"
                  placeholder="Item name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="base">Base</option>
                  <option value="sauce">Sauce</option>
                  <option value="cheese">Cheese</option>
                  <option value="veggie">Veggie</option>
                  <option value="meat">Meat</option>
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Threshold</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="10"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 className="modal-title">⚠️ Confirm Delete</h3>
              <button className="modal-close" onClick={() => setDeleteConfirm(null)}>
                <FiX />
              </button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
              Are you sure you want to delete this item? This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Inventory;
