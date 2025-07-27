import React, { useState, useEffect } from 'react';
        import Icon from 'components/AppIcon';

        function MultiOrderTimeline({ order, wsConnected }) {
          const [liveUpdates, setLiveUpdates] = useState([]);
          const [expandedSteps, setExpandedSteps] = useState({});

          useEffect(() => {
            if (!wsConnected) return;

            // Simulate live updates
            const interval = setInterval(() => {
              if (Math.random() > 0.7) {
                const updates = [
                  'Pizza dough being stretched',
                  'Toppings being added',
                  'Pizza in oven - 8 minutes remaining',
                  'Quality check in progress',
                  'Packaging your order'
                ];
                
                const randomUpdate = {
                  id: Date.now(),
                  message: updates[Math.floor(Math.random() * updates.length)],
                  timestamp: new Date(),
                  status: order.status
                };
                
                setLiveUpdates(prev => [randomUpdate, ...prev.slice(0, 2)]);
              }
            }, 15000);

            return () => clearInterval(interval);
          }, [wsConnected, order.status]);

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

          const getStatusColor = (status, isActive, isCompleted) => {
            if (isCompleted) return 'text-success bg-success-50 border-success';
            if (isActive) return 'text-primary bg-primary-50 border-primary animate-pulse';
            return 'text-text-secondary bg-secondary-50 border-border';
          };

          const formatTime = (timestamp) => {
            if (!timestamp) return null;
            return timestamp.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });
          };

          const getCurrentStepIndex = () => {
            return order.timeline?.findIndex(step => step.status === order.status) || 0;
          };

          const toggleStepExpansion = (index) => {
            setExpandedSteps(prev => ({
              ...prev,
              [index]: !prev[index]
            }));
          };

          const currentStepIndex = getCurrentStepIndex();

          return (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary-50 to-accent-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-heading font-heading-medium text-text-primary">
                      Order #{order.id.slice(-6)}
                    </h2>
                    <p className="text-text-secondary font-body">
                      {order.restaurant.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      {wsConnected && (
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                      )}
                      <span className="text-sm text-text-secondary font-body">
                        Live Updates
                      </span>
                    </div>
                    <p className="text-lg font-heading font-heading-medium text-primary">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Live Updates Banner */}
                {liveUpdates.length > 0 && (
                  <div className="mb-6 p-4 bg-accent-50 border border-accent-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-body font-body-medium text-accent-700 mb-1">
                          Live Kitchen Update
                        </h4>
                        <p className="text-sm text-accent-600 font-body">
                          {liveUpdates[0]?.message}
                        </p>
                        <p className="text-xs text-accent-500 font-body mt-1">
                          {formatTime(liveUpdates[0]?.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced Timeline */}
                <div className="space-y-6">
                  {order.timeline?.map((step, index) => {
                    const isCompleted = index < currentStepIndex || (index === currentStepIndex && step.timestamp);
                    const isActive = index === currentStepIndex && !step.timestamp;
                    const isFuture = index > currentStepIndex;
                    const isExpanded = expandedSteps[index];

                    return (
                      <div key={step.status} className="relative">
                        {/* Timeline Line */}
                        {index < order.timeline.length - 1 && (
                          <div className={`absolute left-6 top-12 w-0.5 h-16 transition-all duration-300 ${
                            isCompleted ? 'bg-success' : 'bg-border'
                          }`}></div>
                        )}

                        <div className="flex items-start space-x-4">
                          {/* Enhanced Status Icon */}
                          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                            getStatusColor(step.status, isActive, isCompleted)
                          }`}>
                            <Icon 
                              name={getStatusIcon(step.status)} 
                              size={20}
                              className={`transition-all duration-300 ${
                                isCompleted ? 'text-success' : isActive ?'text-primary' : 'text-text-secondary'
                              }`}
                            />
                          </div>

                          {/* Enhanced Status Content */}
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => toggleStepExpansion(index)}
                              className="w-full text-left"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h3 className={`font-heading font-heading-medium transition-colors ${
                                  isCompleted || isActive ? 'text-text-primary' : 'text-text-secondary'
                                }`}>
                                  {step.title}
                                </h3>
                                
                                <div className="flex items-center space-x-2">
                                  {/* Timestamp or ETA */}
                                  {step.timestamp ? (
                                    <span className="text-sm text-success font-body font-body-medium">
                                      {formatTime(step.timestamp)}
                                    </span>
                                  ) : isActive ? (
                                    <span className="text-sm text-primary font-body font-body-medium animate-pulse">
                                      In Progress
                                    </span>
                                  ) : null}
                                  
                                  <Icon 
                                    name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                                    size={16} 
                                    className="text-text-secondary"
                                  />
                                </div>
                              </div>
                            </button>
                            
                            <p className={`text-sm font-body transition-colors ${
                              isCompleted || isActive ? 'text-text-secondary' : 'text-text-secondary opacity-60'
                            }`}>
                              {step.description || 'Processing your order'}
                            </p>

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="mt-4 p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-text-secondary font-body">Estimated Duration:</span>
                                    <p className="font-body font-body-medium text-text-primary">
                                      {step.status === 'preparing' ? '15-20 min' :
                                       step.status === 'ready' ? '5 min' :
                                       step.status === 'out_for_delivery' ? '15-25 min' : '2-3 min'}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-text-secondary font-body">Station:</span>
                                    <p className="font-body font-body-medium text-text-primary">
                                      {step.status === 'preparing' ? 'Kitchen Station 2' :
                                       step.status === 'ready' ? 'Pickup Counter' :
                                       step.status === 'out_for_delivery' ? 'Delivery Vehicle' : 'Order Processing'}
                                    </p>
                                  </div>
                                </div>
                                
                                {/* Recent Updates for Active Step */}
                                {isActive && liveUpdates.length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-secondary-200">
                                    <h5 className="text-xs text-text-secondary font-body font-body-medium mb-2">
                                      Recent Updates:
                                    </h5>
                                    {liveUpdates.slice(0, 3).map((update) => (
                                      <div key={update.id} className="flex items-center space-x-2 mb-1">
                                        <div className="w-1 h-1 bg-accent rounded-full"></div>
                                        <span className="text-xs text-text-secondary font-body">
                                          {update.message} • {formatTime(update.timestamp)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Active Status Indicator */}
                            {isActive && (
                              <div className="mt-3 flex items-center space-x-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                <span className="text-sm text-primary font-body font-body-medium">
                                  Currently {step.status === 'preparing' ? 'cooking' : 'processing'}
                                </span>
                                {wsConnected && (
                                  <div className="flex items-center space-x-1 ml-2">
                                    <Icon name="Wifi" size={12} className="text-success" />
                                    <span className="text-xs text-success font-body">Live</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery ETA */}
                {order.status !== 'delivered' && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-text-secondary font-body">
                            Estimated Delivery
                          </p>
                          <p className="text-xl font-heading font-heading-medium text-text-primary">
                            {formatTime(order.estimatedDelivery)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-text-secondary font-body">
                            Time Remaining
                          </p>
                          <p className="text-xl font-heading font-heading-medium text-primary">
                            {Math.max(0, Math.ceil((order.estimatedDelivery - new Date()) / (1000 * 60)))} min
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Modifications */}
                {order.modifications && order.modifications.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="text-sm font-heading font-heading-medium text-text-primary mb-3">
                      Order Modifications
                    </h4>
                    <div className="space-y-2">
                      {order.modifications.map((mod, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <Icon name="Edit" size={14} className="text-accent" />
                          <span className="text-text-secondary font-body">
                            {mod.type}: {mod.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        }

        export default MultiOrderTimeline;