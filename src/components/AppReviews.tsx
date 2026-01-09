import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, MessageSquare, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
interface Review {
  id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  is_anonymous: boolean;
  created_at: string;
  profile_name?: string;
}

const AppReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    loadReviews();
    
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
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('app_reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (reviewsError || !reviewsData) {
      setLoading(false);
      return;
    }

    // Fetch profiles for all reviews to show real names
    const allUserIds = reviewsData.map(r => r.user_id);
    let profilesMap: Record<string, string> = {};
    
    if (allUserIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, username, full_name')
        .in('user_id', allUserIds);

      if (profilesData) {
        profilesData.forEach((profile) => {
          const displayName = profile.username || profile.full_name || null;
          if (displayName) {
            profilesMap[profile.user_id] = displayName;
          }
        });
      }
    }

    const reviewsWithNames = reviewsData.map(review => ({
      ...review,
      profile_name: profilesMap[review.user_id]
    }));

    setReviews(reviewsWithNames);
    if (user) {
      const existing = reviewsWithNames.find(r => r.user_id === user.id);
      setUserReview(existing || null);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to leave a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    
    if (userReview) {
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
        setRating(0);
        setIsAnonymous(false);
      }
    }
    
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!user || !userReview) return;

    const { error } = await supabase
      .from('app_reviews')
      .delete()
      .eq('id', userReview.id);

    if (error) {
      toast.error('Failed to delete review');
    } else {
      toast.success('Review deleted');
      setUserReview(null);
      setShowForm(false);
      setRating(0);
      setReviewText('');
      setIsAnonymous(false);
    }
  };

  const openEditForm = () => {
    if (userReview) {
      setRating(userReview.rating);
      setReviewText(userReview.review_text || '');
      setIsAnonymous(userReview.is_anonymous || false);
    } else {
      setRating(0);
      setReviewText('');
      setIsAnonymous(false);
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
              <Label>Rating <span className="text-destructive">*</span></Label>
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
              {rating === 0 && (
                <p className="text-xs text-muted-foreground">Tap a star to rate</p>
              )}
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked === true)}
              />
              <Label htmlFor="anonymous" className="text-sm cursor-pointer">
                Post anonymously
              </Label>
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
                disabled={submitting || rating === 0}
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting...' : userReview ? 'Update' : 'Submit'}
              </Button>
            </div>

            {userReview && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete My Review
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Review</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your review? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
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
                  {review.is_anonymous ? 'Anonymous' : (review.profile_name || `User ${review.user_id.slice(0, 8)}`)}
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
