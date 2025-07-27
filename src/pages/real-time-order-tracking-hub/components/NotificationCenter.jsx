import React, { useState } from 'react';
        import Icon from 'components/AppIcon';

        function NotificationCenter({ notifications, onClearAll }) {
          const [isOpen, setIsOpen] = useState(false);
          const [preferences, setPreferences] = useState({
            push: true,
            sms: false,
            email: true
          });

          const formatTime = (timestamp) => {
            const now = new Date();
            const diff = now - timestamp;
            const minutes = Math.floor(diff / 60000);
            
            if (minutes < 1) return 'Just now';
            if (minutes < 60) return `${minutes}m ago`;
            
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours}h ago`;
            
            const days = Math.floor(hours / 24);
            return `${days}d ago`;
          };

          const getPriorityColor = (priority) => {
            const colors = {
              'info': 'text-blue-600 bg-blue-50 border-blue-200',
              'success': 'text-green-600 bg-green-50 border-green-200',
              'warning': 'text-yellow-600 bg-yellow-50 border-yellow-200',
              'error': 'text-red-600 bg-red-50 border-red-200'
            };
            return colors[priority] || 'text-gray-600 bg-gray-50 border-gray-200';
          };

          const getPriorityIcon = (priority) => {
            const icons = {
              'info': 'Info',
              'success': 'CheckCircle',
              'warning': 'AlertTriangle',
              'error': 'AlertCircle'
            };
            return icons[priority] || 'Bell';
          };

          const togglePreference = (type) => {
            setPreferences(prev => ({
              ...prev,
              [type]: !prev[type]
            }));
          };

          return (
            <div className="relative">
              {/* Notification Bell */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-text-secondary hover:text-primary transition-colors rounded-lg hover:bg-secondary-50"
              >
                <Icon name="Bell" size={20} />
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-body font-body-medium">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </div>
                )}
              </button>

              {/* Notification Dropdown */}
              {isOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                  ></div>

                  {/* Dropdown Content */}
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-border shadow-lg z-50 max-h-96 overflow-hidden">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-border bg-secondary-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-body font-body-medium text-text-primary">
                          Notifications
                        </h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              // Toggle notification preferences panel
                            }}
                            className="p-1 text-text-secondary hover:text-primary transition-colors"
                          >
                            <Icon name="Settings" size={16} />
                          </button>
                          {notifications.length > 0 && (
                            <button
                              onClick={onClearAll}
                              className="text-sm text-primary hover:text-primary-700 font-body"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Icon name="Bell" size={20} className="text-text-secondary" />
                          </div>
                          <p className="text-text-secondary font-body">
                            No new notifications
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-border">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className="p-4 hover:bg-secondary-50 transition-colors"
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                  getPriorityColor(notification.priority)
                                }`}>
                                  <Icon 
                                    name={getPriorityIcon(notification.priority)} 
                                    size={14}
                                  />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-body text-text-primary">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-text-secondary font-body">
                                      {formatTime(notification.timestamp)}
                                    </span>
                                    {notification.orderId && (
                                      <span className="text-xs text-primary font-body">
                                        #{notification.orderId.slice(-6)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Notification Preferences */}
                    <div className="px-4 py-3 border-t border-border bg-secondary-50">
                      <h4 className="text-sm font-body font-body-medium text-text-primary mb-2">
                        Notification Preferences
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.push}
                            onChange={() => togglePreference('push')}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <div className="flex items-center space-x-2">
                            <Icon name="Smartphone" size={14} className="text-text-secondary" />
                            <span className="text-sm text-text-secondary font-body">
                              Push notifications
                            </span>
                          </div>
                        </label>
                        
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.sms}
                            onChange={() => togglePreference('sms')}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <div className="flex items-center space-x-2">
                            <Icon name="MessageSquare" size={14} className="text-text-secondary" />
                            <span className="text-sm text-text-secondary font-body">
                              SMS updates
                            </span>
                          </div>
                        </label>
                        
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.email}
                            onChange={() => togglePreference('email')}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2"
                          />
                          <div className="flex items-center space-x-2">
                            <Icon name="Mail" size={14} className="text-text-secondary" />
                            <span className="text-sm text-text-secondary font-body">
                              Email notifications
                            </span>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        }

        export default NotificationCenter;