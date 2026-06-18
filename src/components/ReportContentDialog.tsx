import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Flag } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  contentType: 'public_journey' | 'forum_post' | 'forum_comment' | 'success_story';
  contentId: string;
  triggerLabel?: string;
  variant?: 'outline' | 'ghost' | 'destructive';
}

const REASONS = [
  'Spam or scam',
  'Harassment or hate speech',
  'Sexual or graphic content',
  'Self-harm or dangerous content',
  'Impersonation',
  'Other',
];

export const ReportContentDialog = ({ contentType, contentId, triggerLabel = 'Report', variant = 'ghost' }: Props) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!reason) {
      toast.error('Please choose a reason');
      return;
    }
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please sign in to report content');
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.from('content_reports').insert({
      reporter_user_id: user.id,
      content_type: contentType,
      content_id: contentId,
      reason,
      description: description.trim().slice(0, 1000) || null,
      status: 'pending',
    });
    setSubmitting(false);
    if (error) {
      toast.error('Could not submit report');
      return;
    }
    toast.success('Report submitted. Our team will review it.');
    setOpen(false);
    setReason('');
    setDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm">
          <Flag className="h-4 w-4 mr-2" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Choose a reason" /></SelectTrigger>
              <SelectContent>
                {REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Details (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              placeholder="Tell us more..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
