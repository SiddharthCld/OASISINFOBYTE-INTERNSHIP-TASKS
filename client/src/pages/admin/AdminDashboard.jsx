import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersRes = await api.get('/orders/all');
        const orders = ordersRes.data.data || ordersRes.data.orders || (Array.isArray(ordersRes.data) ? ordersRes.data : []);

        // Fetch inventory
        let inventory = [];
        try {
          const invRes = await api.get('/inventory/admin');
          inventory = invRes.data.data || invRes.data.items || (Array.isArray(invRes.data) ? invRes.data : []);
        } catch (e) {
          console.log('Inventory fetch failed:', e);
        }

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || o.amount || 0), 0);
        const lowStockItems = inventory.filter((i) => i.quantity < (i.threshold || 10)).length;
        const pendingOrders = orders.filter((o) => o.orderStatus !== 'Delivered').length;

        setStats({ totalOrders, totalRevenue, lowStockItems, pendingOrders });
        setRecentOrders(orders.slice(0, 10));
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-wrapper">
          <LoadingSpinner text="Loading dashboard..." />
        </div>
      </>
    );
  }

  const statCards = [
    { icon: '📦', label: 'Total Orders', value: stats.totalOrders, color: 'var(--color-info)' },
    { icon: '💰', label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: 'var(--color-success)' },
    { icon: '⚠️', label: 'Low Stock Items', value: stats.lowStockItems, color: 'var(--color-warning)' },
    { icon: '🕐', label: 'Pending Orders', value: stats.pendingOrders, color: 'var(--color-primary)' },
  ];

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container">
          <h1 style={{ marginBottom: 'var(--space-xl)' }}>Admin Dashboard 🎛️</h1>

          {/* Stat Cards */}
          <div className="grid-4" style={{ marginBottom: 'var(--space-2xl)' }}>
            {statCards.map((stat, i) => (
              <div
                key={i}
                className="stat-card animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="stat-card-icon">{stat.icon}</div>
                <div className="stat-card-value" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="stat-card-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="grid-2" style={{ marginBottom: 'var(--space-2xl)' }}>
            <div
              className="glass-card"
              style={{ cursor: 'pointer', textAlign: 'center' }}
              onClick={() => navigate('/admin/inventory')}
            >
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 8 }}>📋</span>
              <h3>Manage Inventory</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: 4 }}>
                Track stock levels, add items, set thresholds
              </p>
            </div>
            <div
              className="glass-card"
              style={{ cursor: 'pointer', textAlign: 'center' }}
              onClick={() => navigate('/admin/orders')}
            >
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 8 }}>🚀</span>
              <h3>Manage Orders</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: 4 }}>
                Update statuses, track deliveries, view payments
              </p>
            </div>
          </div>

          {/* Recent Orders */}
          <h2 className="section-title">📋 Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3 className="empty-state-title">No orders yet</h3>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="order-id" style={{ fontSize: '0.85rem' }}>
                        #{order._id?.slice(-8).toUpperCase()}
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        ₹{order.totalAmount || order.amount || 0}
                      </td>
                      <td>
                        <span className={`status-badge ${order.paymentStatus === 'paid' ? 'status-paid' : 'status-unpaid'}`}>
                          {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        <OrderStatusBadge status={order.orderStatus || 'Order Received'} />
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

export default AdminDashboard;
