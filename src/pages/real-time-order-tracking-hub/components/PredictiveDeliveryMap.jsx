import React, { useState, useEffect } from 'react';
        import Icon from 'components/AppIcon';

        function PredictiveDeliveryMap({ order, driver, wsConnected }) {
          const [driverLocation, setDriverLocation] = useState(driver?.location || { lat: 40.7589, lng: -73.9851 });
          const [trafficLevel, setTrafficLevel] = useState('moderate');
          const [estimatedArrival, setEstimatedArrival] = useState(driver?.eta || new Date(Date.now() + 900000));
          const [routeOptimized, setRouteOptimized] = useState(false);

          useEffect(() => {
            if (!wsConnected || !driver) return;

            // Simulate real-time driver location updates
            const locationInterval = setInterval(() => {
              setDriverLocation(prev => ({
                lat: prev.lat + (Math.random() - 0.5) * 0.001,
                lng: prev.lng + (Math.random() - 0.5) * 0.001
              }));

              // Simulate traffic updates
              const trafficLevels = ['light', 'moderate', 'heavy'];
              setTrafficLevel(trafficLevels[Math.floor(Math.random() * trafficLevels.length)]);

              // Update ETA based on traffic
              const baseTime = 15; // base minutes
              const trafficMultiplier = trafficLevel === 'light' ? 0.8 : trafficLevel === 'heavy' ? 1.3 : 1;
              const newETA = new Date(Date.now() + (baseTime * trafficMultiplier * 60000));
              setEstimatedArrival(newETA);
            }, 5000);

            return () => clearInterval(locationInterval);
          }, [wsConnected, driver, trafficLevel]);

          const formatTime = (date) => {
            return date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          };

          const getTrafficColor = (level) => {
            const colors = {
              'light': 'text-green-600 bg-green-50',
              'moderate': 'text-yellow-600 bg-yellow-50',
              'heavy': 'text-red-600 bg-red-50'
            };
            return colors[level] || 'text-gray-600 bg-gray-50';
          };

          const getTrafficIcon = (level) => {
            const icons = {
              'light': 'Zap',
              'moderate': 'Clock',
              'heavy': 'AlertTriangle'
            };
            return icons[level] || 'Navigation';
          };

          if (!driver || order.status !== 'out_for_delivery') {
            return (
              <div className="bg-surface rounded-xl border border-border p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="MapPin" size={24} className="text-text-secondary" />
                  </div>
                  <h3 className="text-lg font-heading font-heading-medium text-text-primary mb-2">
                    Delivery Map
                  </h3>
                  <p className="text-text-secondary font-body">
                    Map will be available when your order is out for delivery
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon name="MapPin" size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-heading-medium text-text-primary">
                        Live Delivery Tracking
                      </h3>
                      <p className="text-sm text-text-secondary font-body">
                        Your driver is on the way
                      </p>
                    </div>
                  </div>
                  
                  {wsConnected && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-blue-600 font-body font-body-medium">
                        Live GPS
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Simplified Map Visualization */}
                <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-border h-48 mb-6 overflow-hidden">
                  {/* Map Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
                      {[...Array(48)].map((_, i) => (
                        <div key={i} className="border border-gray-300"></div>
                      ))}
                    </div>
                  </div>

                  {/* Restaurant Pin */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <Icon name="Store" size={12} className="text-white" />
                    </div>
                    <div className="bg-white px-2 py-1 rounded shadow text-xs font-body">
                      Restaurant
                    </div>
                  </div>

                  {/* Customer Location */}
                  <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                    <div className="bg-white px-2 py-1 rounded shadow text-xs font-body">
                      Your Location
                    </div>
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <Icon name="Home" size={12} className="text-white" />
                    </div>
                  </div>

                  {/* Driver Location (Animated) */}
                  <div 
                    className="absolute transition-all duration-5000 ease-linear"
                    style={{
                      top: `${30 + Math.sin(Date.now() / 10000) * 20}%`,
                      left: `${40 + Math.cos(Date.now() / 8000) * 30}%`
                    }}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center animate-pulse">
                        <Icon name="Car" size={14} className="text-white" />
                      </div>
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-2 py-1 rounded text-xs font-body whitespace-nowrap">
                        {driver.name}
                      </div>
                      {/* Movement Trail */}
                      <div className="absolute inset-0 bg-purple-300 rounded-full animate-ping opacity-20"></div>
                    </div>
                  </div>

                  {/* Route Line (Simulated) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <path
                      d="M 20 20 Q 80 60 160 120 Q 240 160 300 180"
                      stroke="#8B5CF6"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                      fill="none"
                      className="animate-pulse opacity-60"
                    />
                  </svg>
                </div>

                {/* Driver Details */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Icon name="User" size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-body font-body-medium text-text-primary">
                        {driver.name}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1">
                          <Icon name="Star" size={14} className="text-yellow-400 fill-current" />
                          <span className="text-sm text-text-secondary font-body">
                            {driver.rating}
                          </span>
                        </div>
                        <span className="text-sm text-text-secondary font-body">
                          {driver.vehicle}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`tel:${driver.phone}`}
                      className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Icon name="Phone" size={16} />
                    </a>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <Icon name="Clock" size={24} className="text-primary mx-auto mb-2" />
                    <p className="text-sm text-text-secondary font-body mb-1">
                      Estimated Arrival
                    </p>
                    <p className="text-lg font-heading font-heading-medium text-text-primary">
                      {formatTime(estimatedArrival)}
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <Icon name="Navigation" size={24} className="text-primary mx-auto mb-2" />
                    <p className="text-sm text-text-secondary font-body mb-1">
                      Distance Away
                    </p>
                    <p className="text-lg font-heading font-heading-medium text-text-primary">
                      2.3 miles
                    </p>
                  </div>
                </div>

                {/* Traffic & Route Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        getTrafficColor(trafficLevel)
                      }`}>
                        <Icon name={getTrafficIcon(trafficLevel)} size={16} />
                      </div>
                      <div>
                        <p className="font-body font-body-medium text-text-primary">
                          Traffic: {trafficLevel.charAt(0).toUpperCase() + trafficLevel.slice(1)}
                        </p>
                        <p className="text-sm text-text-secondary font-body">
                          Route optimized for fastest delivery
                        </p>
                      </div>
                    </div>
                    {routeOptimized && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Icon name="CheckCircle" size={16} />
                        <span className="text-sm font-body">Optimized</span>
                      </div>
                    )}
                  </div>

                  {/* Delivery Instructions */}
                  {order.deliveryInstructions && (
                    <div className="p-3 bg-accent-50 border border-accent-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <Icon name="MessageSquare" size={16} className="text-accent-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-body font-body-medium text-accent-700 mb-1">
                            Delivery Instructions
                          </p>
                          <p className="text-sm text-accent-600 font-body">
                            {order.deliveryInstructions}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Delivery Timeline */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="text-sm font-body font-body-medium text-blue-700 mb-2">
                      Delivery Progress
                    </h5>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Icon name="CheckCircle" size={14} className="text-green-600" />
                        <span className="text-text-secondary font-body">
                          Driver picked up your order • {formatTime(new Date(Date.now() - 600000))}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-3.5 h-3.5 border-2 border-blue-600 rounded-full animate-pulse"></div>
                        <span className="text-blue-600 font-body font-body-medium">
                          En route to your location
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-3.5 h-3.5 border-2 border-gray-300 rounded-full"></div>
                        <span className="text-text-secondary font-body">
                          Delivery completed
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        export default PredictiveDeliveryMap;