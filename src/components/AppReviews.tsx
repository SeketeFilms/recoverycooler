import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  is_anonymous: boolean;
  created_at: string;
}

const AppReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    loadReviews();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('app-reviews')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_reviews'
        },
        () => {
          loadReviews();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('app_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setReviews(data);
      if (user) {
        const existing = data.find(r => r.user_id === user.id);
        setUserReview(existing || null);
      }
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    setSubmitting(true);
    
    if (userReview) {
      // Update existing review
      const { error } = await supabase
        .from('app_reviews')
        .update({
          rating,
          review_text: reviewText || null,
          is_anonymous: isAnonymous
        })
        .eq('id', userReview.id);

      if (error) {
        toast.error('Failed to update review');
      } else {
        toast.success('Review updated!');
        setShowForm(false);
      }
    } else {
      // Create new review
      const { error } = await supabase
        .from('app_reviews')
        .insert({
          user_id: user.id,
          rating,
          review_text: reviewText || null,
          is_anonymous: isAnonymous
        });

      if (error) {
        toast.error('Failed to submit review');
      } else {
        toast.success('Thank you for your review!');
        setShowForm(false);
        setReviewText('');
        setRating(5);
      }
    }
    
    setSubmitting(false);
  };

  const openEditForm = () => {
    if (userReview) {
      setRating(userReview.rating);
      setReviewText(userReview.review_text || '');
      setIsAnonymous(userReview.is_anonymous);
    }
    setShowForm(true);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <Card className="bg-gradient-to-br from-accent/10 via-background to-primary/5 border-accent/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg">
            <MessageSquare className="w-5 h-5 text-accent" />
            App Reviews
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{averageRating}</span>
            <span className="text-muted-foreground">({reviews.length})</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Review Button */}
        {!showForm && (
          <Button
            variant="outline"
            className="w-full"
            onClick={openEditForm}
          >
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </Button>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="space-y-4 p-4 bg-card rounded-lg border">
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Your Review (optional)</Label>
              <Textarea
                placeholder="Share your experience with the app..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <Label htmlFor="anonymous" className="text-sm">Post anonymously</Label>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={submitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting...' : userReview ? 'Update' : 'Submit'}
              </Button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="p-3 bg-card rounded-lg border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(review.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                {review.review_text && (
                  <p className="text-sm">{review.review_text}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {review.is_anonymous ? 'Anonymous' : `User ${review.user_id.slice(0, 8)}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppReviews;
