import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Copy, Check, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ShareJourney = () => {
  const [copied, setCopied] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    supabase
      .from('public_journeys')
      .select('slug, is_public')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSlug(data.slug);
          setIsPublic(data.is_public);
        }
      });
  }, [user]);

  const url = slug ? `${window.location.origin}/journey/${slug}` : window.location.origin;
  const shareMessage = encodeURIComponent(
    `Follow my recovery journey on RecoveryCooler: ${url}`
  );

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const shareLinks = [
    { name: 'WhatsApp', url: `https://wa.me/?text=${shareMessage}` },
    { name: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { name: 'X / Twitter', url: `https://twitter.com/intent/tweet?text=${shareMessage}` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share My Recovery Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!slug || !isPublic ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {slug
                ? 'Your journey page is set up but currently private. Make it public to share.'
                : 'Set up your public journey page to inspire others.'}
            </p>
            <Button className="w-full" onClick={() => navigate('/share-settings')}>
              <Settings className="h-4 w-4 mr-2" />
              {slug ? 'Manage journey' : 'Set up my journey'}
            </Button>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground break-all bg-muted rounded p-2">{url}</p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleCopyLink}>
                {copied ? <><Check className="h-4 w-4 text-primary" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy link</>}
              </Button>
              <div className="grid grid-cols-3 gap-2">
                {shareLinks.map((link) => (
                  <Button
                    key={link.name}
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                  >
                    {link.name}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/share-settings')}>
                <Settings className="h-4 w-4 mr-2" /> Manage page
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ShareJourney;
