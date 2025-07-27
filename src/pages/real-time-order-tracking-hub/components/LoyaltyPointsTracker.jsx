import React, { useState } from 'react';
        import Icon from 'components/AppIcon';

        function LoyaltyPointsTracker({ points }) {
          const [isExpanded, setIsExpanded] = useState(false);

          // Calculate tier progress
          const tiers = [
            { name: 'Bronze', min: 0, max: 499, color: 'text-yellow-600 bg-yellow-50' },
            { name: 'Silver', min: 500, max: 999, color: 'text-gray-600 bg-gray-50' },
            { name: 'Gold', min: 1000, max: 2499, color: 'text-yellow-500 bg-yellow-100' },
            { name: 'Platinum', min: 2500, max: 4999, color: 'text-purple-600 bg-purple-50' },
            { name: 'Diamond', min: 5000, max: Infinity, color: 'text-blue-600 bg-blue-50' }
          ];

          const currentTier = tiers.find(tier => points >= tier.min && points <= tier.max) || tiers[0];
          const nextTier = tiers[tiers.indexOf(currentTier) + 1];
          const progressPercentage = nextTier ? 
            ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

          const pointsToNextTier = nextTier ? nextTier.min - points : 0;

          // Recent earning opportunities
          const earningOpportunities = [
            { action: 'Order Feedback', points: 10, icon: 'MessageSquare' },
            { action: 'Share Order', points: 5, icon: 'Share2' },
            { action: 'Photo Review', points: 15, icon: 'Camera' },
            { action: 'Refer Friend', points: 100, icon: 'Users' }
          ];

          return (
            <div className="relative">
              {/* Points Display Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-all"
              >
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Icon name="Star" size={14} className="text-yellow-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-body font-body-medium text-yellow-700">
                    {points.toLocaleString()} pts
                  </p>
                  <p className="text-xs text-yellow-600 font-body">
                    {currentTier.name} Tier
                  </p>
                </div>
                <Icon 
                  name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                  size={16} 
                  className="text-yellow-600" 
                />
              </button>

              {/* Expanded Loyalty Panel */}
              {isExpanded && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsExpanded(false)}
                  ></div>

                  {/* Panel Content */}
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-border shadow-lg z-50 overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-yellow-50 to-orange-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-heading font-heading-medium text-text-primary">
                            Loyalty Rewards
                          </h3>
                          <p className="text-sm text-text-secondary font-body">
                            {points.toLocaleString()} points • {currentTier.name} tier
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-body font-body-medium ${currentTier.color}`}>
                          {currentTier.name}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Tier Progress */}
                      {nextTier && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-body text-text-secondary">
                              Progress to {nextTier.name}
                            </span>
                            <span className="text-sm font-body font-body-medium text-text-primary">
                              {pointsToNextTier} pts needed
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-text-secondary font-body">
                            {Math.round(progressPercentage)}% complete
                          </p>
                        </div>
                      )}

                      {/* Available Rewards */}
                      <div>
                        <h4 className="text-lg font-heading font-heading-medium text-text-primary mb-3">
                          Available Rewards
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Icon name="Coffee" size={18} className="text-green-600" />
                              <div>
                                <p className="font-body font-body-medium text-green-700">
                                  Free Appetizer
                                </p>
                                <p className="text-sm text-green-600 font-body">
                                  500 points
                                </p>
                              </div>
                            </div>
                            <button 
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded font-body hover:bg-green-700 transition-colors"
                              disabled={points < 500}
                            >
                              {points >= 500 ? 'Redeem' : 'Need more'}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Icon name="DollarSign" size={18} className="text-blue-600" />
                              <div>
                                <p className="font-body font-body-medium text-blue-700">
                                  $5 Off Next Order
                                </p>
                                <p className="text-sm text-blue-600 font-body">
                                  750 points
                                </p>
                              </div>
                            </div>
                            <button 
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded font-body hover:bg-blue-700 transition-colors"
                              disabled={points < 750}
                            >
                              {points >= 750 ? 'Redeem' : 'Need more'}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Icon name="Gift" size={18} className="text-purple-600" />
                              <div>
                                <p className="font-body font-body-medium text-purple-700">
                                  Free Dessert
                                </p>
                                <p className="text-sm text-purple-600 font-body">
                                  1,000 points
                                </p>
                              </div>
                            </div>
                            <button 
                              className="px-3 py-1 bg-purple-600 text-white text-sm rounded font-body hover:bg-purple-700 transition-colors"
                              disabled={points < 1000}
                            >
                              {points >= 1000 ? 'Redeem' : 'Need more'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Earning Opportunities */}
                      <div>
                        <h4 className="text-lg font-heading font-heading-medium text-text-primary mb-3">
                          Earn More Points
                        </h4>
                        <div className="space-y-2">
                          {earningOpportunities.map((opportunity, index) => (
                            <div key={index} className="flex items-center justify-between p-2 hover:bg-secondary-50 rounded-lg transition-colors">
                              <div className="flex items-center space-x-3">
                                <Icon name={opportunity.icon} size={16} className="text-text-secondary" />
                                <span className="text-sm font-body text-text-primary">
                                  {opportunity.action}
                                </span>
                              </div>
                              <span className="text-sm font-body font-body-medium text-primary">
                                +{opportunity.points}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Activity */}
                      <div>
                        <h4 className="text-lg font-heading font-heading-medium text-text-primary mb-3">
                          Recent Activity
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary font-body">
                              Order #001234
                            </span>
                            <span className="text-green-600 font-body font-body-medium">
                              +26 pts
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary font-body">
                              Feedback submitted
                            </span>
                            <span className="text-green-600 font-body font-body-medium">
                              +10 pts
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary font-body">
                              Order shared
                            </span>
                            <span className="text-green-600 font-body font-body-medium">
                              +5 pts
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Tier Benefits */}
                      <div className="pt-4 border-t border-border">
                        <h4 className="text-lg font-heading font-heading-medium text-text-primary mb-3">
                          {currentTier.name} Benefits
                        </h4>
                        <div className="space-y-2 text-sm text-text-secondary font-body">
                          <div className="flex items-center space-x-2">
                            <Icon name="Check" size={14} className="text-green-600" />
                            <span>Free delivery on orders over $25</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Icon name="Check" size={14} className="text-green-600" />
                            <span>Priority customer support</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Icon name="Check" size={14} className="text-green-600" />
                            <span>Early access to new menu items</span>
                          </div>
                          {currentTier.name !== 'Bronze' && (
                            <div className="flex items-center space-x-2">
                              <Icon name="Check" size={14} className="text-green-600" />
                              <span>Exclusive promotions</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        }

        export default LoyaltyPointsTracker;