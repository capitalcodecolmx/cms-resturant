import React, { useState } from 'react';
        import Icon from 'components/AppIcon';

        function OrderSharingPanel({ order, onShare, onFeedback }) {
          const [isExpanded, setIsExpanded] = useState(false);
          const [feedbackRating, setFeedbackRating] = useState(0);
          const [feedbackComment, setFeedbackComment] = useState('');
          const [showFeedbackForm, setShowFeedbackForm] = useState(false);

          const handleShare = (platform) => {
            const shareUrl = `${window.location.origin}/real-time-order-tracking-hub?order=${order.id}`;
            const shareText = `Track my order from ${order.restaurant.name} in real-time!`;

            switch (platform) {
              case 'native':
                if (navigator.share) {
                  navigator.share({
                    title: `Order ${order.id}`,
                    text: shareText,
                    url: shareUrl
                  });
                } else {
                  // Fallback to clipboard
                  navigator.clipboard.writeText(shareUrl);
                }
                break;
              case 'copy':
                navigator.clipboard.writeText(shareUrl);
                break;
              case 'whatsapp':
                window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`);
                break;
              case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
                break;
            }

            onShare?.();
          };

          const handleFeedbackSubmit = () => {
            if (feedbackRating > 0) {
              onFeedback?.({
                rating: feedbackRating,
                comment: feedbackComment
              });
              
              // Reset form
              setFeedbackRating(0);
              setFeedbackComment('');
              setShowFeedbackForm(false);
            }
          };

          const ShareButton = ({ icon, label, onClick, color = "text-text-secondary" }) => (
            <button
              onClick={onClick}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border border-border hover:border-primary transition-smooth ${color} hover:text-primary`}
            >
              <Icon name={icon} size={16} />
              <span className="text-sm font-body">{label}</span>
            </button>
          );

          return (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 border-b border-border bg-gradient-to-r from-green-50 to-blue-50 flex items-center justify-between hover:from-green-100 hover:to-blue-100 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon name="Share2" size={20} className="text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-heading font-heading-medium text-text-primary">
                      Share & Engage
                    </h3>
                    <p className="text-sm text-text-secondary font-body">
                      Share your order or leave feedback
                    </p>
                  </div>
                </div>
                
                <Icon 
                  name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                  size={20} 
                  className="text-text-secondary" 
                />
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="p-6 space-y-6">
                  {/* Order Sharing */}
                  <div>
                    <h4 className="text-lg font-heading font-heading-medium text-text-primary mb-3">
                      Share Your Order
                    </h4>
                    <p className="text-sm text-text-secondary font-body mb-4">
                      Let friends and family track your order in real-time
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <ShareButton
                        icon="Share"
                        label="Share Link"
                        onClick={() => handleShare('native')}
                        color="text-primary"
                      />
                      
                      <ShareButton
                        icon="Copy"
                        label="Copy Link"
                        onClick={() => handleShare('copy')}
                      />
                      
                      <ShareButton
                        icon="MessageCircle"
                        label="WhatsApp"
                        onClick={() => handleShare('whatsapp')}
                        color="text-green-600"
                      />
                      
                      <ShareButton
                        icon="Twitter"
                        label="Twitter"
                        onClick={() => handleShare('twitter')}
                        color="text-blue-600"
                      />
                    </div>
                  </div>

                  {/* Family Sharing Features */}
                  <div className="pt-6 border-t border-border">
                    <h4 className="text-lg font-heading font-heading-medium text-text-primary mb-3">
                      Family Coordination
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon name="Users" size={18} className="text-blue-600" />
                          <div>
                            <p className="font-body font-body-medium text-blue-700">
                              Household Orders
                            </p>
                            <p className="text-sm text-blue-600 font-body">
                              Coordinate with 2 other active orders
                            </p>
                          </div>
                        </div>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-body font-body-medium">
                          View All
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon name="Bell" size={18} className="text-purple-600" />
                          <div>
                            <p className="font-body font-body-medium text-purple-700">
                              Delivery Notifications
                            </p>
                            <p className="text-sm text-purple-600 font-body">
                              Everyone gets arrival updates
                            </p>
                          </div>
                        </div>
                        <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Section */}
                  <div className="pt-6 border-t border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-heading font-heading-medium text-text-primary">
                        Delivery Feedback
                      </h4>
                      <button
                        onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                        className="text-sm text-primary hover:text-primary-700 font-body font-body-medium"
                      >
                        {showFeedbackForm ? 'Cancel' : 'Leave Feedback'}
                      </button>
                    </div>

                    {showFeedbackForm ? (
                      <div className="space-y-4 p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
                        {/* Rating Stars */}
                        <div>
                          <label className="block text-sm font-body font-body-medium text-text-primary mb-2">
                            Rate your experience
                          </label>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setFeedbackRating(star)}
                                className="transition-colors"
                              >
                                <Icon
                                  name="Star"
                                  size={24}
                                  className={`${
                                    star <= feedbackRating
                                      ? 'text-yellow-400 fill-current' :'text-gray-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="block text-sm font-body font-body-medium text-text-primary mb-2">
                            Additional comments (optional)
                          </label>
                          <textarea
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            placeholder="Tell us about your delivery experience..."
                            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary font-body text-sm"
                            rows="3"
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={handleFeedbackSubmit}
                            disabled={feedbackRating === 0}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-body font-body-medium"
                          >
                            Submit Feedback
                          </button>
                          <p className="text-xs text-text-secondary font-body">
                            Earn 10 loyalty points for feedback
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Icon name="Gift" size={20} className="text-green-600" />
                          <div>
                            <p className="font-body font-body-medium text-green-700">
                              Share for Rewards
                            </p>
                            <p className="text-sm text-green-600 font-body">
                              Earn loyalty points when friends order using your shared link
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Analytics for Frequent Customers */}
                  <div className="pt-6 border-t border-border">
                    <h4 className="text-lg font-heading font-heading-medium text-text-primary mb-3">
                      Your Order History
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-heading font-heading-medium text-blue-600">
                          12
                        </p>
                        <p className="text-sm text-blue-600 font-body">
                          Total Orders
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-heading font-heading-medium text-green-600">
                          4.8
                        </p>
                        <p className="text-sm text-green-600 font-body">
                          Avg Rating
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }

        export default OrderSharingPanel;