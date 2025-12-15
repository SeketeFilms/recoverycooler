import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WifiOff, Wind, Heart, Brain, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { offlineCache } from '@/lib/offlineCache';

const EMERGENCY_CONTACTS = [
  { name: 'National Problem Gambling Helpline', number: '1-800-522-4700' },
  { name: 'Crisis Text Line', text: 'Text HOME to 741741' },
  { name: 'SAMHSA National Helpline', number: '1-800-662-4357' },
];

const BREATHING_EXERCISES = [
  { name: '4-7-8 Breathing', steps: 'Inhale 4s → Hold 7s → Exhale 8s' },
  { name: 'Box Breathing', steps: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s' },
  { name: 'Deep Belly Breathing', steps: 'Slow inhale through nose → Expand belly → Slow exhale' },
];

const GROUNDING_TECHNIQUES = [
  '5-4-3-2-1: Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste',
  'Hold an ice cube and focus on the sensation',
  'Name 5 colors you can see around you',
  'Count backwards from 100 by 7s',
];

const OfflineAssistance = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('breathing');
  const cachedData = offlineCache.getUserData();

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-md mx-auto space-y-4">
        {/* Offline Header */}
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <WifiOff className="h-6 w-6 text-yellow-500" />
              <div>
                <h2 className="font-semibold text-foreground">You're Offline</h2>
                <p className="text-sm text-muted-foreground">
                  These tools are available without internet
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Streak Reminder */}
        {cachedData.progress && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Your current streak</p>
              <p className="text-3xl font-bold text-primary">{cachedData.progress.current_streak} days</p>
              <p className="text-xs text-muted-foreground mt-1">Keep going, {cachedData.profile?.full_name || 'you'}!</p>
            </CardContent>
          </Card>
        )}

        {/* Breathing Exercises */}
        <Card>
          <CardHeader 
            className="cursor-pointer py-3"
            onClick={() => toggleSection('breathing')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-base">Breathing Exercises</CardTitle>
              </div>
              {expandedSection === 'breathing' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
          {expandedSection === 'breathing' && (
            <CardContent className="pt-0 space-y-3">
              {BREATHING_EXERCISES.map((exercise, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-sm">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{exercise.steps}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Grounding Techniques */}
        <Card>
          <CardHeader 
            className="cursor-pointer py-3"
            onClick={() => toggleSection('grounding')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-base">Grounding Techniques</CardTitle>
              </div>
              {expandedSection === 'grounding' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
          {expandedSection === 'grounding' && (
            <CardContent className="pt-0 space-y-2">
              {GROUNDING_TECHNIQUES.map((technique, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm">{technique}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>

        {/* Saved Coping Strategies */}
        {cachedData.copingStrategies && cachedData.copingStrategies.length > 0 && (
          <Card>
            <CardHeader 
              className="cursor-pointer py-3"
              onClick={() => toggleSection('coping')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-base">Your Coping Strategies</CardTitle>
                </div>
                {expandedSection === 'coping' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardHeader>
            {expandedSection === 'coping' && (
              <CardContent className="pt-0 space-y-2">
                {cachedData.copingStrategies.map((strategy, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium text-sm">{strategy.strategy_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{strategy.strategy_description}</p>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        )}

        {/* Emergency Contacts */}
        <Card>
          <CardHeader 
            className="cursor-pointer py-3"
            onClick={() => toggleSection('emergency')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-500" />
                <CardTitle className="text-base">Emergency Contacts</CardTitle>
              </div>
              {expandedSection === 'emergency' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </CardHeader>
          {expandedSection === 'emergency' && (
            <CardContent className="pt-0 space-y-2">
              {EMERGENCY_CONTACTS.map((contact, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium text-sm">{contact.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {contact.number || contact.text}
                  </p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default OfflineAssistance;
