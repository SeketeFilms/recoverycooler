import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content after a brief delay for splash effect
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (!loading && user) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-background to-accent/20 p-6">
      {/* Animated Logo */}
      <div 
        className={`transition-all duration-1000 ease-out ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto animate-pulse">
          <span className="text-5xl">🧘</span>
        </div>
      </div>

      {/* App Name */}
      <h1 
        className={`text-4xl font-bold text-foreground mb-2 text-center transition-all duration-1000 delay-200 ease-out ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        RecoveryCooler
      </h1>

      {/* Tagline */}
      <p 
        className={`text-lg text-muted-foreground text-center mb-8 max-w-xs transition-all duration-1000 delay-300 ease-out ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        Breathe. Reflect. Regain Control.
      </p>

      {/* Features */}
      <div 
        className={`flex flex-wrap justify-center gap-3 mb-10 max-w-sm transition-all duration-1000 delay-400 ease-out ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {['Guided Breathing', 'Progress Tracking', 'Community Support', '24/7 Resources'].map((feature, i) => (
          <span 
            key={feature} 
            className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full"
          >
            {feature}
          </span>
        ))}
      </div>

      {/* CTA Buttons */}
      <div 
        className={`w-full max-w-xs space-y-3 transition-all duration-1000 delay-500 ease-out ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <Button 
          size="lg" 
          className="w-full text-lg py-6"
          onClick={() => navigate('/auth')}
        >
          Get Started
        </Button>
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => navigate('/auth')}
        >
          Already have an account? Sign in
        </Button>
      </div>

      {/* Footer */}
      <p 
        className={`text-xs text-muted-foreground mt-10 text-center transition-all duration-1000 delay-700 ease-out ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Your journey to recovery starts here
      </p>
    </div>
  );
};

export default Index;
