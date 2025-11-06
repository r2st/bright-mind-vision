import React from 'react';
import styles from './ChatWidgets.module.css';

/**
 * Cart Widget Component
 */
export function CartWidget({ data }) {
  if (data.empty) {
    return (
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <span className={styles.widgetIcon}>🛒</span>
          <h3>Your Cart</h3>
        </div>
        <div className={styles.widgetContent}>
          <p className={styles.emptyMessage}>{data.message || 'Your cart is empty'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <span className={styles.widgetIcon}>🛒</span>
        <h3>Your Cart</h3>
      </div>
      <div className={styles.widgetContent}>
        <div className={styles.cartItems}>
          {data.items.map((item, index) => (
            <div key={index} className={styles.cartItem}>
              <div className={styles.cartItemInfo}>
                <span className={styles.cartItemEmoji}>{item.image || '🛍️'}</span>
                <div className={styles.cartItemDetails}>
                  <div className={styles.cartItemTitle}>{item.title}</div>
                  <div className={styles.cartItemMeta}>
                    {item.quantity} × {typeof item.price === 'number' ? item.price.toFixed(2) : item.price || '0.00'} {item.currency}
                  </div>
                </div>
              </div>
              <div className={styles.cartItemSubtotal}>
                {item.subtotal != null ? item.subtotal.toFixed(2) : '0.00'} {item.currency}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.cartSummary}>
          <div className={styles.summaryRow}>
            <span>Subtotal:</span>
            <span>{data.summary.subtotal.toFixed(2)} {data.summary.currency}</span>
          </div>
          {data.summary.shipping > 0 && (
            <div className={styles.summaryRow}>
              <span>Shipping:</span>
              <span>{data.summary.shipping.toFixed(2)} {data.summary.currency}</span>
            </div>
          )}
          {data.summary.tax > 0 && (
            <div className={styles.summaryRow}>
              <span>Tax:</span>
              <span>{data.summary.tax.toFixed(2)} {data.summary.currency}</span>
            </div>
          )}
          <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
            <span>Total:</span>
            <span>{data.summary.total.toFixed(2)} {data.summary.currency}</span>
          </div>
        </div>
        {data.actions && data.actions.length > 0 && (
          <div className={styles.widgetActions}>
            {data.actions.map((action, index) => (
              <button key={index} className={styles.widgetButton}>
                {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Order Status Widget Component
 */
export function OrderStatusWidget({ data }) {
  if (!data) return null;

  const statusColors = {
    pending: '#f59e0b',
    confirmed: '#3b82f6',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
    refunded: '#6b7280'
  };

  const statusColor = statusColors[data.status?.toLowerCase()] || '#6b7280';

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <span className={styles.widgetIcon}>{data.statusIcon || '📦'}</span>
        <h3>Order Status</h3>
      </div>
      <div className={styles.widgetContent}>
        <div className={styles.orderInfo}>
          <div className={styles.orderInfoRow}>
            <span className={styles.orderLabel}>Order ID:</span>
            <span className={styles.orderValue}>{data.orderNumber || data.orderId}</span>
          </div>
          <div className={styles.orderInfoRow}>
            <span className={styles.orderLabel}>Status:</span>
            <span 
              className={styles.orderStatus}
              style={{ color: statusColor }}
            >
              {data.statusIcon} {data.statusLabel || data.status}
            </span>
          </div>
          {data.orderDate && (
            <div className={styles.orderInfoRow}>
              <span className={styles.orderLabel}>Order Date:</span>
              <span className={styles.orderValue}>
                {new Date(data.orderDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {data.estimatedDelivery && (
            <div className={styles.orderInfoRow}>
              <span className={styles.orderLabel}>Estimated Delivery:</span>
              <span className={styles.orderValue}>
                {new Date(data.estimatedDelivery).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
        
        {data.items && data.items.length > 0 && (
          <div className={styles.orderItems}>
            <h4>Items:</h4>
            {data.items.map((item, index) => (
              <div key={index} className={styles.orderItem}>
                <span>{item.title}</span>
                <span>{item.quantity} × {item.price} {item.currency}</span>
              </div>
            ))}
          </div>
        )}

        {data.shipping && data.shipping.trackingNumber && (
          <div className={styles.trackingInfo}>
            <div className={styles.orderInfoRow}>
              <span className={styles.orderLabel}>Tracking:</span>
              <span className={styles.orderValue}>{data.shipping.trackingNumber}</span>
            </div>
            {data.shipping.carrier && (
              <div className={styles.orderInfoRow}>
                <span className={styles.orderLabel}>Carrier:</span>
                <span className={styles.orderValue}>{data.shipping.carrier}</span>
              </div>
            )}
          </div>
        )}

        {data.payment && (
          <div className={styles.paymentInfo}>
            <div className={styles.orderInfoRow}>
              <span className={styles.orderLabel}>Total:</span>
              <span className={styles.orderValue}>
                {data.payment.amount} {data.payment.currency}
              </span>
            </div>
            <div className={styles.orderInfoRow}>
              <span className={styles.orderLabel}>Payment:</span>
              <span className={styles.orderValue}>
                {data.payment.method} ({data.payment.status})
              </span>
            </div>
          </div>
        )}

        {data.actions && data.actions.length > 0 && (
          <div className={styles.widgetActions}>
            {data.actions.map((action, index) => (
              <button key={index} className={styles.widgetButton}>
                {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Order History Widget Component
 */
export function OrderHistoryWidget({ data }) {
  if (data.empty) {
    return (
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <span className={styles.widgetIcon}>📋</span>
          <h3>Order History</h3>
        </div>
        <div className={styles.widgetContent}>
          <p className={styles.emptyMessage}>{data.message || 'No orders found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <span className={styles.widgetIcon}>📋</span>
        <h3>Order History ({data.totalOrders})</h3>
      </div>
      <div className={styles.widgetContent}>
        <div className={styles.orderHistoryList}>
          {data.orders.map((order, index) => (
            <div key={index} className={styles.orderHistoryItem}>
              <div className={styles.orderHistoryHeader}>
                <span className={styles.orderHistoryIcon}>{order.statusIcon}</span>
                <div className={styles.orderHistoryInfo}>
                  <div className={styles.orderHistoryId}>Order {order.orderNumber || order.orderId}</div>
                  <div className={styles.orderHistoryDate}>
                    {new Date(order.date).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.orderHistoryTotal}>
                  {order.totalAmount} {order.currency}
                </div>
              </div>
              {order.items && order.items.length > 0 && (
                <div className={styles.orderHistoryItems}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className={styles.orderHistoryItemDetail}>
                      {item.title} × {item.quantity}
                    </div>
                  ))}
                  {order.itemCount > order.items.length && (
                    <div className={styles.orderHistoryMore}>
                      +{order.itemCount - order.items.length} more items
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        {data.actions && data.actions.length > 0 && (
          <div className={styles.widgetActions}>
            {data.actions.map((action, index) => (
              <button key={index} className={styles.widgetButton}>
                {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Transaction History Widget Component
 */
export function TransactionHistoryWidget({ data }) {
  if (data.empty) {
    return (
      <div className={styles.widget}>
        <div className={styles.widgetHeader}>
          <span className={styles.widgetIcon}>💳</span>
          <h3>Transaction History</h3>
        </div>
        <div className={styles.widgetContent}>
          <p className={styles.emptyMessage}>{data.message || 'No transactions found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <span className={styles.widgetIcon}>💳</span>
        <h3>Transaction History</h3>
      </div>
      <div className={styles.widgetContent}>
        <div className={styles.transactionList}>
          {data.transactions.map((txn, index) => (
            <div key={index} className={styles.transactionItem}>
              <div className={styles.transactionHeader}>
                <span className={styles.transactionIcon}>{txn.typeIcon}</span>
                <div className={styles.transactionInfo}>
                  <div className={styles.transactionType}>{txn.typeLabel || txn.type}</div>
                  <div className={styles.transactionDate}>
                    {new Date(txn.date).toLocaleDateString()}
                  </div>
                </div>
                <div 
                  className={styles.transactionAmount}
                  style={{ 
                    color: (txn.type === 'refund' || txn.type === 'credit') ? '#10b981' : '#1f2937' 
                  }}
                >
                  {(txn.type === 'refund' || txn.type === 'credit') ? '+' : ''}
                  {txn.amount} {txn.currency}
                </div>
              </div>
              {txn.description && (
                <div className={styles.transactionDescription}>{txn.description}</div>
              )}
              {txn.orderId && (
                <div className={styles.transactionMeta}>
                  Order: {txn.orderId}
                </div>
              )}
            </div>
          ))}
        </div>
        {data.summary && (
          <div className={styles.transactionSummary}>
            <div className={styles.summaryRow}>
              <span>Total Transactions:</span>
              <span>{data.summary.totalTransactions}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Net Amount:</span>
              <span>{data.summary.totalAmount.toFixed(2)} {data.summary.currency}</span>
            </div>
          </div>
        )}
        {data.actions && data.actions.length > 0 && (
          <div className={styles.widgetActions}>
            {data.actions.map((action, index) => (
              <button key={index} className={styles.widgetButton}>
                {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Product Details Widget Component
 */
export function ProductDetailsWidget({ data }) {
  if (!data) return null;

  return (
    <div className={styles.widget}>
      <div className={styles.widgetHeader}>
        <span className={styles.widgetIcon}>📦</span>
        <h3>{data.title}</h3>
      </div>
      <div className={styles.widgetContent}>
        {data.brand && (
          <div className={styles.productBrand}>Brand: {data.brand}</div>
        )}
        <div className={styles.productPrice}>
          {typeof data.price === 'object' 
            ? `${data.price.amount} ${data.price.currency}`
            : data.price}
        </div>
        {data.rating && (
          <div className={styles.productRating}>
            ⭐ {data.rating}/5 {data.reviews ? `(${data.reviews} reviews)` : ''}
          </div>
        )}
        {data.description && (
          <div className={styles.productDescription}>{data.description}</div>
        )}
        {data.features && data.features.length > 0 && (
          <div className={styles.productFeatures}>
            <h4>Features:</h4>
            <ul>
              {data.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
        {data.attributes && Object.keys(data.attributes).length > 0 && (
          <div className={styles.productAttributes}>
            <h4>Details:</h4>
            {Object.entries(data.attributes).map(([key, value]) => (
              <div key={key} className={styles.attributeRow}>
                <span className={styles.attributeKey}>{key}:</span>
                <span className={styles.attributeValue}>{value}</span>
              </div>
            ))}
          </div>
        )}
        {data.actions && data.actions.length > 0 && (
          <div className={styles.widgetActions}>
            {data.actions.map((action, index) => (
              <button 
                key={index} 
                className={styles.widgetButton}
                onClick={() => {
                  if (data.onActionClick) {
                    data.onActionClick(action, data);
                  }
                }}
              >
                {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Main Widget Renderer
 */
export function ChatWidget({ widget }) {
  if (!widget || !widget.type || !widget.data) {
    return null;
  }

  switch (widget.type) {
    case 'cart':
      return <CartWidget data={widget.data} />;
    case 'order_status':
      return <OrderStatusWidget data={widget.data} />;
    case 'order_history':
      return <OrderHistoryWidget data={widget.data} />;
    case 'transaction_history':
      return <TransactionHistoryWidget data={widget.data} />;
    case 'product_details':
      return <ProductDetailsWidget data={widget.data} />;
    default:
      console.warn('Unknown widget type:', widget.type);
      return null;
  }
}

