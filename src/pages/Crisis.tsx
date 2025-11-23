import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, Phone, Wind, Anchor, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';

interface CrisisResource {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  content: any;
}

const Crisis = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resources, setResources] = useState<CrisisResource[]>([]);
  const [addictionType, setAddictionType] = useState<string>('gambling');
  const [selectedResource, setSelectedResource] = useState<CrisisResource | null>(null);

  useEffect(() => {
    if (user) {
      loadUserAddictionType();
    }
  }, [user]);

  useEffect(() => {
    if (addictionType) {
      loadCrisisResources();
    }
  }, [addictionType]);

  const loadUserAddictionType = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('addiction_type')
        .eq('user_id', user!.id)
        .single();

      setAddictionType(data?.addiction_type || 'gambling');
    } catch (error) {
      console.error('Error loading addiction type:', error);
    }
  };

  const loadCrisisResources = async () => {
    try {
      const { data, error } = await supabase
        .from('crisis_resources')
        .select('*')
        .eq('addiction_type', addictionType);

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error loading crisis resources:', error);
      toast.error('Failed to load resources');
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'breathing':
        return <Wind className="h-6 w-6" />;
      case 'grounding':
        return <Anchor className="h-6 w-6" />;
      case 'emergency':
        return <Phone className="h-6 w-6" />;
      default:
        return <Activity className="h-6 w-6" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'breathing':
        return 'bg-blue-500/10 text-blue-500';
      case 'grounding':
        return 'bg-green-500/10 text-green-500';
      case 'emergency':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-purple-500/10 text-purple-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-500/5 via-background to-orange-500/5 pb-28">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Crisis Support</h1>
            <p className="text-sm text-muted-foreground">Immediate help when you need it</p>
          </div>
        </div>

        {/* SOS Alert */}
        <Card className="border-red-500/50 bg-red-500/5 gentle-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              Emergency? Get Help Now
            </CardTitle>
            <CardDescription>
              If you're in immediate danger or crisis, reach out to emergency services or a crisis hotline
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource) => (
            <Card 
              key={resource.id}
              className="cursor-pointer hover:shadow-lg transition-shadow gentle-fade-in"
              onClick={() => setSelectedResource(resource)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${getResourceColor(resource.resource_type)}`}>
                    {getResourceIcon(resource.resource_type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                    <CardDescription className="text-xs">
                      {resource.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Selected Resource Details */}
        {selectedResource && (
          <Card className="gentle-fade-in border-2 border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${getResourceColor(selectedResource.resource_type)}`}>
                    {getResourceIcon(selectedResource.resource_type)}
                  </div>
                  {selectedResource.title}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedResource(null)}>
                  Close
                </Button>
              </div>
              <CardDescription>{selectedResource.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedResource.content.steps && (
                <div>
                  <h3 className="font-semibold mb-3">Steps:</h3>
                  <ol className="space-y-2">
                    {selectedResource.content.steps.map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                          {idx + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {selectedResource.content.duration && (
                <p className="text-sm text-muted-foreground">
                  <strong>Duration:</strong> {selectedResource.content.duration}
                </p>
              )}

              {selectedResource.content.purpose && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm">
                    <strong>Purpose:</strong> {selectedResource.content.purpose}
                  </p>
                </div>
              )}

              {selectedResource.content.phone && (
                <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <a 
                      href={`tel:${selectedResource.content.phone}`}
                      className="text-lg font-semibold text-primary hover:underline"
                    >
                      {selectedResource.content.phone}
                    </a>
                  </div>
                  {selectedResource.content.text && (
                    <p className="text-sm text-muted-foreground">
                      {selectedResource.content.text}
                    </p>
                  )}
                  {selectedResource.content.available && (
                    <p className="text-sm text-muted-foreground">
                      Available: {selectedResource.content.available}
                    </p>
                  )}
                  {selectedResource.content.languages && (
                    <p className="text-sm text-muted-foreground">
                      Languages: {selectedResource.content.languages}
                    </p>
                  )}
                  {selectedResource.content.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedResource.content.description}
                    </p>
                  )}
                </div>
              )}

              <Button 
                onClick={() => setSelectedResource(null)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        )}

        {resources.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No crisis resources available</p>
            </CardContent>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Crisis;
