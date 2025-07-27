import React, { useState, useEffect } from 'react';
        import Icon from 'components/AppIcon';

        function TemperatureMonitor({ items, status }) {
          const [temperatureData, setTemperatureData] = useState({});
          const [qualityAlerts, setQualityAlerts] = useState([]);

          useEffect(() => {
            if (!items || status !== 'preparing') return;

            // Simulate IoT temperature monitoring
            const interval = setInterval(() => {
              const newTempData = {};
              const alerts = [];

              items.forEach(item => {
                // Simulate temperature readings with realistic fluctuations
                const baseTemp = item.temperature || 165;
                const currentTemp = baseTemp + (Math.random() - 0.5) * 10;
                
                newTempData[item.id] = {
                  current: Math.round(currentTemp),
                  target: baseTemp,
                  readings: [
                    ...(temperatureData[item.id]?.readings || []).slice(-9),
                    {
                      temp: Math.round(currentTemp),
                      timestamp: new Date()
                    }
                  ]
                };

                // Check for quality alerts
                if (Math.abs(currentTemp - baseTemp) > 15) {
                  alerts.push({
                    id: `${item.id}-${Date.now()}`,
                    itemName: item.name,
                    message: currentTemp > baseTemp + 15 ? 'Temperature too high' : 'Temperature too low',
                    severity: 'warning',
                    timestamp: new Date()
                  });
                }
              });

              setTemperatureData(newTempData);
              
              if (alerts.length > 0) {
                setQualityAlerts(prev => [...alerts, ...prev.slice(0, 2)]);
              }
            }, 5000);

            return () => clearInterval(interval);
          }, [items, status]);

          const getTemperatureColor = (current, target) => {
            const diff = Math.abs(current - target);
            if (diff <= 5) return 'text-green-600 bg-green-50';
            if (diff <= 15) return 'text-yellow-600 bg-yellow-50';
            return 'text-red-600 bg-red-50';
          };

          const getTemperatureStatus = (current, target) => {
            const diff = Math.abs(current - target);
            if (diff <= 5) return 'Perfect';
            if (diff <= 15) return 'Good';
            return 'Alert';
          };

          const formatTime = (timestamp) => {
            return timestamp.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
          };

          if (!items || items.length === 0 || status !== 'preparing') {
            return null;
          }

          return (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-red-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Icon name="Thermometer" size={20} className="text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-heading font-heading-medium text-text-primary">
                        Temperature Monitoring
                      </h3>
                      <p className="text-sm text-text-secondary font-body">
                        Real-time food quality assurance
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-600 font-body font-body-medium">
                      Live IoT
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Quality Alerts */}
                {qualityAlerts.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <h4 className="text-lg font-heading font-heading-medium text-text-primary">
                      Quality Alerts
                    </h4>
                    {qualityAlerts.slice(0, 2).map((alert) => (
                      <div
                        key={alert.id}
                        className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3"
                      >
                        <Icon name="AlertTriangle" size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-body font-body-medium text-yellow-700">
                            {alert.itemName}: {alert.message}
                          </p>
                          <p className="text-sm text-yellow-600 font-body">
                            Kitchen staff notified • {formatTime(alert.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Temperature Readings for Each Item */}
                <div className="space-y-6">
                  <h4 className="text-lg font-heading font-heading-medium text-text-primary">
                    Current Temperatures
                  </h4>
                  
                  {items.map((item) => {
                    const tempData = temperatureData[item.id];
                    if (!tempData) return null;

                    const { current, target, readings } = tempData;
                    const status = getTemperatureStatus(current, target);
                    const colorClass = getTemperatureColor(current, target);

                    return (
                      <div key={item.id} className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
                        {/* Item Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h5 className="font-body font-body-medium text-text-primary">
                              {item.name}
                            </h5>
                            <p className="text-sm text-text-secondary font-body">
                              Station: {item.station || 'Kitchen Station'}
                            </p>
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full text-sm font-body font-body-medium ${colorClass}`}>
                            {status}
                          </div>
                        </div>

                        {/* Temperature Display */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div className="text-center p-3 bg-white rounded-lg border border-border">
                            <p className="text-2xl font-heading font-heading-medium text-text-primary">
                              {current}°F
                            </p>
                            <p className="text-sm text-text-secondary font-body">
                              Current
                            </p>
                          </div>
                          
                          <div className="text-center p-3 bg-white rounded-lg border border-border">
                            <p className="text-2xl font-heading font-heading-medium text-primary">
                              {target}°F
                            </p>
                            <p className="text-sm text-text-secondary font-body">
                              Target
                            </p>
                          </div>
                          
                          <div className="text-center p-3 bg-white rounded-lg border border-border">
                            <p className="text-2xl font-heading font-heading-medium text-accent">
                              {Math.abs(current - target)}°F
                            </p>
                            <p className="text-sm text-text-secondary font-body">
                              Variance
                            </p>
                          </div>
                        </div>

                        {/* Temperature Chart (Simplified) */}
                        <div className="mb-4">
                          <h6 className="text-sm font-body font-body-medium text-text-primary mb-2">
                            Temperature Trend (Last 10 readings)
                          </h6>
                          <div className="relative h-20 bg-white rounded-lg border border-border p-2">
                            {/* Chart Background */}
                            <div className="absolute inset-2 border-l border-b border-gray-200">
                              {/* Target line */}
                              <div 
                                className="absolute w-full border-t-2 border-dashed border-primary opacity-50"
                                style={{ bottom: '50%' }}
                              ></div>
                            </div>
                            
                            {/* Data Points */}
                            <div className="relative h-full flex items-end justify-between px-2">
                              {readings.slice(-10).map((reading, index) => {
                                const height = Math.max(10, Math.min(90, ((reading.temp - target + 20) / 40) * 100));
                                const color = getTemperatureColor(reading.temp, target).includes('green') ? 'bg-green-500' :
                                             getTemperatureColor(reading.temp, target).includes('yellow') ? 'bg-yellow-500' : 'bg-red-500';
                                
                                return (
                                  <div
                                    key={index}
                                    className={`w-2 rounded-t transition-all duration-300 ${color}`}
                                    style={{ height: `${height}%` }}
                                    title={`${reading.temp}°F at ${formatTime(reading.timestamp)}`}
                                  ></div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Quality Assurance Info */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Icon name="Shield" size={14} className="text-green-600" />
                            <span className="text-green-600 font-body">
                              HACCP Compliant
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Icon name="Clock" size={14} className="text-text-secondary" />
                            <span className="text-text-secondary font-body">
                              Last update: {readings.length > 0 ? formatTime(readings[readings.length - 1].timestamp) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Kitchen Capacity Indicator */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-lg font-heading font-heading-medium text-text-primary mb-4">
                    Kitchen Environment
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <Icon name="Wind" size={18} className="text-blue-600" />
                        <span className="font-body font-body-medium text-blue-700">
                          Kitchen Ambient
                        </span>
                      </div>
                      <p className="text-2xl font-heading font-heading-medium text-blue-600">
                        72°F
                      </p>
                      <p className="text-sm text-blue-600 font-body">
                        Optimal range: 68-75°F
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <Icon name="Droplets" size={18} className="text-purple-600" />
                        <span className="font-body font-body-medium text-purple-700">
                          Humidity Level
                        </span>
                      </div>
                      <p className="text-2xl font-heading font-heading-medium text-purple-600">
                        45%
                      </p>
                      <p className="text-sm text-purple-600 font-body">
                        Optimal range: 40-50%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quality Certification */}
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Icon name="Award" size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-body font-body-medium text-green-700">
                        Food Safety Certified
                      </h5>
                      <p className="text-sm text-green-600 font-body">
                        This kitchen maintains the highest food safety standards with continuous monitoring
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        export default TemperatureMonitor;