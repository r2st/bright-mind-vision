/**
 * Widget Service
 * Generates structured widget data for rich chat displays
 * Supports: Cart, Order Status, Transaction History, Product Details, etc.
 */

class WidgetService {
  constructor() {
    this.widgetTypes = {
      CART: 'cart',
      ORDER_STATUS: 'order_status',
      ORDER_HISTORY: 'order_history',
      TRANSACTION_HISTORY: 'transaction_history',
      PRODUCT_DETAILS: 'product_details',
      PRODUCT_COMPARISON: 'product_comparison',
      WISHLIST: 'wishlist',
      INVENTORY_STATUS: 'inventory_status',
      PRICE_BREAKDOWN: 'price_breakdown'
    };
  }

  /**
   * Generate Cart Widget
   */
  generateCartWidget(cartData) {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
      return {
        type: this.widgetTypes.CART,
        data: {
          empty: true,
          message: 'Your cart is empty',
          totalItems: 0,
          totalAmount: 0,
          currency: 'AED'
        }
      };
    }

    const items = cartData.items.map(item => {
      // Extract numeric price value - handle both object and number formats
      let priceValue = 0;
      if (typeof item.price === 'object' && item.price !== null) {
        priceValue = item.price.amount || item.price.value || 0;
      } else if (typeof item.price === 'number') {
        priceValue = item.price;
      } else if (item.unit_price) {
        if (typeof item.unit_price === 'object' && item.unit_price !== null) {
          priceValue = item.unit_price.amount || item.unit_price.value || 0;
        } else {
          priceValue = item.unit_price;
        }
      }
      
      const quantity = item.quantity || 1;
      const subtotal = quantity * priceValue;
      
      // Extract currency from price object or use item currency
      let currency = item.currency || 'AED';
      if (typeof item.price === 'object' && item.price !== null && item.price.currency) {
        currency = item.price.currency;
      }
      
      return {
        sku: item.sku,
        title: item.product_name || item.title || 'Unknown Product',
        quantity: quantity,
        price: priceValue,
        currency: currency,
        image: item.image || '🛍️',
        subtotal: subtotal
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    return {
      type: this.widgetTypes.CART,
      data: {
        empty: false,
        items: items,
        summary: {
          totalItems: totalItems,
          subtotal: totalAmount,
          shipping: cartData.shipping_cost || 0,
          tax: cartData.tax || 0,
          total: totalAmount + (cartData.shipping_cost || 0) + (cartData.tax || 0),
          currency: cartData.currency || 'AED'
        },
        actions: ['checkout', 'continue_shopping', 'clear_cart']
      }
    };
  }

  /**
   * Generate Order Status Widget
   */
  generateOrderStatusWidget(orderData) {
    if (!orderData) {
      return null;
    }

    const statusMap = {
      'pending': { label: 'Pending', color: 'yellow', icon: '⏳' },
      'confirmed': { label: 'Confirmed', color: 'blue', icon: '✅' },
      'processing': { label: 'Processing', color: 'blue', icon: '🔄' },
      'shipped': { label: 'Shipped', color: 'purple', icon: '📦' },
      'delivered': { label: 'Delivered', color: 'green', icon: '🎉' },
      'cancelled': { label: 'Cancelled', color: 'red', icon: '❌' },
      'refunded': { label: 'Refunded', color: 'gray', icon: '💰' }
    };

    const status = orderData.status || 'pending';
    const statusInfo = statusMap[status.toLowerCase()] || statusMap['pending'];

    return {
      type: this.widgetTypes.ORDER_STATUS,
      data: {
        orderId: orderData.order_id || orderData.id,
        orderNumber: orderData.order_number || orderData.order_id,
        status: status,
        statusLabel: statusInfo.label,
        statusIcon: statusInfo.icon,
        statusColor: statusInfo.color,
        orderDate: orderData.created_at || orderData.order_date,
        estimatedDelivery: orderData.estimated_delivery || orderData.delivery_date,
        items: (orderData.items || []).map(item => ({
          sku: item.sku,
          title: item.product_name || item.title,
          quantity: item.quantity,
          price: item.price || item.unit_price,
          currency: item.currency || 'AED'
        })),
        shipping: {
          address: orderData.shipping_address,
          method: orderData.shipping_method,
          trackingNumber: orderData.tracking_number,
          carrier: orderData.carrier
        },
        payment: {
          method: orderData.payment_method,
          amount: orderData.total_amount || orderData.total,
          currency: orderData.currency || 'AED',
          status: orderData.payment_status
        },
        actions: ['track_order', 'view_details', 'cancel_order', 'contact_support']
      }
    };
  }

  /**
   * Generate Order History Widget
   */
  generateOrderHistoryWidget(orders) {
    if (!orders || orders.length === 0) {
      return {
        type: this.widgetTypes.ORDER_HISTORY,
        data: {
          empty: true,
          message: 'No orders found',
          orders: []
        }
      };
    }

    const formattedOrders = orders.map(order => {
      const statusMap = {
        'pending': '⏳',
        'confirmed': '✅',
        'processing': '🔄',
        'shipped': '📦',
        'delivered': '🎉',
        'cancelled': '❌',
        'refunded': '💰'
      };

      return {
        orderId: order.order_id || order.id,
        orderNumber: order.order_number || order.order_id,
        date: order.created_at || order.order_date,
        status: order.status || 'pending',
        statusIcon: statusMap[order.status?.toLowerCase()] || '⏳',
        totalAmount: order.total_amount || order.total || 0,
        currency: order.currency || 'AED',
        itemCount: order.items?.length || 0,
        items: (order.items || []).slice(0, 3).map(item => ({
          title: item.product_name || item.title,
          quantity: item.quantity
        }))
      };
    });

    return {
      type: this.widgetTypes.ORDER_HISTORY,
      data: {
        empty: false,
        orders: formattedOrders,
        totalOrders: formattedOrders.length,
        actions: ['view_all_orders', 'filter_orders', 'export_history']
      }
    };
  }

  /**
   * Generate Transaction History Widget
   */
  generateTransactionHistoryWidget(transactions) {
    if (!transactions || transactions.length === 0) {
      return {
        type: this.widgetTypes.TRANSACTION_HISTORY,
        data: {
          empty: true,
          message: 'No transactions found',
          transactions: []
        }
      };
    }

    const formattedTransactions = transactions.map(txn => {
      const typeMap = {
        'purchase': { icon: '💳', label: 'Purchase' },
        'refund': { icon: '💰', label: 'Refund' },
        'payment': { icon: '💵', label: 'Payment' },
        'credit': { icon: '➕', label: 'Credit' },
        'debit': { icon: '➖', label: 'Debit' }
      };

      const typeInfo = typeMap[txn.type?.toLowerCase()] || { icon: '💳', label: 'Transaction' };

      return {
        transactionId: txn.transaction_id || txn.id,
        date: txn.date || txn.created_at,
        type: txn.type || 'purchase',
        typeIcon: typeInfo.icon,
        typeLabel: typeInfo.label,
        amount: txn.amount || 0,
        currency: txn.currency || 'AED',
        status: txn.status || 'completed',
        description: txn.description || txn.notes,
        orderId: txn.order_id,
        paymentMethod: txn.payment_method
      };
    });

    const totalAmount = formattedTransactions.reduce((sum, txn) => {
      const amount = txn.type === 'refund' || txn.type === 'credit' ? -txn.amount : txn.amount;
      return sum + amount;
    }, 0);

    return {
      type: this.widgetTypes.TRANSACTION_HISTORY,
      data: {
        empty: false,
        transactions: formattedTransactions,
        summary: {
          totalTransactions: formattedTransactions.length,
          totalAmount: totalAmount,
          currency: transactions[0]?.currency || 'AED'
        },
        actions: ['filter_transactions', 'export_statement', 'view_details']
      }
    };
  }

  /**
   * Generate Product Details Widget
   */
  generateProductDetailsWidget(productData) {
    if (!productData) {
      return null;
    }

    const price = typeof productData.price === 'object' 
      ? productData.price 
      : { amount: productData.price || 0, currency: productData.currency || 'AED' };

    return {
      type: this.widgetTypes.PRODUCT_DETAILS,
      data: {
        sku: productData.sku,
        title: productData.title,
        brand: productData.brand,
        price: price,
        rating: productData.rating,
        reviews: productData.reviews,
        description: productData.description || productData.comprehensiveDetails,
        features: productData.features || [],
        attributes: productData.attributes || {},
        images: productData.images || [],
        inStock: productData.in_stock !== false,
        stockQuantity: productData.stock_quantity,
        badges: productData.badges || [],
        actions: ['add_to_cart', 'add_to_wishlist', 'compare', 'share']
      }
    };
  }

  /**
   * Generate Product Comparison Widget
   */
  generateProductComparisonWidget(products) {
    if (!products || products.length < 2) {
      return null;
    }

    const comparisonData = products.map(product => ({
      sku: product.sku,
      title: product.title,
      brand: product.brand,
      price: typeof product.price === 'object' 
        ? product.price 
        : { amount: product.price || 0, currency: product.currency || 'AED' },
      rating: product.rating,
      features: product.features || [],
      attributes: product.attributes || {},
      pros: product.pros || [],
      cons: product.cons || []
    }));

    return {
      type: this.widgetTypes.PRODUCT_COMPARISON,
      data: {
        products: comparisonData,
        comparisonPoints: this.extractComparisonPoints(comparisonData),
        actions: ['add_to_cart', 'view_details', 'select_product']
      }
    };
  }

  extractComparisonPoints(products) {
    const points = [];
    
    // Price comparison
    const prices = products.map(p => p.price.amount);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice !== maxPrice) {
      points.push({
        attribute: 'Price',
        values: products.map(p => `${p.price.amount} ${p.price.currency}`),
        bestValue: prices.indexOf(minPrice)
      });
    }

    // Rating comparison
    const ratings = products.map(p => p.rating || 0);
    const maxRating = Math.max(...ratings);
    if (maxRating > 0) {
      points.push({
        attribute: 'Rating',
        values: products.map(p => `${p.rating || 0}/5`),
        bestValue: ratings.indexOf(maxRating)
      });
    }

    return points;
  }

  /**
   * Generate Wishlist Widget
   */
  generateWishlistWidget(wishlistData) {
    if (!wishlistData || !wishlistData.items || wishlistData.items.length === 0) {
      return {
        type: this.widgetTypes.WISHLIST,
        data: {
          empty: true,
          message: 'Your wishlist is empty',
          items: []
        }
      };
    }

    const items = wishlistData.items.map(item => ({
      sku: item.sku,
      title: item.product_name || item.title,
      price: item.price || item.unit_price,
      currency: item.currency || 'AED',
      image: item.image || '🛍️',
      addedDate: item.added_at || item.created_at,
      inStock: item.in_stock !== false
    }));

    return {
      type: this.widgetTypes.WISHLIST,
      data: {
        empty: false,
        items: items,
        totalItems: items.length,
        actions: ['add_to_cart', 'remove_item', 'share_wishlist']
      }
    };
  }

  /**
   * Generate Inventory Status Widget
   */
  generateInventoryStatusWidget(inventoryData) {
    if (!inventoryData) {
      return null;
    }

    return {
      type: this.widgetTypes.INVENTORY_STATUS,
      data: {
        sku: inventoryData.sku,
        productName: inventoryData.product_name,
        inStock: inventoryData.in_stock,
        availableQuantity: inventoryData.available_quantity || 0,
        totalQuantity: inventoryData.stock_level || inventoryData.quantity || 0,
        reservedQuantity: inventoryData.reserved_quantity || 0,
        location: inventoryData.location,
        lastUpdated: inventoryData.updated_at,
        status: inventoryData.in_stock ? 'in_stock' : 'out_of_stock',
        actions: ['notify_when_available', 'view_alternatives']
      }
    };
  }

  /**
   * Generate Price Breakdown Widget
   */
  generatePriceBreakdownWidget(priceData) {
    if (!priceData) {
      return null;
    }

    return {
      type: this.widgetTypes.PRICE_BREAKDOWN,
      data: {
        subtotal: priceData.subtotal || 0,
        shipping: priceData.shipping || 0,
        tax: priceData.tax || 0,
        discount: priceData.discount || 0,
        total: priceData.total || 0,
        currency: priceData.currency || 'AED',
        breakdown: [
          { label: 'Subtotal', amount: priceData.subtotal || 0 },
          { label: 'Shipping', amount: priceData.shipping || 0 },
          { label: 'Tax', amount: priceData.tax || 0 },
          ...(priceData.discount > 0 ? [{ label: 'Discount', amount: -priceData.discount }] : []),
          { label: 'Total', amount: priceData.total || 0, isTotal: true }
        ]
      }
    };
  }

  /**
   * Main method to generate widgets based on intent and data
   */
  generateWidgets(state) {
    const widgets = [];

    // Cart widget
    if (state.cartResult && state.cartResult.cart) {
      console.log('[WidgetService] Generating cart widget from cartResult:', {
        hasCart: !!state.cartResult.cart,
        itemsCount: state.cartResult.cart.items?.length || 0
      });
      const cartWidget = this.generateCartWidget(state.cartResult.cart);
      if (cartWidget) widgets.push(cartWidget);
    } else if (state.currentIntent === 'cart_operation' || state.currentIntent === 'order_history') {
      // If intent is cart-related but cartResult is missing, generate empty cart widget
      // This handles cases where the cart query was detected but cartResult wasn't set
      const query = (state.query || '').toLowerCase();
      const cartKeywords = ['cart', 'basket', 'bag'];
      const cartActionKeywords = ['show', 'view', 'see', 'display', 'my'];
      const hasCartKeyword = cartKeywords.some(kw => query.includes(kw));
      const hasCartAction = cartActionKeywords.some(kw => query.includes(kw));
      
      if (hasCartKeyword && hasCartAction) {
        console.log('[WidgetService] Generating empty cart widget for cart query without cartResult');
        const emptyCartWidget = this.generateCartWidget({ items: [], total: 0, currency: 'AED' });
        if (emptyCartWidget) widgets.push(emptyCartWidget);
      }
    }

    // Order status widget
    if (state.orderResult && state.orderResult.order) {
      const orderWidget = this.generateOrderStatusWidget(state.orderResult.order);
      if (orderWidget) widgets.push(orderWidget);
    }

    // Order history widget
    if (state.orderResult && state.orderResult.orders) {
      const historyWidget = this.generateOrderHistoryWidget(state.orderResult.orders);
      if (historyWidget) widgets.push(historyWidget);
    }

    // Transaction history widget
    if (state.transactionResult && state.transactionResult.transactions) {
      const transactionWidget = this.generateTransactionHistoryWidget(state.transactionResult.transactions);
      if (transactionWidget) widgets.push(transactionWidget);
    }

    // Product details widget
    if (state.productDetailsResult && state.productDetailsResult.product) {
      const productWidget = this.generateProductDetailsWidget(state.productDetailsResult.product);
      if (productWidget) widgets.push(productWidget);
    }

    // Product comparison widget
    if (state.comparisonResult && state.comparisonResult.products) {
      const comparisonWidget = this.generateProductComparisonWidget(state.comparisonResult.products);
      if (comparisonWidget) widgets.push(comparisonWidget);
    }

    // Wishlist widget
    if (state.wishlistResult && state.wishlistResult.wishlist) {
      const wishlistWidget = this.generateWishlistWidget(state.wishlistResult.wishlist);
      if (wishlistWidget) widgets.push(wishlistWidget);
    }

    // Inventory status widget
    if (state.inventoryResult) {
      const inventoryWidget = this.generateInventoryStatusWidget(state.inventoryResult);
      if (inventoryWidget) widgets.push(inventoryWidget);
    }

    return widgets;
  }
}

export const widgetService = new WidgetService();

