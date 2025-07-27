import supabase from './supabase';

class MenuService {
  // Get all restaurants
  async getRestaurants() {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true)
        .order('name');

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
      return { success: false, error: 'Failed to load restaurants' };
    }
  }

  // Get categories for a restaurant
  async getCategories(restaurantId) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('display_order');

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
      return { success: false, error: 'Failed to load categories' };
    }
  }

  // Get menu items with filters
  async getMenuItems(filters = {}) {
    try {
      let query = supabase
        .from('menu_items')
        .select(`
          *,
          category:categories(name),
          restaurant:restaurants(name, id)
        `)
        .eq('status', 'available');

      // Apply filters
      if (filters.restaurantId) {
        query = query.eq('restaurant_id', filters.restaurantId);
      }

      if (filters.categoryId && filters.categoryId !== 'all') {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
      }

      if (filters.dietary && filters.dietary.length > 0) {
        query = query.overlaps('dietary_info', filters.dietary);
      }

      if (filters.excludeAllergens && filters.excludeAllergens.length > 0) {
        query = query.not('allergens', 'ov', filters.excludeAllergens);
      }

      if (filters.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.maxPrepTime) {
        query = query.lte('prep_time', filters.maxPrepTime);
      }

      if (filters.isPopular) {
        query = query.eq('is_popular', true);
      }

      const { data, error } = await query.order('name');

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
      return { success: false, error: 'Failed to load menu items' };
    }
  }

  // Get single menu item by ID
  async getMenuItem(itemId) {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:categories(name),
          restaurant:restaurants(name, id)
        `)
        .eq('id', itemId)
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
      return { success: false, error: 'Failed to load menu item' };
    }
  }

  // Get popular items
  async getPopularItems(restaurantId, limit = 8) {
    try {
      let query = supabase
        .from('menu_items')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('status', 'available')
        .eq('is_popular', true)
        .limit(limit)
        .order('rating', { ascending: false });

      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
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
      return { success: false, error: 'Failed to load popular items' };
    }
  }

  // Validate promo code
  async validatePromoCode(code) {
    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .gte('valid_until', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Invalid promo code' };
        }
        return { success: false, error: error.message };
      }

      // Check usage limit
      if (data.usage_limit && data.used_count >= data.usage_limit) {
        return { success: false, error: 'Promo code has reached usage limit' };
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
      return { success: false, error: 'Failed to validate promo code' };
    }
  }
}

export default new MenuService();