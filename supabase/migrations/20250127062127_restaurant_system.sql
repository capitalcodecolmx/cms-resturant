-- Restaurant Management System Migration
-- Schema Analysis: Fresh project - Creating complete restaurant schema
-- Integration Type: Complete new system
-- Dependencies: None (initial migration)

-- 1. Extensions & Types
CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'kitchen_staff', 'delivery_driver');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE public.order_type AS ENUM ('delivery', 'pickup', 'dine_in');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.dietary_type AS ENUM ('vegetarian', 'vegan', 'gluten_free', 'protein_rich', 'keto', 'dairy_free');
CREATE TYPE public.allergen_type AS ENUM ('gluten', 'dairy', 'eggs', 'nuts', 'soy', 'shellfish', 'fish');
CREATE TYPE public.item_status AS ENUM ('available', 'unavailable', 'seasonal');

-- 2. Core Tables
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    role public.user_role DEFAULT 'customer'::public.user_role,
    date_of_birth DATE,
    dietary_preferences public.dietary_type[],
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'Bronze',
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    cuisine_type TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0.0,
    minimum_order DECIMAL(10,2) DEFAULT 0.0,
    delivery_radius INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    opening_time TIME,
    closing_time TIME,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    image_url TEXT,
    dietary_info public.dietary_type[],
    allergens public.allergen_type[],
    spice_level INTEGER DEFAULT 0 CHECK (spice_level >= 0 AND spice_level <= 3),
    prep_time INTEGER DEFAULT 15,
    calories INTEGER,
    status public.item_status DEFAULT 'available'::public.item_status,
    is_popular BOOLEAN DEFAULT false,
    discount_text TEXT,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    delivery_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    last_four TEXT,
    card_brand TEXT,
    expiry_month INTEGER,
    expiry_year INTEGER,
    stripe_payment_method_id TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
    order_number TEXT UNIQUE NOT NULL,
    status public.order_status DEFAULT 'pending'::public.order_status,
    order_type public.order_type NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.0,
    delivery_fee DECIMAL(10,2) DEFAULT 0.0,
    discount_amount DECIMAL(10,2) DEFAULT 0.0,
    points_discount DECIMAL(10,2) DEFAULT 0.0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status public.payment_status DEFAULT 'pending'::public.payment_status,
    payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT,
    promo_code TEXT,
    special_instructions TEXT,
    estimated_prep_time INTEGER,
    scheduled_time TIMESTAMPTZ,
    prepared_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    customizations JSONB DEFAULT '[]'::jsonb,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    minimum_order DECIMAL(10,2) DEFAULT 0.0,
    max_discount DECIMAL(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    reward_type TEXT NOT NULL,
    reward_value DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Essential Indexes
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX idx_menu_items_status ON public.menu_items(status);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX idx_payment_methods_user_id ON public.payment_methods(user_id);

-- 4. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rewards ENABLE ROW LEVEL SECURITY;

-- 5. Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
)
$$;

CREATE OR REPLACE FUNCTION public.owns_profile(profile_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = profile_uuid AND up.id = auth.uid()
)
$$;

CREATE OR REPLACE FUNCTION public.owns_address(address_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.addresses a
    WHERE a.id = address_uuid AND a.user_id = auth.uid()
)
$$;

CREATE OR REPLACE FUNCTION public.owns_payment_method(payment_method_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.payment_methods pm
    WHERE pm.id = payment_method_uuid AND pm.user_id = auth.uid()
)
$$;

CREATE OR REPLACE FUNCTION public.owns_order(order_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_uuid AND o.user_id = auth.uid()
)
$$;

CREATE OR REPLACE FUNCTION public.can_access_order_item(order_item_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE oi.id = order_item_uuid AND o.user_id = auth.uid()
)
$$;

-- Function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::public.user_role
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 6. RLS Policies
-- User profiles policies
CREATE POLICY "users_own_profile" ON public.user_profiles FOR ALL
USING (public.owns_profile(id)) WITH CHECK (public.owns_profile(id));

CREATE POLICY "admins_manage_profiles" ON public.user_profiles FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Restaurant policies (public read, admin write)
CREATE POLICY "public_read_restaurants" ON public.restaurants FOR SELECT
TO public USING (true);

CREATE POLICY "admins_manage_restaurants" ON public.restaurants FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Category policies (public read, admin write)
CREATE POLICY "public_read_categories" ON public.categories FOR SELECT
TO public USING (true);

