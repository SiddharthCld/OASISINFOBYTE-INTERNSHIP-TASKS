import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';
import { FiCheck } from 'react-icons/fi';

const ORDER_STATUSES = ['Order Received', 'In the Kitchen', 'Sent to Delivery', 'Delivered'];

const getStatusIndex = (status) => ORDER_STATUSES.indexOf(status);

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await api.get('/orders/my-orders');
      setOrders(data.data || data.orders || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

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
          <LoadingSpinner text="Loading your orders..." />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="flex-between mb-xl">
            <h1>My Orders 📦</h1>
            <button className="btn btn-primary" onClick={() => navigate('/build-pizza')}>
              🍕 New Pizza
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍕</div>
              <h3 className="empty-state-title">No orders yet</h3>
              <p className="empty-state-text">
                Build your first pizza and it'll appear here!
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/build-pizza')}>
                Build Your Pizza
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const statusIdx = getStatusIndex(order.orderStatus || 'Order Received');

              return (
                <div key={order._id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <div className="order-id">
                        #{order._id?.slice(-8).toUpperCase() || 'N/A'}
                      </div>
                      <div className="order-date">
                        {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`status-badge ${order.paymentStatus === 'paid' ? 'status-paid' : 'status-unpaid'}`}>
                        {order.paymentStatus === 'paid' ? '✓ Paid' : 'Unpaid'}
                      </span>
                      <OrderStatusBadge status={order.orderStatus || 'Order Received'} />
                    </div>
                  </div>

                  <div className="order-items">{getOrderItems(order)}</div>

                  <div className="order-total">₹{order.totalAmount || order.amount || 0}</div>

                  {/* Status Stepper */}
                  <div className="order-status-stepper">
                    {ORDER_STATUSES.map((status, index) => {
                      const isCompleted = index < statusIdx;
                      const isActive = index === statusIdx;

                      return (
                        <div
                          key={status}
                          className={`order-stepper-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                        >
                          <div className="order-stepper-icon">
                            {isCompleted ? <FiCheck size={14} /> : index + 1}
                          </div>
                          <div className="order-stepper-label">{status}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default MyOrders;
