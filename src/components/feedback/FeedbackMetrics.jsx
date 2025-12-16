import React from 'react';
import {
  BarChart3,
  CheckCircle,
  Star,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import FeaturePanelCard from '@/components/shared/FeaturePanelCard';

export const FeedbackMetrics = ({ feedback }) => {
  const averageRating =
    feedback.length > 0
      ? (
          feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
        ).toFixed(1)
      : '0.0';

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

  const sentimentCounts = feedback.reduce(
    (acc, item) => {
      if (item.rating >= 4) {
        acc.positive += 1;
      } else if (item.rating === 3) {
        acc.neutral += 1;
      } else {
        acc.negative += 1;
      }
      return acc;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  const total = feedback.length || 0;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <FeaturePanelCard
        title="Overall Rating"
        titleStyle="accent"
        titleIcon={Star}
        titleAccentClassName="px-3 py-1 text-xs md:text-sm"
        titleClassName="text-xs md:text-sm"
        description="Average customer satisfaction"
        contentClassName="space-y-3"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl font-semibold tracking-tight">
            {averageRating}
          </span>
          <div className="flex items-center gap-1 text-primary">
            {renderStars(Math.round(parseFloat(averageRating)))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Based on {feedback.length} reviews
        </p>
      </FeaturePanelCard>

      <FeaturePanelCard
        title="Sentiment Analysis"
        titleStyle="accent"
        titleIcon={BarChart3}
        titleAccentClassName="px-3 py-1 text-xs md:text-sm"
        titleClassName="text-xs md:text-sm"
        description="Feedback sentiment breakdown"
        contentClassName="space-y-4"
      >
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-500" />
              <span>Positive</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {sentimentCounts.positive}
              </span>
              <span>({pct(sentimentCounts.positive)}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Neutral</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {sentimentCounts.neutral}
              </span>
              <span>({pct(sentimentCounts.neutral)}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-red-500" />
              <span>Negative</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {sentimentCounts.negative}
              </span>
              <span>({pct(sentimentCounts.negative)}%)</span>
            </div>
          </div>
        </div>
      </FeaturePanelCard>

      <FeaturePanelCard
        title="Resolution Status"
        titleStyle="accent"
        titleIcon={CheckCircle}
        titleAccentClassName="px-3 py-1 text-xs md:text-sm"
        titleClassName="text-xs md:text-sm"
        description="Feedback resolution tracking"
        contentClassName="space-y-4"
      >
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Resolved</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {feedback.filter((f) => f.resolved).length}
              </span>
              <span>({pct(feedback.filter((f) => f.resolved).length)}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>Pending</span>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {feedback.filter((f) => !f.resolved).length}
              </span>
              <span>({pct(feedback.filter((f) => !f.resolved).length)}%)</span>
            </div>
          </div>

          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary"
              style={{
                width: `${pct(feedback.filter((f) => f.resolved).length)}%`,
              }}
            />
          </div>
        </div>
      </FeaturePanelCard>
    </div>
  );
};
