import React, { useState, useEffect } from 'react';
        import Icon from 'components/AppIcon';

        function LiveKitchenUpdate({ order, wsConnected }) {
          const [kitchenUpdates, setKitchenUpdates] = useState([]);
          const [currentPhoto, setCurrentPhoto] = useState(null);
          const [photoIndex, setPhotoIndex] = useState(0);

          // Mock preparation photos
          const preparationPhotos = [
            {
              url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
              caption: 'Pizza dough being prepared',
              timestamp: new Date(Date.now() - 900000)
            },
            {
              url: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
              caption: 'Fresh toppings added',
              timestamp: new Date(Date.now() - 600000)
            },
            {
              url: 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=400&h=300&fit=crop',
              caption: 'Pizza in oven - almost ready!',
              timestamp: new Date(Date.now() - 300000)
            }
          ];

          useEffect(() => {
            if (!wsConnected || order.status !== 'preparing') return;

            // Simulate kitchen updates
            const updates = [
              {
                id: 1,
                message: 'Chef started preparing your order',
                timestamp: new Date(Date.now() - 1200000),
                type: 'start',
                station: 'Pizza Station'
              },
              {
                id: 2,
                message: 'Dough stretched and sauce applied',
                timestamp: new Date(Date.now() - 900000),
                type: 'progress',
                station: 'Pizza Station'
              },
              {
                id: 3,
                message: 'Fresh toppings being added',
                timestamp: new Date(Date.now() - 600000),
                type: 'progress',
                station: 'Pizza Station'
              },
              {
                id: 4,
                message: 'Pizza in wood-fired oven',
                timestamp: new Date(Date.now() - 300000),
                type: 'cooking',
                station: 'Oven Station'
              }
            ];

            setKitchenUpdates(updates);

            // Simulate photo updates
            const photoInterval = setInterval(() => {
              if (photoIndex < preparationPhotos.length - 1) {
                setPhotoIndex(prev => prev + 1);
                setCurrentPhoto(preparationPhotos[photoIndex + 1]);
              }
            }, 20000);

            // Set initial photo
            if (preparationPhotos.length > 0) {
              setCurrentPhoto(preparationPhotos[0]);
            }

            return () => clearInterval(photoInterval);
          }, [wsConnected, order.status, photoIndex]);

          const formatTime = (timestamp) => {
            return timestamp.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          };

          const getUpdateIcon = (type) => {
            const icons = {
              'start': 'Play',
              'progress': 'Clock',
              'cooking': 'Flame',
              'quality': 'CheckCircle',
              'packaging': 'Package'
            };
            return icons[type] || 'Info';
          };

          const getUpdateColor = (type) => {
            const colors = {
              'start': 'text-blue-600 bg-blue-50',
              'progress': 'text-orange-600 bg-orange-50',
              'cooking': 'text-red-600 bg-red-50',
              'quality': 'text-green-600 bg-green-50',
              'packaging': 'text-purple-600 bg-purple-50'
            };
            return colors[type] || 'text-gray-600 bg-gray-50';
          };

          if (order.status !== 'preparing') {
            return null;
          }

          return (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-orange-50 to-red-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Icon name="ChefHat" size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-heading-medium text-text-primary">
                        Live Kitchen Updates
                      </h3>
                      <p className="text-sm text-text-secondary font-body">
                        Your order is being prepared
                      </p>
                    </div>
                  </div>
                  
                  {wsConnected && (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-600 font-body font-body-medium">
                        Live
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Current Preparation Photo */}
                {currentPhoto && (
                  <div className="mb-6">
                    <div className="relative rounded-lg overflow-hidden">
                      <img
                        src={currentPhoto.url}
                        alt={currentPhoto.caption}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-white font-body font-body-medium mb-1">
                          {currentPhoto.caption}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Icon name="Camera" size={14} className="text-white/80" />
                          <span className="text-white/80 text-sm font-body">
                            {formatTime(currentPhoto.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Photo Navigation */}
                    <div className="flex items-center justify-center mt-3 space-x-2">
                      {preparationPhotos.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index <= photoIndex ? 'bg-primary' : 'bg-secondary-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kitchen Activity Feed */}
                <div className="space-y-4">
                  <h4 className="text-lg font-heading font-heading-medium text-text-primary">
                    Kitchen Activity
                  </h4>
                  
                  <div className="space-y-3">
                    {kitchenUpdates.map((update, index) => (
                      <div
                        key={update.id}
                        className={`p-4 rounded-lg border transition-all duration-300 ${
                          index === 0 ? 'border-primary bg-primary-50' : 'border-border bg-secondary-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            getUpdateColor(update.type)
                          }`}>
                            <Icon name={getUpdateIcon(update.type)} size={16} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-body font-body-medium text-text-primary">
                                  {update.message}
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                  <span className="text-sm text-text-secondary font-body">
                                    {update.station}
                                  </span>
                                  <span className="text-sm text-text-secondary font-body">
                                    {formatTime(update.timestamp)}
                                  </span>
                                </div>
                              </div>
                              
                              {index === 0 && (
                                <div className="flex items-center space-x-1">
                                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                                  <span className="text-xs text-primary font-body">
                                    Current
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kitchen Capacity & Performance */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Icon name="Users" size={20} className="text-orange-600" />
                      </div>
                      <p className="text-sm text-text-secondary font-body">Chefs Active</p>
                      <p className="text-lg font-heading font-heading-medium text-text-primary">
                        3
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Icon name="Clock" size={20} className="text-blue-600" />
                      </div>
                      <p className="text-sm text-text-secondary font-body">Est. Time Left</p>
                      <p className="text-lg font-heading font-heading-medium text-text-primary">
                        8 min
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Icon name="Thermometer" size={20} className="text-green-600" />
                      </div>
                      <p className="text-sm text-text-secondary font-body">Oven Temp</p>
                      <p className="text-lg font-heading font-heading-medium text-text-primary">
                        450°F
                      </p>
                    </div>
                  </div>
                </div>

                {/* Next Steps Preview */}
                <div className="mt-6 p-4 bg-accent-50 border border-accent-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <Icon name="FastForward" size={18} className="text-accent-600" />
                    <h5 className="font-body font-body-medium text-accent-700">
                      What's Next
                    </h5>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-accent-400 rounded-full"></div>
                      <span className="text-accent-600 font-body">
                        Quality check and plating (2 min)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-accent-400 rounded-full"></div>
                      <span className="text-accent-600 font-body">
                        Packaging for delivery (3 min)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-accent-400 rounded-full"></div>
                      <span className="text-accent-600 font-body">
                        Ready for pickup by driver
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        export default LiveKitchenUpdate;