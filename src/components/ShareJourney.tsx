import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Share2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

const ShareJourney = () => {
  const [copied, setCopied] = useState(false);
  const appUrl = window.location.origin;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareMessage = encodeURIComponent(
    "I'm using RecoveryCooler to support my recovery journey. Check it out: " + appUrl
  );

  const shareLinks = [
    {
      name: 'Twitter/X',
      url: `https://twitter.com/intent/tweet?text=${shareMessage}`,
      color: 'hover:bg-blue-500/10'
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${appUrl}`,
      color: 'hover:bg-blue-600/10'
    },
    {
      name: 'WhatsApp',
      url: `https://wa.me/?text=${shareMessage}`,
      color: 'hover:bg-green-500/10'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Share Your Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Recovery is easier with support. Share this app with friends and family who might benefit.
        </p>

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                Link Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy App Link
              </>
            )}
          </Button>

          <div className="grid grid-cols-3 gap-2">
            {shareLinks.map((link) => (
              <Button
                key={link.name}
                variant="outline"
                size="sm"
                className={`${link.color} transition-colors`}
                onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
              >
                {link.name}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShareJourney;
