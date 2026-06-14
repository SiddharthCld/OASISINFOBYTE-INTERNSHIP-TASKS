import { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

const STATUS_OPTIONS = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'];
const FILTERS = ['All', 'Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'];

const OrderManagement = () => {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/orders/all');
      const ordersList = data.data || data.orders || (Array.isArray(data) ? data : []);
      // Sort by newest first
      ordersList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(ordersList);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Status updated to "${newStatus}"`);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const filteredOrders = activeFilter === 'All'
    ? orders
    : orders.filter((o) => (o.orderStatus || 'Order Received') === activeFilter);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOrderItems = (order) => {
    if (!order.items || !Array.isArray(order.items)) return 'Custom Pizza';
    return order.items
      .map((item) => item.inventoryItem?.name || item.name || 'Item')
      .join(', ');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-wrapper">
          <LoadingSpinner text="Loading orders..." />
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
            <h1>Order Management 🚀</h1>
            <span className="text-secondary" style={{ fontSize: '0.9rem' }}>
              {orders.length} total orders
            </span>
          </div>

          {/* Filter Tabs */}
          <div className="filter-tabs">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Orders */}
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <h3 className="empty-state-title">No orders found</h3>
              <p className="empty-state-text">
                {activeFilter === 'All'
                  ? 'No orders have been placed yet.'
                  : `No orders with "${activeFilter}" status.`}
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <span className="order-id" style={{ fontSize: '0.85rem' }}>
                          #{order._id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 500 }}>
                            {order.user?.name || 'Unknown'}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {order.user?.email || ''}
                          </div>
                        </div>
                      </td>
                      <td style={{ maxWidth: 200, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {getOrderItems(order)}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        ₹{order.totalAmount || order.amount || 0}
                      </td>
                      <td>
                        <span className={`status-badge ${order.paymentStatus === 'paid' ? 'status-paid' : 'status-unpaid'}`}>
                          {order.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <OrderStatusBadge status={order.orderStatus || 'Order Received'} />
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                      </td>
                      <td>
                        <select
                          className="form-select"
                          value={order.orderStatus || 'Order Received'}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          style={{
                            padding: '8px 32px 8px 12px',
                            fontSize: '0.8rem',
                            minWidth: 160,
                          }}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrderManagement;
