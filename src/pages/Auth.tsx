import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import { z } from 'zod';
import { Progress } from '@/components/ui/progress';

// HTML entity encoding to prevent XSS in emails
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Rate limiting configuration
const RATE_LIMIT_KEY = 'auth_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface RateLimitData {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

function getRateLimitData(): RateLimitData {
  try {
    const data = localStorage.getItem(RATE_LIMIT_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // Ignore parse errors
  }
  return { attempts: 0, lastAttempt: 0, lockedUntil: null };
}

function setRateLimitData(data: RateLimitData): void {
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
}

function checkRateLimit(): { allowed: boolean; remainingTime?: number } {
  const data = getRateLimitData();
  const now = Date.now();
  
  // Check if locked out
  if (data.lockedUntil && now < data.lockedUntil) {
    return { allowed: false, remainingTime: Math.ceil((data.lockedUntil - now) / 1000 / 60) };
  }
  
  // Reset if lockout has expired
  if (data.lockedUntil && now >= data.lockedUntil) {
    setRateLimitData({ attempts: 0, lastAttempt: 0, lockedUntil: null });
    return { allowed: true };
  }
  
  return { allowed: true };
}

function recordFailedAttempt(): void {
  const data = getRateLimitData();
  const now = Date.now();
  
  data.attempts += 1;
  data.lastAttempt = now;
  
  if (data.attempts >= MAX_ATTEMPTS) {
    data.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
  
  setRateLimitData(data);
}

function resetRateLimit(): void {
  localStorage.removeItem(RATE_LIMIT_KEY);
}

// Password strength calculation
function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^a-zA-Z0-9]/.test(password)) score += 15;
  
  if (score < 40) return { score, label: 'Weak', color: 'bg-destructive' };
  if (score < 70) return { score, label: 'Fair', color: 'bg-yellow-500' };
  if (score < 90) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-green-500' };
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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);
  const rateLimitData = getRateLimitData();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const emailValidation = z.string().trim().email('Invalid email address').safeParse(email);
      if (!emailValidation.success) {
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast.success('Password reset email sent! Check your inbox.');
      setIsForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check rate limit for sign-in
    if (!isSignUp) {
      const rateCheck = checkRateLimit();
      if (!rateCheck.allowed) {
        toast.error(`Too many failed attempts. Please try again in ${rateCheck.remainingTime} minutes.`);
        return;
      }
    }
    
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
        
        resetRateLimit(); // Clear rate limit on successful signup
        toast.success('Account created! Welcome to RecoveryCooler');
        navigate('/home');
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          recordFailedAttempt();
          throw error;
        }
        resetRateLimit(); // Clear rate limit on successful login
        toast.success('Welcome back!');
        navigate('/home');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed';
      
      // Handle specific database errors
      if (errorMessage.includes('duplicate key') || errorMessage.includes('Database error')) {
        toast.error('This username is already taken. Please choose a different one.');
      } else if (errorMessage.includes('Invalid login credentials')) {
        const data = getRateLimitData();
        const remaining = MAX_ATTEMPTS - data.attempts;
        if (remaining > 0) {
          toast.error(`Invalid credentials. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before lockout.`);
        } else {
          toast.error('Account temporarily locked due to too many failed attempts.');
        }
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
            {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isForgotPassword 
              ? 'Enter your email to receive a reset link' 
              : isSignUp 
                ? 'Start your journey to mindful recovery' 
                : 'Breathe. Reflect. Regain Control.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setIsForgotPassword(false)}
              >
                Back to Sign In
              </Button>
            </form>
          ) : (
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {!isSignUp && (
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                      onClick={() => setIsForgotPassword(true)}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={8}
                />
                {isSignUp && password.length > 0 && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center gap-2">
                      <Progress value={passwordStrength.score} className="h-2 flex-1" />
                      <span className={`text-xs font-medium ${
                        passwordStrength.score < 40 ? 'text-destructive' : 
                        passwordStrength.score < 70 ? 'text-yellow-600' :
                        passwordStrength.score < 90 ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className={password.length >= 8 ? 'text-green-600' : ''}>
                        {password.length >= 8 ? '✓' : '○'} At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>
                        {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                      </li>
                      <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>
                        {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
                      </li>
                      <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>
                        {/[0-9]/.test(password) ? '✓' : '○'} One number
                      </li>
                      <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-600' : ''}>
                        {/[^a-zA-Z0-9]/.test(password) ? '✓' : '○'} One special character (optional)
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              {isSignUp && (
                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                  />
                  <label
                    htmlFor="terms"
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
              )}
              {!isSignUp && rateLimitData.lockedUntil && Date.now() < rateLimitData.lockedUntil && (
                <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Account locked. Try again in {Math.ceil((rateLimitData.lockedUntil - Date.now()) / 1000 / 60)} minutes.</span>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading || (isSignUp && !acceptedTerms)}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading}
                onClick={async () => {
                  const { error } = await lovable.auth.signInWithOAuth("google", {
                    redirect_uri: window.location.origin,
                  });
                  if (error) {
                    toast.error("Google sign-in failed");
                    console.error(error);
                  }
                }}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
