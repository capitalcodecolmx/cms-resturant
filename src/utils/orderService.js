import supabase from './supabase';

class OrderService {
  // Create a new order
  async createOrder(orderData) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.userId,
          restaurant_id: orderData.restaurantId,
          address_id: orderData.addressId,
          order_number: `ORD-${Date.now()}`,
          status: 'pending',
          order_type: orderData.orderType,
          subtotal: orderData.subtotal,
          tax_amount: orderData.taxAmount,
          delivery_fee: orderData.deliveryFee,
          discount_amount: orderData.discountAmount || 0,
          points_discount: orderData.pointsDiscount || 0,
          total_amount: orderData.totalAmount,
          payment_status: 'pending',
          payment_method_id: orderData.paymentMethodId,
          promo_code: orderData.promoCode,
          special_instructions: orderData.specialInstructions,
          estimated_prep_time: orderData.estimatedPrepTime,
          scheduled_time: orderData.scheduledTime
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Create order items
      if (orderData.items && orderData.items.length > 0) {
        const orderItems = orderData.items.map(item => ({
          order_id: data.id,
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity,
          customizations: item.customizations || [],
          special_instructions: item.specialInstructions || ''
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          return { success: false, error: itemsError.message };
        }
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to create order' };
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status, additionalData = {}) {
    try {
      const updateData = { status, ...additionalData };

      if (status === 'preparing') {
        updateData.prepared_at = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancellation_reason = additionalData.cancellationReason;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to update order status' };
    }
  }

  // Get user orders
  async getUserOrders(userId, options = {}) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurants(name, phone),
          address:addresses(label, address_line1, city, state),
          order_items(
            *,
            menu_item:menu_items(name, image_url, price)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.status) {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load orders' };
    }
  }

  // Get single order with details
  async getOrder(orderId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          restaurant:restaurants(name, phone, address),
          address:addresses(label, address_line1, address_line2, city, state, zip_code),
          order_items(
            *,
            menu_item:menu_items(name, image_url, price, description)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load order' };
    }
  }

  // Get orders for kitchen display
  async getKitchenOrders(restaurantId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            menu_item:menu_items(name, prep_time)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .in('status', ['confirmed', 'preparing', 'ready'])
        .order('created_at');

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to load kitchen orders' };
    }
  }

  // Update payment status
  async updatePaymentStatus(orderId, paymentStatus, paymentIntentId = null) {
    try {
      const updateData = { payment_status: paymentStatus };
      
      if (paymentIntentId) {
        updateData.stripe_payment_intent_id = paymentIntentId;
      }

      if (paymentStatus === 'completed') {
        updateData.status = 'confirmed';
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to update payment status' };
    }
  }

  // Subscribe to order status changes
  subscribeToOrderUpdates(orderId, callback) {
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`
      }, callback)
      .subscribe();

    return subscription;
  }

  // Unsubscribe from order updates
  unsubscribeFromOrderUpdates(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }
}

export default new OrderService();