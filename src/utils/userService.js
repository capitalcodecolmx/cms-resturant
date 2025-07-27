import supabase from './supabase';

class UserService {
  // Get user addresses
  async getUserAddresses(userId) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

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
      return { success: false, error: 'Failed to load addresses' };
    }
  }

  // Add new address
  async addAddress(userId, addressData) {
    try {
      // If this is set as default, update other addresses first
      if (addressData.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          user_id: userId,
          label: addressData.label,
          address_line1: addressData.addressLine1,
          address_line2: addressData.addressLine2 || null,
          city: addressData.city,
          state: addressData.state,
          zip_code: addressData.zipCode,
          is_default: addressData.isDefault || false,
          delivery_instructions: addressData.deliveryInstructions || null
        })
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
      return { success: false, error: 'Failed to add address' };
    }
  }

  // Update address
  async updateAddress(addressId, addressData) {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .update({
          label: addressData.label,
          address_line1: addressData.addressLine1,
          address_line2: addressData.addressLine2 || null,
          city: addressData.city,
          state: addressData.state,
          zip_code: addressData.zipCode,
          is_default: addressData.isDefault || false,
          delivery_instructions: addressData.deliveryInstructions || null
        })
        .eq('id', addressId)
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
      return { success: false, error: 'Failed to update address' };
    }
  }

  // Delete address
  async deleteAddress(addressId) {
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to delete address' };
    }
  }

  // Get user payment methods
  async getUserPaymentMethods(userId) {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

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
      return { success: false, error: 'Failed to load payment methods' };
    }
  }

  // Add payment method
  async addPaymentMethod(userId, paymentMethodData) {
    try {
      // If this is set as default, update other payment methods first
      if (paymentMethodData.isDefault) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', userId);
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .insert({
          user_id: userId,
          type: paymentMethodData.type,
          last_four: paymentMethodData.lastFour,
          card_brand: paymentMethodData.cardBrand,
          expiry_month: paymentMethodData.expiryMonth,
          expiry_year: paymentMethodData.expiryYear,
          stripe_payment_method_id: paymentMethodData.stripePaymentMethodId,
          is_default: paymentMethodData.isDefault || false
        })
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
      return { success: false, error: 'Failed to add payment method' };
    }
  }

  // Delete payment method
  async deletePaymentMethod(paymentMethodId) {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError') ||
          error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      return { success: false, error: 'Failed to delete payment method' };
    }
  }

  // Update loyalty points
  async updateLoyaltyPoints(userId, pointsChange, description) {
    try {
      const { data: currentProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('loyalty_points')
        .eq('id', userId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      const newPoints = Math.max(0, (currentProfile.loyalty_points || 0) + pointsChange);
      
      // Update tier based on points
      let newTier = 'Bronze';
      if (newPoints >= 5000) newTier = 'Platinum';
      else if (newPoints >= 2500) newTier = 'Gold';
      else if (newPoints >= 1000) newTier = 'Silver';

      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          loyalty_points: newPoints,
          loyalty_tier: newTier
        })
        .eq('id', userId)
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
      return { success: false, error: 'Failed to update loyalty points' };
    }
  }

  // Get loyalty rewards
  async getLoyaltyRewards() {
    try {
      const { data, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required');

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
      return { success: false, error: 'Failed to load loyalty rewards' };
    }
  }
}

export default new UserService();