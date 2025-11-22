import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

// HTML entity encoding to prevent XSS in emails
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const authSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
  fullName: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
  username: z.string().trim().min(3, 'Username must be at least 3 characters').max(50, 'Username too long').optional(),
  gender: z.string().trim().max(50, 'Gender too long').optional(),
});

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      const validationResult = authSchema.safeParse({
        email,
        password,
        fullName: isSignUp ? fullName : undefined,
        username: isSignUp ? username : undefined,
        gender: isSignUp ? gender : undefined,
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast.error(firstError.message);
        setLoading(false);
        return;
      }

      if (isSignUp) {
        const { error } = await signUp(email, password, {
          full_name: fullName,
          username,
          gender,
        });
        if (error) throw error;
        
        // Send welcome email
        try {
          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-email', {
            body: {
              to: email,
              subject: 'Welcome to RecoveryCooler - Your Journey to Recovery Starts Here',
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #6366f1; font-size: 32px; margin-bottom: 10px;">RecoveryCooler</h1>
                    <p style="color: #666; font-size: 18px;">Welcome to Your Journey</p>
                  </div>
                  
                  <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px;">
                    <h2 style="color: #1e40af; margin-top: 0;">Welcome, ${escapeHtml(fullName)}!</h2>
                    <p style="color: #334155; line-height: 1.6; font-size: 16px;">
                      We're honored that you've chosen to take this brave step with RecoveryCooler. Recovery is not about perfection—it's about progress, one mindful moment at a time.
                    </p>
                  </div>
                  
                  <div style="margin-bottom: 30px;">
                    <h3 style="color: #1e40af; margin-bottom: 15px;">What Makes RecoveryCooler Different?</h3>
                    <ul style="color: #334155; line-height: 1.8; font-size: 15px;">
                      <li><strong>Guided Breathing Exercises:</strong> Calm your mind when urges strike with our proven breathing techniques</li>
                      <li><strong>Spending Tracker:</strong> Set daily limits and track your progress with compassion, not judgment</li>
                      <li><strong>Self-Exclusion Tools:</strong> Take control by blocking access to gambling sites that trigger you</li>
                      <li><strong>24/7 Support Resources:</strong> You're never alone—immediate crisis support is always available</li>
                    </ul>
                  </div>
                  
                  <div style="background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; border-radius: 8px; margin-bottom: 30px;">
                    <p style="color: #92400e; margin: 0; font-size: 15px; line-height: 1.6;">
                      <strong>Remember:</strong> Every moment you choose calm over chaos is a victory. You are stronger than the urge. You are not alone in this journey.
                    </p>
                  </div>
                  
                  <div style="text-align: center; margin-top: 40px;">
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                      Need help? Visit our support resources anytime.<br>
                      Questions? Reply to this email—we're here for you.
                    </p>
                    <p style="color: #94a3b8; font-size: 13px; margin-top: 20px;">
                      With compassion and support,<br>
                      <strong>The RecoveryCooler Team</strong>
                    </p>
                  </div>
                </div>
              `
            }
          });
          
          if (emailError) {
            console.error('Failed to send welcome email:', emailError);
          }
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
        }
        
        toast.success('Account created! Welcome to RecoveryCooler');
        navigate('/home');
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/home');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed';
      
      // Handle specific database errors
      if (errorMessage.includes('duplicate key') || errorMessage.includes('Database error')) {
        toast.error('This username is already taken. Please choose a different one.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-4">
      <Card className="w-full max-w-md gentle-fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span className="text-3xl">🧘</span>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSignUp ? 'Start your journey to mindful recovery' : 'Breathe. Reflect. Regain Control.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Choose a username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender (Optional)</Label>
                  <Input
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    placeholder="Your gender"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