CREATE POLICY "admins_manage_categories" ON public.categories FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Menu items policies (public read, admin write)
CREATE POLICY "public_read_menu_items" ON public.menu_items FOR SELECT
TO public USING (true);

CREATE POLICY "admins_manage_menu_items" ON public.menu_items FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Address policies
CREATE POLICY "users_manage_addresses" ON public.addresses FOR ALL
USING (public.owns_address(id)) WITH CHECK (public.owns_address(id));

-- Payment method policies
CREATE POLICY "users_manage_payment_methods" ON public.payment_methods FOR ALL
USING (public.owns_payment_method(id)) WITH CHECK (public.owns_payment_method(id));

-- Order policies
CREATE POLICY "users_manage_orders" ON public.orders FOR ALL
USING (public.owns_order(id)) WITH CHECK (public.owns_order(id));

CREATE POLICY "admins_view_all_orders" ON public.orders FOR SELECT
USING (public.is_admin());

-- Order items policies
CREATE POLICY "users_access_order_items" ON public.order_items FOR ALL
USING (public.can_access_order_item(id)) WITH CHECK (public.can_access_order_item(id));

-- Promo codes policies (public read, admin write)
CREATE POLICY "public_read_promo_codes" ON public.promo_codes FOR SELECT
TO public USING (is_active = true);

CREATE POLICY "admins_manage_promo_codes" ON public.promo_codes FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Loyalty rewards policies (public read, admin write)
CREATE POLICY "public_read_loyalty_rewards" ON public.loyalty_rewards FOR SELECT
TO public USING (is_active = true);

