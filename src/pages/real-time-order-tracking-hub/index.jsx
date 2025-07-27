import React, { useState, useEffect, useCallback } from 'react';
        import { Link } from 'react-router-dom';
        import CustomerNavigation from 'components/ui/CustomerNavigation';
        import Icon from 'components/AppIcon';
        import { useAuth } from 'contexts/AuthContext';
        import orderService from 'utils/orderService';

        // Components
        import MultiOrderTimeline from './components/MultiOrderTimeline';
        import EnhancedOrderCard from './components/EnhancedOrderCard';
        import LiveKitchenUpdate from './components/LiveKitchenUpdate';
        import PredictiveDeliveryMap from './components/PredictiveDeliveryMap';
        import NotificationCenter from './components/NotificationCenter';
        import OrderSharingPanel from './components/OrderSharingPanel';
        import TemperatureMonitor from './components/TemperatureMonitor';
        import LoyaltyPointsTracker from './components/LoyaltyPointsTracker';

        function RealTimeOrderTrackingHub() {
          const { user, userProfile } = useAuth();
          const [activeOrders, setActiveOrders] = useState([]);
          const [selectedOrderId, setSelectedOrderId] = useState(null);
          const [isLoading, setIsLoading] = useState(true);
          const [error, setError] = useState(null);
          const [notifications, setNotifications] = useState([]);
          const [isOffline, setIsOffline] = useState(!navigator.onLine);
          const [cachedData, setCachedData] = useState({});
          const [wsConnected, setWsConnected] = useState(false);
          const [loyaltyPoints, setLoyaltyPoints] = useState(0);

          // Mock data for enhanced features
          const [mockOrders] = useState([
            {
              id: "ORD-2024-001234",
              restaurant: {
                name: "TasteBite Downtown",
                phone: "+1 (555) 123-4567",
                address: "123 Main Street, Downtown, NY 10001",
                kitchenLoad: 85,
                avgPrepTime: 18
              },
              status: "preparing",
              orderTime: new Date(Date.now() - 1800000),
              estimatedDelivery: new Date(Date.now() + 1200000),
              type: "delivery",
              items: [
                {
                  id: 1,
                  name: "Margherita Pizza",
                  quantity: 1,
                  price: 18.99,
                  prepTime: 15,
                  temperature: 165,
                  station: "Pizza Station"
                }
              ],
              total: 25.98,
              driver: {
                name: "Mike Rodriguez",
                location: { lat: 40.7589, lng: -73.9851 },
                eta: new Date(Date.now() + 900000)
              },
              timeline: [
                {
                  status: "confirmed",
                  timestamp: new Date(Date.now() - 1800000),
                  title: "Order Confirmed"
                },
                {
                  status: "preparing",
                  timestamp: new Date(Date.now() - 1200000),
                  title: "Kitchen Started",
                  liveUpdate: "Pizza dough being prepared"
                }
              ],
              modifications: [],
              canModify: true,
              loyaltyPointsEarned: 26
            },
            {
              id: "ORD-2024-001235",
              restaurant: {
                name: "Burger Palace",
                phone: "+1 (555) 234-5678",
                address: "456 Oak Street, Downtown, NY 10002",
                kitchenLoad: 65,
                avgPrepTime: 12
              },
              status: "out_for_delivery",
              orderTime: new Date(Date.now() - 3600000),
              estimatedDelivery: new Date(Date.now() + 600000),
              type: "delivery",
              items: [
                {
                  id: 2,
                  name: "Classic Burger",
                  quantity: 2,
                  price: 14.99,
                  temperature: 155,
                  station: "Grill Station"
                }
              ],
              total: 32.98,
              driver: {
                name: "Sarah Chen",
                location: { lat: 40.7505, lng: -73.9934 },
                eta: new Date(Date.now() + 600000)
              },
              timeline: [
                {
                  status: "confirmed",
                  timestamp: new Date(Date.now() - 3600000),
                  title: "Order Confirmed"
                },
                {
                  status: "preparing",
                  timestamp: new Date(Date.now() - 3000000),
                  title: "Kitchen Started"
                },
                {
                  status: "ready",
                  timestamp: new Date(Date.now() - 1800000),
                  title: "Ready for Pickup"
                },
                {
                  status: "out_for_delivery",
                  timestamp: new Date(Date.now() - 1200000),
                  title: "Out for Delivery"
                }
              ],
              modifications: [],
              canModify: false,
              loyaltyPointsEarned: 33
            }
          ]);

          // WebSocket connection simulation
          useEffect(() => {
            let wsInterval;
            
            const simulateWebSocketConnection = () => {
              setWsConnected(true);
              
              wsInterval = setInterval(() => {
                if (Math.random() > 0.8) {
                  const randomUpdate = {
                    id: Date.now(),
                    type: 'status_update',
                    orderId: mockOrders[0]?.id,
                    message: 'Your pizza is now in the oven',
                    timestamp: new Date(),
                    priority: 'info'
                  };
                  
                  setNotifications(prev => [randomUpdate, ...prev.slice(0, 4)]);
                }
              }, 10000);
            };

            const timeout = setTimeout(simulateWebSocketConnection, 2000);

            return () => {
              clearTimeout(timeout);
              if (wsInterval) clearInterval(wsInterval);
              setWsConnected(false);
            };
          }, [mockOrders]);

          // Online/Offline detection
          useEffect(() => {
            const handleOnline = () => {
              setIsOffline(false);
              loadOrders();
            };
            
            const handleOffline = () => {
              setIsOffline(true);
            };

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            return () => {
              window.removeEventListener('online', handleOnline);
              window.removeEventListener('offline', handleOffline);
            };
          }, []);

          // Load orders function
          const loadOrders = useCallback(async () => {
            if (!user?.id) return;

            try {
              setIsLoading(true);
              setError(null);

              if (isOffline && cachedData.orders) {
                setActiveOrders(cachedData.orders);
                setIsLoading(false);
                return;
              }

              const result = await orderService.getUserOrders(user.id, {
                status: ['confirmed', 'preparing', 'ready', 'out_for_delivery']
              });

              if (result?.success) {
                const orders = result.data || [];
                setActiveOrders(orders);
                setCachedData(prev => ({ ...prev, orders }));
                
                if (orders.length > 0 && !selectedOrderId) {
                  setSelectedOrderId(orders[0].id);
                }
              } else {
                // Use mock data for demo
                setActiveOrders(mockOrders);
                if (!selectedOrderId) {
                  setSelectedOrderId(mockOrders[0]?.id);
                }
              }
            } catch (error) {
              // Use mock data as fallback
              setActiveOrders(mockOrders);
              if (!selectedOrderId) {
                setSelectedOrderId(mockOrders[0]?.id);
              }
            } finally {
              setIsLoading(false);
            }
          }, [user?.id, isOffline, cachedData.orders, mockOrders, selectedOrderId]);

          // Initial load
          useEffect(() => {
            loadOrders();
          }, [loadOrders]);

          // Get selected order
          const selectedOrder = activeOrders.find(order => order.id === selectedOrderId);

          // Handle order modification
          const handleModifyOrder = (orderId, modifications) => {
            setActiveOrders(prev => 
              prev.map(order => 
                order.id === orderId 
                  ? { ...order, modifications: [...order.modifications, ...modifications] }
                  : order
              )
            );

            const notification = {
              id: Date.now(),
              type: 'modification',
              orderId,
              message: 'Order modification request sent',
              timestamp: new Date(),
              priority: 'success'
            };
            
            setNotifications(prev => [notification, ...prev.slice(0, 4)]);
          };

          // Handle order sharing
          const handleShareOrder = (orderId) => {
            if (navigator.share) {
              navigator.share({
                title: `Order ${orderId}`,
                text: 'Track my order in real-time',
                url: `${window.location.origin}/real-time-order-tracking-hub?order=${orderId}`
              });
            }
          };

          // Handle feedback submission
          const handleSubmitFeedback = (orderId, feedback) => {
            const notification = {
              id: Date.now(),
              type: 'feedback',
              orderId,
              message: 'Thank you for your feedback!',
              timestamp: new Date(),
              priority: 'success'
            };
            
            setNotifications(prev => [notification, ...prev.slice(0, 4)]);
            
            // Update loyalty points
            setLoyaltyPoints(prev => prev + 10);
          };

          if (isLoading) {
            return (
              <div className="min-h-screen bg-background">
                <CustomerNavigation />
                <div className="pt-16 flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary font-body">Loading your orders...</p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="min-h-screen bg-background">
              <CustomerNavigation />
              
              <div className="pt-16">
                {/* Header with Connection Status */}
                <div className="bg-surface border-b border-border">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-heading font-heading-medium text-text-primary">
                          Real-time Order Hub
                        </h1>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              wsConnected ? 'bg-success animate-pulse' : 'bg-error'
                            }`}></div>
                            <span className="text-sm text-text-secondary font-body">
                              {wsConnected ? 'Connected' : 'Connecting...'}
                            </span>
                          </div>
                          {isOffline && (
                            <div className="flex items-center space-x-2">
                              <Icon name="WifiOff" size={16} className="text-warning" />
                              <span className="text-sm text-warning font-body">Offline Mode</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <NotificationCenter 
                          notifications={notifications}
                          onClearAll={() => setNotifications([])}
                        />
                        <LoyaltyPointsTracker points={loyaltyPoints + (userProfile?.loyalty_points || 0)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                {activeOrders.length === 0 ? (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Icon name="Package" size={48} className="text-text-secondary" />
                      </div>
                      <h2 className="text-2xl font-heading font-heading-medium text-text-primary mb-4">
                        No Active Orders
                      </h2>
                      <p className="text-text-secondary font-body mb-6 max-w-md mx-auto">
                        You don't have any orders in progress. Place an order to start tracking in real-time.
                      </p>
                      <Link
                        to="/menu-browse-search"
                        className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 transition-smooth font-body font-body-medium"
                      >
                        <Icon name="Plus" size={20} />
                        <span>Place New Order</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Mobile Order Tabs */}
                    <div className="lg:hidden mb-6">
                      <div className="flex space-x-2 overflow-x-auto">
                        {activeOrders.map((order) => (
                          <button
                            key={order.id}
                            onClick={() => setSelectedOrderId(order.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg font-body font-body-medium transition-smooth ${
                              selectedOrderId === order.id
                                ? 'bg-primary text-white' :'bg-surface text-text-secondary border border-border hover:border-primary'
                            }`}
                          >
                            #{order.id.slice(-6)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Left Sidebar - Order List (Desktop) */}
                      <div className="hidden lg:block">
                        <div className="space-y-4">
                          <h3 className="text-lg font-heading font-heading-medium text-text-primary">
                            Active Orders ({activeOrders.length})
                          </h3>
                          {activeOrders.map((order) => (
                            <EnhancedOrderCard
                              key={order.id}
                              order={order}
                              isSelected={selectedOrderId === order.id}
                              onClick={() => setSelectedOrderId(order.id)}
                              onShare={() => handleShareOrder(order.id)}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Main Content - Selected Order Details */}
                      <div className="lg:col-span-2">
                        {selectedOrder && (
                          <div className="space-y-6">
                            {/* Multi-Order Timeline */}
                            <MultiOrderTimeline 
                              order={selectedOrder}
                              wsConnected={wsConnected}
                            />

                            {/* Live Kitchen Updates */}
                            <LiveKitchenUpdate 
                              order={selectedOrder}
                              wsConnected={wsConnected}
                            />

                            {/* Temperature Monitoring */}
                            <TemperatureMonitor 
                              items={selectedOrder.items}
                              status={selectedOrder.status}
                            />

                            {/* Order Sharing Panel */}
                            <OrderSharingPanel 
                              order={selectedOrder}
                              onShare={() => handleShareOrder(selectedOrder.id)}
                              onFeedback={(feedback) => handleSubmitFeedback(selectedOrder.id, feedback)}
                            />
                          </div>
                        )}
                      </div>

                      {/* Right Sidebar - Map & Actions */}
                      <div className="space-y-6">
                        {selectedOrder && (
                          <>
                            {/* Predictive Delivery Map */}
                            <PredictiveDeliveryMap 
                              order={selectedOrder}
                              driver={selectedOrder.driver}
                              wsConnected={wsConnected}
                            />

                            {/* Order Actions */}
                            <div className="bg-surface rounded-xl border border-border p-6">
                              <h3 className="text-lg font-heading font-heading-medium text-text-primary mb-4">
                                Quick Actions
                              </h3>
                              <div className="space-y-3">
                                {selectedOrder.canModify && (
                                  <button
                                    onClick={() => handleModifyOrder(selectedOrder.id, [{ type: 'special_request', value: 'Extra sauce' }])}
                                    className="w-full flex items-center space-x-2 px-4 py-3 bg-accent-50 text-accent-700 rounded-lg hover:bg-accent-100 transition-smooth font-body font-body-medium"
                                  >
                                    <Icon name="Edit" size={18} />
                                    <span>Modify Order</span>
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleShareOrder(selectedOrder.id)}
                                  className="w-full flex items-center space-x-2 px-4 py-3 bg-secondary-50 text-text-secondary rounded-lg hover:bg-secondary-100 transition-smooth font-body font-body-medium"
                                >
                                  <Icon name="Share2" size={18} />
                                  <span>Share Order</span>
                                </button>

                                <a
                                  href={`tel:${selectedOrder.restaurant.phone}`}
                                  className="w-full flex items-center space-x-2 px-4 py-3 bg-primary-50 text-primary rounded-lg hover:bg-primary-100 transition-smooth font-body font-body-medium"
                                >
                                  <Icon name="Phone" size={18} />
                                  <span>Call Restaurant</span>
                                </a>

                                <Link
                                  to={`/order-tracking-status?id=${selectedOrder.id}`}
                                  className="w-full flex items-center space-x-2 px-4 py-3 bg-surface border border-border text-text-secondary rounded-lg hover:border-primary hover:text-primary transition-smooth font-body font-body-medium"
                                >
                                  <Icon name="ExternalLink" size={18} />
                                  <span>Simple View</span>
                                </Link>
                              </div>
                            </div>

                            {/* Restaurant Info */}
                            <div className="bg-surface rounded-xl border border-border p-6">
                              <h3 className="text-lg font-heading font-heading-medium text-text-primary mb-4">
                                Restaurant Status
                              </h3>
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-text-secondary font-body">Kitchen Load</span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-16 bg-secondary-200 rounded-full h-2">
                                      <div 
                                        className={`h-2 rounded-full ${
                                          selectedOrder.restaurant.kitchenLoad > 80 ? 'bg-error' :
                                          selectedOrder.restaurant.kitchenLoad > 60 ? 'bg-warning' : 'bg-success'
                                        }`}
                                        style={{ width: `${selectedOrder.restaurant.kitchenLoad}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-body font-body-medium">
                                      {selectedOrder.restaurant.kitchenLoad}%
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-text-secondary font-body">Avg Prep Time</span>
                                  <span className="text-text-primary font-body font-body-medium">
                                    {selectedOrder.restaurant.avgPrepTime} min
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }

        export default RealTimeOrderTrackingHub;