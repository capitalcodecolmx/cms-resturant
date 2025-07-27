import React from 'react';
        import Icon from 'components/AppIcon';

        function EnhancedOrderCard({ order, isSelected, onClick, onShare }) {
          const getStatusColor = (status) => {
            const colors = {
              'confirmed': 'text-blue-600 bg-blue-50',
              'preparing': 'text-orange-600 bg-orange-50',
              'ready': 'text-green-600 bg-green-50',
              'out_for_delivery': 'text-purple-600 bg-purple-50',
              'delivered': 'text-gray-600 bg-gray-50'
            };
            return colors[status] || 'text-gray-600 bg-gray-50';
          };

          const getStatusIcon = (status) => {
            const icons = {
              'confirmed': 'CheckCircle',
              'preparing': 'ChefHat',
              'ready': 'Package',
              'out_for_delivery': 'Truck',
              'delivered': 'MapPin'
            };
            return icons[status] || 'Circle';
          };

          const formatTime = (date) => {
            return date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          };

          const getTimeRemaining = () => {
            const now = new Date();
            const remaining = Math.max(0, Math.ceil((order.estimatedDelivery - now) / (1000 * 60)));
            
            if (remaining === 0) return 'Any moment';
            if (remaining === 1) return '1 min';
            return `${remaining} min`;
          };

          return (
            <div
              onClick={onClick}
              className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'border-primary bg-primary-50 shadow-sm' 
                  : 'border-border bg-surface hover:border-primary-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-body font-body-medium text-text-primary truncate">
                    #{order.id.slice(-6)}
                  </h3>
                  <p className="text-sm text-text-secondary font-body truncate">
                    {order.restaurant.name}
                  </p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare?.();
                  }}
                  className="p-1 hover:bg-secondary-100 rounded transition-colors"
                >
                  <Icon name="Share2" size={14} className="text-text-secondary" />
                </button>
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-body font-body-medium mb-3 ${
                getStatusColor(order.status)
              }`}>
                <Icon name={getStatusIcon(order.status)} size={12} />
                <span className="capitalize">
                  {order.status.replace('_', ' ')}
                </span>
              </div>

              {/* Order Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary font-body">Items:</span>
                  <span className="text-text-primary font-body font-body-medium">
                    {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-secondary font-body">Total:</span>
                  <span className="text-text-primary font-body font-body-medium">
                    ${order.total.toFixed(2)}
                  </span>
                </div>

                {order.status !== 'delivered' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary font-body">ETA:</span>
                    <span className="text-primary font-body font-body-medium">
                      {getTimeRemaining()}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress Indicator */}
              <div className="mt-3">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-xs text-text-secondary font-body">Progress</span>
                  <div className="flex-1 bg-secondary-200 rounded-full h-1">
                    <div 
                      className="bg-primary rounded-full h-1 transition-all duration-300"
                      style={{
                        width: order.status === 'confirmed' ? '25%' :
                               order.status === 'preparing' ? '50%' :
                               order.status === 'ready' ? '75%' :
                               order.status === 'out_for_delivery' ? '90%' :
                               order.status === 'delivered' ? '100%' : '10%'
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Live Update Indicator */}
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white animate-pulse"></div>
              )}

              {/* Modification Indicator */}
              {order.modifications && order.modifications.length > 0 && (
                <div className="absolute top-2 right-8">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                </div>
              )}
            </div>
          );
        }

        export default EnhancedOrderCard;