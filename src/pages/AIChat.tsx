import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import AIChat from '@/components/AIChat';
import BottomNav from '@/components/BottomNav';

const AIChatPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-28 flex flex-col">
      <div className="max-w-2xl mx-auto p-6 space-y-6 flex-1 flex flex-col w-full">
        <div className="flex items-center gap-4 gentle-fade-in flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Recovery Assistant</h1>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          <AIChat />
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default AIChatPage;
