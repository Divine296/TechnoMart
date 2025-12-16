import { useState, useEffect } from 'react';
import { feedbackService } from '@/api/services/feedbackService';
import { toast } from 'sonner';

export const useFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await feedbackService.getFeedback();
      setFeedback(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch feedback';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const markResolved = async (id) => {
    try {
      const updatedFeedback = await feedbackService.markFeedbackResolved(id);
      setFeedback((prev) =>
        prev.map((item) => (item.id === id ? updatedFeedback : item))
      );
      toast.success('Feedback marked as resolved');
      return updatedFeedback;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to mark feedback as resolved';
      toast.error(errorMessage);
      throw err;
    }
  };

  const updateFeedback = async (id, updates) => {
    try {
      const updatedFeedback = await feedbackService.updateFeedback(id, updates);
      setFeedback((prev) =>
        prev.map((item) => (item.id === id ? updatedFeedback : item))
      );
      toast.success('Feedback updated successfully');
      return updatedFeedback;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update feedback';
      toast.error(errorMessage);
      throw err;
    }
  };

  const createFeedback = async (feedbackData) => {
    try {
      const newFeedback = await feedbackService.createFeedback(feedbackData);
      setFeedback((prev) => [...prev, newFeedback]);
      toast.success('Feedback created successfully');
      return newFeedback;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create feedback';
      toast.error(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return {
    feedback,
    loading,
    error,
    markResolved,
    updateFeedback,
    createFeedback,
    refetch: fetchFeedback,
  };
};
