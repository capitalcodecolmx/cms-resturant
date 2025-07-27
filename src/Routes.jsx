import React, { Suspense } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";

// Lazy load page components for code splitting
const CustomerLoginRegister = React.lazy(() => import("pages/customer-login-register"));
const MenuBrowseSearch = React.lazy(() => import("pages/menu-browse-search"));
const ItemDetailCustomization = React.lazy(() => import("pages/item-detail-customization"));
const ShoppingCartCheckout = React.lazy(() => import("pages/shopping-cart-checkout"));
const OrderTrackingStatus = React.lazy(() => import("pages/order-tracking-status"));
const RealTimeOrderTrackingHub = React.lazy(() => import("pages/real-time-order-tracking-hub"));
const RestaurantAdminDashboard = React.lazy(() => import("pages/restaurant-admin-dashboard"));
const KitchenDisplaySystem = React.lazy(() => import("pages/kitchen-display-system"));
const CustomerAccountOrderHistory = React.lazy(() => import("pages/customer-account-order-history"));
const NotFound = React.lazy(() => import("pages/NotFound"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner />}>
          <RouterRoutes>
            <Route path="/customer-login-register" element={<CustomerLoginRegister />} />
            <Route path="/menu-browse-search" element={<MenuBrowseSearch />} />
            <Route path="/item-detail-customization" element={<ItemDetailCustomization />} />
            <Route path="/shopping-cart-checkout" element={<ShoppingCartCheckout />} />
            <Route path="/order-tracking-status" element={<OrderTrackingStatus />} />
            <Route path="/real-time-order-tracking-hub" element={<RealTimeOrderTrackingHub />} />
            <Route path="/restaurant-admin-dashboard" element={<RestaurantAdminDashboard />} />
            <Route path="/kitchen-display-system" element={<KitchenDisplaySystem />} />
            <Route path="/customer-account-order-history" element={<CustomerAccountOrderHistory />} />
            <Route path="/" element={<MenuBrowseSearch />} />
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;