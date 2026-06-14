const statusMap = {
  'Order Received': 'status-received',
  'In the Kitchen': 'status-kitchen',
  'Sent to Delivery': 'status-delivery',
  'Delivered': 'status-delivered',
};

const OrderStatusBadge = ({ status }) => {
  const className = statusMap[status] || 'status-received';

  return (
    <span className={`status-badge ${className}`}>
      {status}
    </span>
  );
};

export default OrderStatusBadge;
