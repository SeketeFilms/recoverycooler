import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, DollarSign, Heart, Target, Brain, TrendingUp } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

const RebuildLife = () => {
  const navigate = useNavigate();

  const modules = [
    {
      icon: DollarSign,
      title: 'Finance Recovery',
      description: 'Rebuild your financial health with budgeting tools and debt management strategies',
      color: 'from-green-500/20 to-green-600/20',
      borderColor: 'border-green-500/30',
    },
    {
      icon: Heart,
      title: 'Relationship Healing',
      description: 'Learn to rebuild trust and create healthier connections with loved ones',
      color: 'from-rose-500/20 to-rose-600/20',
      borderColor: 'border-rose-500/30',
    },
    {
      icon: TrendingUp,
      title: 'Build New Habits',
      description: 'Replace old patterns with positive routines that support your recovery',
      color: 'from-blue-500/20 to-blue-600/20',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: Target,
      title: 'Set Future Goals',
      description: 'Create a vision for your future and develop actionable steps to get there',
      color: 'from-purple-500/20 to-purple-600/20',
      borderColor: 'border-purple-500/30',
    },
    {
      icon: Brain,
      title: 'Mental Health Support',
      description: 'Access resources and techniques for managing stress, anxiety, and emotions',
      color: 'from-amber-500/20 to-amber-600/20',
      borderColor: 'border-amber-500/30',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-28">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Rebuild My Life
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tools and guidance for your recovery journey
            </p>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-center leading-relaxed">
              Recovery is not just about stopping—it's about rebuilding. Here are resources to help you create a life you're proud of.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {modules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card
                key={index}
                className={`bg-gradient-to-br ${module.color} ${module.borderColor} hover:scale-[1.02] transition-transform duration-300 cursor-pointer`}
                onClick={() => {
                  // TODO: Navigate to specific module when implemented
                }}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-background/50 backdrop-blur-sm">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="font-medium">Each module contains:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>Step-by-step guidance</li>
              <li>Practical exercises</li>
              <li>Progress tracking</li>
              <li>Professional resources</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
};

export default RebuildLife;
