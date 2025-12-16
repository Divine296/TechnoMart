import React from 'react';
import { Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const FeedbackReplyModal = ({ 
  isOpen, 
  onClose, 
  feedback, 
  responseText, 
  onResponseChange, 
  onSendResponse 
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

  if (!feedback) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reply to {feedback.customerName}</DialogTitle>
          <DialogDescription>Respond to customer feedback</DialogDescription>
        </DialogHeader>
        <div className="border rounded-lg p-4 bg-muted/50 mb-4">
          <div className="flex items-center mb-2">
            <span className="font-medium">{feedback.customerName}</span>
            <span className="text-sm text-muted-foreground ml-2">
              {new Date(feedback.date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex mb-2">{renderStars(feedback.rating)}</div>
          <p className="text-sm">{feedback.comment}</p>
        </div>
        <div>
          <Label htmlFor="response">Your Response</Label>
          <Textarea
            id="response"
            value={responseText}
            onChange={(e) => onResponseChange(e.target.value)}
            placeholder="Type your response..."
            className="mt-2"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSendResponse}>Send Response</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};