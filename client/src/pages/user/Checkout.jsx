import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useToast } from '../../components/Toast';
import api from '../../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [orderData, setOrderData] = useState(null);
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('pizzaOrder');
    if (!data) {
      navigate('/build-pizza');
      return;
    }
    setOrderData(JSON.parse(data));
  }, [navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!address.trim()) {
      toast.error('Please enter your delivery address.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on backend
      const { data } = await api.post('/payment/create-order', {
        amount: orderData.total,
        items: orderData.items,
        deliveryAddress: address,
      });

      // 2. Load Razorpay
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setIsProcessing(false);
        return;
      }

      // 3. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency || 'INR',
        name: 'PizzaCraft',
        description: 'Custom Pizza Order',
        order_id: data.order.id,
        handler: async (response) => {
          try {
            // 4. Verify payment on backend
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            setPaymentSuccess(true);
            sessionStorage.removeItem('pizzaOrder');
            toast.success('Payment successful! 🎉');

            setTimeout(() => {
              navigate('/my-orders');
            }, 3000);
          } catch (err) {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        prefill: {},
        theme: {
          color: '#E8590C',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  if (paymentSuccess) {
    return (
      <>
        <Navbar />
        <div className="page-wrapper">
          <div className="container" style={{ maxWidth: 600 }}>
            <div className="success-screen">
              <div className="success-icon">🎉</div>
              <h1 className="success-title">Order Placed!</h1>
              <p className="success-text">
                Your pizza is being prepared with love. You'll be redirected to your orders shortly.
              </p>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/my-orders')}>
                View My Orders
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!orderData) return null;

  return (
    <>
      <Navbar />
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 600 }}>
          <h1 style={{ marginBottom: 'var(--space-xl)' }}>Checkout 💳</h1>

          {/* Order Summary */}
          <div className="checkout-summary" style={{ marginBottom: 'var(--space-xl)' }}>
            <h3 style={{ marginBottom: 'var(--space-md)' }}>Order Summary</h3>

            {orderData.items.base && (
              <div className="checkout-item">
                <span>{orderData.items.base.emoji} {orderData.items.base.name} (Base)</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{orderData.items.base.price}</span>
              </div>
            )}
            {orderData.items.sauce && (
              <div className="checkout-item">
                <span>{orderData.items.sauce.emoji} {orderData.items.sauce.name} (Sauce)</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{orderData.items.sauce.price}</span>
              </div>
            )}
            {orderData.items.cheese && (
              <div className="checkout-item">
                <span>{orderData.items.cheese.emoji} {orderData.items.cheese.name} (Cheese)</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{orderData.items.cheese.price}</span>
              </div>
            )}
            {orderData.items.veggies?.map((v) => (
              <div className="checkout-item" key={v.name}>
                <span>{v.emoji} {v.name}</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{v.price}</span>
              </div>
            ))}
            {orderData.items.meats?.map((m) => (
              <div className="checkout-item" key={m.name}>
                <span>{m.emoji} {m.name}</span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>₹{m.price}</span>
              </div>
            ))}

            <div className="checkout-total">
              <span>Total</span>
              <span className="price">₹{orderData.total}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="form-group">
            <label className="form-label">Delivery Address 📍</label>
            <textarea
              className="form-textarea"
              placeholder="Enter your complete delivery address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>

          {/* Pay Button */}
          <button
            className="btn btn-primary btn-block btn-lg"
            onClick={handlePayment}
            disabled={isProcessing}
            style={{ marginTop: 'var(--space-lg)' }}
          >
            {isProcessing ? '🔄 Processing...' : `💳 Pay ₹${orderData.total} with Razorpay`}
          </button>

          <p style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.8rem',
            marginTop: 'var(--space-md)',
          }}>
            Secured by Razorpay • 256-bit SSL encryption
          </p>
        </div>
      </div>
    </>
  );
};

export default Checkout;
