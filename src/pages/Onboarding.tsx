import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CountrySelector } from '@/components/CountrySelector';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';
import { z } from 'zod';

const onboardingSchema = z.object({
  fullName: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'\-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  country: z.string().length(2, 'Invalid country code'),
  addictionType: z.union([z.literal('gambling'), z.literal('alcohol'), z.literal('pornography')])
});

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('US');
  const [addictionType, setAddictionType] = useState<'gambling' | 'alcohol' | 'pornography'>('gambling');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in first');
      navigate('/auth');
      return;
    }

    // Validate form data
    const validation = onboardingSchema.safeParse({
      fullName: fullName.trim(),
      country,
      addictionType
    });

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast.error(firstError.message);
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: validation.data.fullName,
        country: validation.data.country,
        addiction_type: validation.data.addictionType,
      })
      .eq('user_id', user.id);

    setIsLoading(false);

    if (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to save your information');
      return;
    }

    toast.success('Welcome! Your profile has been created');
    navigate('/onboarding/tutorial');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-6">
      <Card className="w-full max-w-md gentle-fade-in">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2"
                required
              />
            </div>
            
            <div>
              <Label>Country</Label>
              <CountrySelector value={country} onValueChange={setCountry} />
            </div>

            <div>
              <Label className="text-base font-semibold">I'm seeking help with</Label>
              <RadioGroup 
                value={addictionType} 
                onValueChange={(value) => setAddictionType(value as 'gambling' | 'alcohol' | 'pornography')} 
                className="mt-3 space-y-3"
              >
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="gambling" id="gambling" />
                  <Label htmlFor="gambling" className="cursor-pointer flex-1 font-normal">
                    Gambling Addiction
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="alcohol" id="alcohol" />
                  <Label htmlFor="alcohol" className="cursor-pointer flex-1 font-normal">
                    Alcohol Addiction
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
                  <RadioGroupItem value="pornography" id="pornography" />
                  <Label htmlFor="pornography" className="cursor-pointer flex-1 font-normal">
                    Pornography Addiction
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="onboarding-terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
              />
              <label
                htmlFor="onboarding-terms"
                className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
              >
                I agree to the{' '}
                <Link to="/terms-of-service" className="text-primary hover:underline" target="_blank">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link to="/privacy-policy" className="text-primary hover:underline" target="_blank">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading || !acceptedTerms}>
              {isLoading ? 'Saving...' : 'Complete Setup'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default Onboarding;
