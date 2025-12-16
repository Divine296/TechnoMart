import React from 'react';
import { Check, MessageCircle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const FeedbackList = ({ 
  feedback, 
  onReply, 
  onResolve 
}) => {
  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      ));
  };

  return (
    <div className="space-y-4">
      {feedback.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">
          No feedback found
        </p>
      ) : (
        feedback.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center mb-1">
                  <h4 className="font-medium text-base">{item.customerName}</h4>
                  {item.resolved && (
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-50 text-green-700 border-green-200"
                    >
                      <Check className="h-3 w-3 mr-1" /> Resolved
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="flex mr-2">{renderStars(item.rating)}</div>
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReply(item)}
                >
                  <MessageCircle className="h-4 w-4 mr-1" /> Reply
                </Button>
                <Button
                  variant={item.resolved ? 'outline' : 'default'}
                  size="sm"
                  onClick={() => onResolve(item.id)}
                >
                  {item.resolved ? 'Unresolve' : 'Resolve'}
                </Button>
              </div>
            </div>

            <p className="mt-2 text-sm">{item.comment}</p>
          </div>
        ))
      )}
    </div>
  );
};