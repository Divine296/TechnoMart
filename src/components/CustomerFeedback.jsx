import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFeedback } from '@/hooks/useFeedback';
import ErrorState from '@/components/shared/ErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { FeedbackMetrics } from './feedback/FeedbackMetrics';
import { FeedbackList } from './feedback/FeedbackList';
import { FeedbackReplyModal } from './feedback/FeedbackReplyModal';
import FeaturePanelCard from '@/components/shared/FeaturePanelCard';
import { MessageSquare, Inbox } from 'lucide-react';
const CustomerFeedback = () => {
  const { feedback, loading, error, markResolved, refetch } = useFeedback();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const handleResolve = async (id) => {
    try {
      const updated = await markResolved(id);
      toast.success(
        `Feedback marked as ${updated.resolved ? 'resolved' : 'unresolved'}`
      );
    } catch {}
  };
  const handleSendResponse = () => {
    if (!responseText.trim()) {
      toast.error('Please enter a response');
      return;
    }
    toast.success('Response sent successfully');
    setResponseText('');
    setSelectedFeedback(null);
  };
  // ... keep existing code (handleResolve, handleSendResponse)
  const filteredFeedback =
    activeTab === 'all'
      ? feedback
      : activeTab === 'resolved'
        ? feedback.filter((item) => item.resolved)
        : feedback.filter((item) => !item.resolved);
  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-7 w-52" />
        <FeaturePanelCard
          title="Customer Comments"
          titleStyle="accent"
          titleIcon={Inbox}
          titleAccentClassName="px-3 py-1 text-xs md:text-sm"
          titleClassName="text-xs md:text-sm"
          description="Review and manage customer feedback"
          contentClassName="space-y-3"
          disableDecor
        >
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </FeaturePanelCard>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <FeaturePanelCard
        title="Customer Feedback"
        titleStyle="accent"
        titleIcon={MessageSquare}
        titleAccentClassName="px-3 py-1 text-xs md:text-sm"
        titleClassName="text-xs md:text-sm"
        description="Monitor satisfaction metrics and customer sentiment in real time"
        contentClassName="space-y-4"
      >
        <FeedbackMetrics feedback={feedback || []} />
      </FeaturePanelCard>

      <FeaturePanelCard
        title="Customer Comments"
        titleStyle="accent"
        titleIcon={Inbox}
        titleAccentClassName="px-3 py-1 text-xs md:text-sm"
        titleClassName="text-xs md:text-sm"
        description="Review and manage customer feedback"
        contentClassName="space-y-4"
      >
        <Tabs
          defaultValue="all"
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-none">
              All
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 sm:flex-none">
              Pending
            </TabsTrigger>
            <TabsTrigger value="resolved" className="flex-1 sm:flex-none">
              Resolved
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredFeedback.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
            No feedback to display
          </div>
        ) : (
          <FeedbackList
            feedback={filteredFeedback}
            onReply={setSelectedFeedback}
            onResolve={handleResolve}
          />
        )}
      </FeaturePanelCard>

      <FeedbackReplyModal
        isOpen={!!selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
        feedback={selectedFeedback}
        responseText={responseText}
        onResponseChange={setResponseText}
        onSendResponse={handleSendResponse}
      />
    </div>
  );
};
export default CustomerFeedback;
