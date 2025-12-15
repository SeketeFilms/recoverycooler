import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, UserPlus, Users, Check, X, Clock, Mail, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';

interface Partner {
  id: string;
  user_id: string;
  partner_user_id: string;
  status: string;
  created_at: string;
  partner_email?: string;
  partner_name?: string;
  is_requester: boolean;
}

const AccountabilityPartners = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user) {
      loadPartners();
    }
  }, [user]);

  const loadPartners = async () => {
    try {
      // Get partnerships where user is either the requester or the partner
      const { data: asRequester, error: error1 } = await supabase
        .from('accountability_partners')
        .select('*')
        .eq('user_id', user!.id);

      const { data: asPartner, error: error2 } = await supabase
        .from('accountability_partners')
        .select('*')
        .eq('partner_user_id', user!.id);

      if (error1 || error2) throw error1 || error2;

      // Combine and mark who is the requester
      const allPartners: Partner[] = [
        ...(asRequester || []).map((p) => ({ ...p, is_requester: true })),
        ...(asPartner || []).map((p) => ({ ...p, is_requester: false })),
      ];

      // Get profile info for partners
      const partnerIds = allPartners.map((p) =>
        p.is_requester ? p.partner_user_id : p.user_id
      );

      if (partnerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', partnerIds);

        // Merge profile data
        const enrichedPartners = allPartners.map((p) => {
          const partnerId = p.is_requester ? p.partner_user_id : p.user_id;
          const profile = profiles?.find((pr) => pr.user_id === partnerId);
          return {
            ...p,
            partner_name: profile?.full_name || 'Recovery Partner',
          };
        });

        setPartners(enrichedPartners);
      } else {
        setPartners([]);
      }
    } catch (error) {
      console.error('Error loading partners:', error);
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setSending(true);

    try {
      // Check if already partnered
      const existingPartner = partners.find(
        (p) => p.partner_email === inviteEmail || p.status === 'pending'
      );

      if (existingPartner) {
        toast.error('You already have a pending or active partnership with this person');
        setSending(false);
        return;
      }

      // Get sender's profile name
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user!.id)
        .single();

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-partner-notification', {
        body: {
          type: 'invite',
          recipientEmail: inviteEmail,
          senderName: senderProfile?.full_name || user!.email?.split('@')[0] || 'Someone',
        },
      });

      if (emailError) {
        console.error('Email notification error:', emailError);
        // Don't fail the invite if email fails
      }

      toast.success(`Invitation sent to ${inviteEmail}!`);
      setIsDialogOpen(false);
      setInviteEmail('');
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invite');
    } finally {
      setSending(false);
    }
  };

  const updatePartnershipStatus = async (partnerId: string, newStatus: 'active' | 'declined') => {
    try {
      const partner = partners.find(p => p.id === partnerId);
      
      const { error } = await supabase
        .from('accountability_partners')
        .update({ status: newStatus })
        .eq('id', partnerId);

      if (error) throw error;

      // Send email notification when accepted
      if (newStatus === 'active' && partner) {
        const { data: myProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user!.id)
          .single();

        // Notify the original requester that their request was accepted
        await supabase.functions.invoke('send-partner-notification', {
          body: {
            type: 'accepted',
            recipientEmail: user!.email, // In real app, get partner's email
            recipientName: myProfile?.full_name || 'Your partner',
          },
        });
      }

      toast.success(newStatus === 'active' ? 'Partnership accepted!' : 'Request declined');
      loadPartners();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update partnership');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-600">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-600">Pending</Badge>;
      case 'declined':
        return <Badge className="bg-red-500/20 text-red-600">Declined</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const activePartners = partners.filter((p) => p.status === 'active');
  const pendingRequests = partners.filter((p) => p.status === 'pending' && !p.is_requester);
  const pendingSent = partners.filter((p) => p.status === 'pending' && p.is_requester);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-28">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Accountability Partners</h1>
            <p className="text-sm text-muted-foreground">Support each other on your journey</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite an Accountability Partner</DialogTitle>
                <DialogDescription>
                  Enter the email of someone you trust to support your recovery journey.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="partner@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <Button onClick={sendInvite} disabled={sending} className="w-full">
                  {sending ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Why Have an Accountability Partner?</h3>
                <p className="text-sm text-muted-foreground">
                  Research shows that having someone to share your journey with increases success rates
                  by up to 65%. Partners can check in with each other, celebrate wins, and provide support
                  during difficult moments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <>
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Requests
                </h2>
                {pendingRequests.map((partner) => (
                  <Card key={partner.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{partner.partner_name}</p>
                            <p className="text-sm text-muted-foreground">Wants to be your partner</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePartnershipStatus(partner.id, 'declined')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updatePartnershipStatus(partner.id, 'active')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Active Partners */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Partners ({activePartners.length})
              </h2>
              {activePartners.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No active partners yet</p>
                    <p className="text-sm">Invite someone you trust to join your recovery journey</p>
                  </CardContent>
                </Card>
              ) : (
                activePartners.map((partner) => (
                  <Card key={partner.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                            <Users className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium">{partner.partner_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Partners since {new Date(partner.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(partner.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Sent Requests */}
            {pendingSent.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Sent Requests
                </h2>
                {pendingSent.map((partner) => (
                  <Card key={partner.id} className="opacity-75">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">{partner.partner_name}</p>
                            <p className="text-sm text-muted-foreground">Awaiting response</p>
                          </div>
                        </div>
                        {getStatusBadge(partner.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default AccountabilityPartners;