CREATE POLICY "admins_manage_loyalty_rewards" ON public.loyalty_rewards FOR ALL
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Mock Data
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    customer_uuid UUID := gen_random_uuid();
    restaurant_uuid UUID := gen_random_uuid();
    appetizer_category_uuid UUID := gen_random_uuid();
    main_category_uuid UUID := gen_random_uuid();
    dessert_category_uuid UUID := gen_random_uuid();
    beverage_category_uuid UUID := gen_random_uuid();
    salad_category_uuid UUID := gen_random_uuid();
    soup_category_uuid UUID := gen_random_uuid();
    customer_address_uuid UUID := gen_random_uuid();
    sample_order_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@restaurant.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"first_name": "Admin", "last_name": "User", "role": "admin"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (customer_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'customer@example.com', crypt('password123', gen_salt('bf', 10)), now(), now(), now(),
         '{"first_name": "John", "last_name": "Doe", "role": "customer"}'::jsonb, 
         '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create restaurant
    INSERT INTO public.restaurants (id, name, description, address, city, state, zip_code, phone, email, cuisine_type, rating, total_reviews, delivery_fee, minimum_order, opening_time, closing_time)
    VALUES (
        restaurant_uuid,
        'TasteBite Restaurant',
        'Premium dining experience with fresh ingredients and exceptional service',
        '123 Main Street',
        'Downtown',
        'CA',
        '12345',
        '+1 (555) 123-4567',
        'info@tastebite.com',
        'International',
        4.7,
        342,
        3.99,
        15.00,
        '09:00:00',
        '23:00:00'
    );

    -- Create categories
    INSERT INTO public.categories (id, restaurant_id, name, description, display_order)
    VALUES 
        (appetizer_category_uuid, restaurant_uuid, 'Appetizers', 'Start your meal right with our delicious appetizers', 1),
        (main_category_uuid, restaurant_uuid, 'Main Course', 'Our signature main dishes', 2),
        (dessert_category_uuid, restaurant_uuid, 'Desserts', 'Sweet endings to your perfect meal', 3),
        (beverage_category_uuid, restaurant_uuid, 'Beverages', 'Refreshing drinks and beverages', 4),
        (salad_category_uuid, restaurant_uuid, 'Salads', 'Fresh and healthy salad options', 5),
        (soup_category_uuid, restaurant_uuid, 'Soups', 'Warm and comforting soups', 6);

    -- Create menu items
    INSERT INTO public.menu_items (restaurant_id, category_id, name, description, price, original_price, image_url, dietary_info, allergens, spice_level, prep_time, calories, is_popular, discount_text, rating, review_count)
    VALUES 
        (restaurant_uuid, main_category_uuid, 'Margherita Pizza', 'Fresh mozzarella, tomato sauce, basil leaves on crispy thin crust', 18.99, 22.99, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop', ARRAY['vegetarian']::public.dietary_type[], ARRAY['gluten', 'dairy']::public.allergen_type[], 0, 15, 480, true, 'Happy Hour 20% Off', 4.8, 124),
        (restaurant_uuid, salad_category_uuid, 'Chicken Caesar Salad', 'Grilled chicken breast, romaine lettuce, parmesan, croutons with caesar dressing', 14.99, null, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop', ARRAY['protein_rich']::public.dietary_type[], ARRAY['dairy', 'eggs']::public.allergen_type[], 0, 10, 320, false, null, 4.6, 89),
        (restaurant_uuid, main_category_uuid, 'Spicy Thai Curry', 'Authentic red curry with coconut milk, vegetables, and jasmine rice', 16.99, null, 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop', ARRAY['vegan', 'gluten_free']::public.dietary_type[], ARRAY[]::public.allergen_type[], 3, 20, 420, true, null, 4.7, 156),
        (restaurant_uuid, dessert_category_uuid, 'Chocolate Lava Cake', 'Warm chocolate cake with molten center, served with vanilla ice cream', 8.99, null, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop', ARRAY['vegetarian']::public.dietary_type[], ARRAY['gluten', 'dairy', 'eggs']::public.allergen_type[], 0, 12, 560, true, null, 4.9, 203),
        (restaurant_uuid, beverage_category_uuid, 'Fresh Mango Smoothie', 'Blend of fresh mangoes, yogurt, and honey with mint garnish', 6.99, null, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop', ARRAY['vegetarian', 'gluten_free']::public.dietary_type[], ARRAY['dairy']::public.allergen_type[], 0, 5, 180, false, null, 4.4, 67),
        (restaurant_uuid, main_category_uuid, 'BBQ Bacon Burger', 'Beef patty with crispy bacon, BBQ sauce, lettuce, tomato on brioche bun', 19.99, null, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop', ARRAY['protein_rich']::public.dietary_type[], ARRAY['gluten', 'dairy']::public.allergen_type[], 1, 18, 720, true, null, 4.5, 178),
        (restaurant_uuid, soup_category_uuid, 'Tomato Basil Soup', 'Creamy tomato soup with fresh basil, served with garlic bread', 9.99, null, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop', ARRAY['vegetarian']::public.dietary_type[], ARRAY['gluten', 'dairy']::public.allergen_type[], 0, 8, 240, false, null, 4.3, 45),
        (restaurant_uuid, appetizer_category_uuid, 'Buffalo Wings', 'Crispy chicken wings tossed in spicy buffalo sauce with blue cheese dip', 12.99, null, 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=300&fit=crop', ARRAY['protein_rich']::public.dietary_type[], ARRAY['dairy']::public.allergen_type[], 2, 15, 380, true, null, 4.6, 134);

    -- Create customer address
    INSERT INTO public.addresses (id, user_id, label, address_line1, city, state, zip_code, is_default, delivery_instructions)
    VALUES (
        customer_address_uuid,
        customer_uuid,
        'Home',
        '123 Main Street, Apt 4B',
        'Downtown',
        'CA',
        '12345',
        true,
        'Ring doorbell twice'
    );

    -- Create promo codes
    INSERT INTO public.promo_codes (code, description, discount_type, discount_value, minimum_order, usage_limit)
    VALUES 
        ('SAVE10', '10% off your order', 'percentage', 10.00, 15.00, 100),
        ('WELCOME20', '20% off for new customers', 'percentage', 20.00, 25.00, 50),
        ('FREESHIP', 'Free delivery', 'fixed', 3.99, 20.00, 200);

    -- Create loyalty rewards
    INSERT INTO public.loyalty_rewards (name, description, points_required, reward_type, reward_value)
    VALUES 
        ('Free Appetizer', 'Get any appetizer free', 500, 'item', 15.00),
        ('$5 Off', 'Get $5 off your next order', 750, 'discount', 5.00),
        ('Free Dessert', 'Get any dessert free', 1000, 'item', 12.00);

    -- Create sample order
    INSERT INTO public.orders (id, user_id, restaurant_id, address_id, order_number, status, order_type, subtotal, tax_amount, delivery_fee, total_amount, payment_status, special_instructions, estimated_prep_time)
    VALUES (
        sample_order_uuid,
        customer_uuid,
        restaurant_uuid,
        customer_address_uuid,
        'ORD-' || extract(epoch from now())::text,
        'confirmed'::public.order_status,
        'delivery'::public.order_type,
        31.98,
        2.56,
        3.99,
        38.53,
        'completed'::public.payment_status,
        'Please ring doorbell',
        25
    );

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;