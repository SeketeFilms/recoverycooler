import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Shield, MapPin, Clock, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';

interface Trigger {
  id: string;
  trigger_name: string;
  trigger_category: string;
  severity: number;
  notes: string;
  created_at: string;
}

interface CopingStrategy {
  id: string;
  strategy_name: string;
  strategy_description: string;
  effectiveness_rating: number;
  times_used: number;
  created_at: string;
}

interface RiskyLocation {
  id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  radius: number;
  notes: string;
  is_active: boolean;
  created_at: string;
}

interface CheckInSchedule {
  id: string;
  check_in_time: string;
  frequency: string;
  message: string;
  is_enabled: boolean;
  created_at: string;
}

const RelapsePrevention = () => {
  const { user } = useAuth();
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  const [strategies, setStrategies] = useState<CopingStrategy[]>([]);
  const [locations, setLocations] = useState<RiskyLocation[]>([]);
  const [schedules, setSchedules] = useState<CheckInSchedule[]>([]);
  
  // New trigger state
  const [showNewTrigger, setShowNewTrigger] = useState(false);
  const [triggerName, setTriggerName] = useState('');
  const [triggerCategory, setTriggerCategory] = useState('emotional');
  const [triggerSeverity, setTriggerSeverity] = useState([5]);
  const [triggerNotes, setTriggerNotes] = useState('');
  
  // New strategy state
  const [showNewStrategy, setShowNewStrategy] = useState(false);
  const [strategyName, setStrategyName] = useState('');
  const [strategyDesc, setStrategyDesc] = useState('');
  
  // New location state
  const [showNewLocation, setShowNewLocation] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [locationNotes, setLocationNotes] = useState('');
  
  // New schedule state
  const [showNewSchedule, setShowNewSchedule] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [scheduleMessage, setScheduleMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    await Promise.all([
      loadTriggers(),
      loadStrategies(),
      loadLocations(),
      loadSchedules()
    ]);
  };

  const loadTriggers = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('personal_triggers')
      .select('*')
      .eq('user_id', user.id)
      .order('severity', { ascending: false });
    setTriggers(data || []);
  };

  const loadStrategies = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('coping_strategies')
      .select('*')
      .eq('user_id', user.id)
      .order('times_used', { ascending: false });
    setStrategies(data || []);
  };

  const loadLocations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('risky_locations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setLocations(data || []);
  };

  const loadSchedules = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('check_in_schedules')
      .select('*')
      .eq('user_id', user.id)
      .order('check_in_time', { ascending: true });
    setSchedules(data || []);
  };

  const handleAddTrigger = async () => {
    if (!user || !triggerName.trim()) {
      toast.error('Please enter a trigger name');
      return;
    }

    const { error } = await supabase
      .from('personal_triggers')
      .insert({
        user_id: user.id,
        trigger_name: triggerName,
        trigger_category: triggerCategory,
        severity: triggerSeverity[0],
        notes: triggerNotes,
      });

    if (error) {
      toast.error('Failed to add trigger');
    } else {
      toast.success('Trigger added successfully');
      setShowNewTrigger(false);
      resetTriggerForm();
      loadTriggers();
    }
  };

  const handleAddStrategy = async () => {
    if (!user || !strategyName.trim() || !strategyDesc.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const { error } = await supabase
      .from('coping_strategies')
      .insert({
        user_id: user.id,
        strategy_name: strategyName,
        strategy_description: strategyDesc,
      });

    if (error) {
      toast.error('Failed to add strategy');
    } else {
      toast.success('Coping strategy added successfully');
      setShowNewStrategy(false);
      setStrategyName('');
      setStrategyDesc('');
      loadStrategies();
    }
  };

  const handleAddLocation = async () => {
    if (!user || !locationName.trim()) {
      toast.error('Please enter a location name');
      return;
    }

    const { error } = await supabase
      .from('risky_locations')
      .insert({
        user_id: user.id,
        location_name: locationName,
        notes: locationNotes,
      });

    if (error) {
      toast.error('Failed to add location');
    } else {
      toast.success('Risky location added successfully');
      setShowNewLocation(false);
      setLocationName('');
      setLocationNotes('');
      loadLocations();
    }
  };

  const handleAddSchedule = async () => {
    if (!user || !scheduleTime) {
      toast.error('Please set a check-in time');
      return;
    }

    const { error } = await supabase
      .from('check_in_schedules')
      .insert({
        user_id: user.id,
        check_in_time: scheduleTime,
        frequency: scheduleFrequency,
        message: scheduleMessage,
      });

    if (error) {
      toast.error('Failed to add schedule');
    } else {
      toast.success('Check-in schedule added successfully');
      setShowNewSchedule(false);
      setScheduleTime('');
      setScheduleMessage('');
      loadSchedules();
    }
  };

  const handleDeleteTrigger = async (id: string) => {
    const { error } = await supabase
      .from('personal_triggers')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete trigger');
    } else {
      toast.success('Trigger deleted');
      loadTriggers();
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    const { error } = await supabase
      .from('coping_strategies')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete strategy');
    } else {
      toast.success('Strategy deleted');
      loadStrategies();
    }
  };

  const handleDeleteLocation = async (id: string) => {
    const { error } = await supabase
      .from('risky_locations')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete location');
    } else {
      toast.success('Location deleted');
      loadLocations();
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    const { error } = await supabase
      .from('check_in_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete schedule');
    } else {
      toast.success('Schedule deleted');
      loadSchedules();
    }
  };

  const resetTriggerForm = () => {
    setTriggerName('');
    setTriggerCategory('emotional');
    setTriggerSeverity([5]);
    setTriggerNotes('');
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return 'text-destructive';
    if (severity >= 5) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-32">
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Relapse Prevention
            </h1>
            <p className="text-muted-foreground mt-2">Stay ahead of triggers and build resilience</p>
          </div>
          <Shield className="h-12 w-12 text-primary" />
        </div>

        <Tabs defaultValue="triggers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="triggers">Triggers</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="schedules">Check-ins</TabsTrigger>
          </TabsList>

          <TabsContent value="triggers" className="space-y-4">
            <Dialog open={showNewTrigger} onOpenChange={setShowNewTrigger}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Trigger
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Personal Trigger</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Trigger Name</Label>
                    <Input
                      placeholder="e.g., Stress at work"
                      value={triggerName}
                      onChange={(e) => setTriggerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select value={triggerCategory} onValueChange={setTriggerCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emotional">Emotional</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="environmental">Environmental</SelectItem>
                        <SelectItem value="physical">Physical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Severity (1-10): {triggerSeverity[0]}</Label>
                    <Slider
                      value={triggerSeverity}
                      onValueChange={setTriggerSeverity}
                      min={1}
                      max={10}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Additional details..."
                      value={triggerNotes}
                      onChange={(e) => setTriggerNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleAddTrigger} className="w-full">
                    Add Trigger
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {triggers.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No triggers logged yet</p>
              </Card>
            ) : (
              triggers.map((trigger) => (
                <Card key={trigger.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{trigger.trigger_name}</h3>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                          {trigger.trigger_category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Severity: <span className={`font-bold ${getSeverityColor(trigger.severity)}`}>
                          {trigger.severity}/10
                        </span>
                      </p>
                      {trigger.notes && (
                        <p className="text-sm text-muted-foreground">{trigger.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteTrigger(trigger.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="strategies" className="space-y-4">
            <Dialog open={showNewStrategy} onOpenChange={setShowNewStrategy}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Coping Strategy
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Coping Strategy</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Strategy Name</Label>
                    <Input
                      placeholder="e.g., Deep breathing"
                      value={strategyName}
                      onChange={(e) => setStrategyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="How to use this strategy..."
                      value={strategyDesc}
                      onChange={(e) => setStrategyDesc(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <Button onClick={handleAddStrategy} className="w-full">
                    Add Strategy
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {strategies.length === 0 ? (
              <Card className="p-8 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No coping strategies yet</p>
              </Card>
            ) : (
              strategies.map((strategy) => (
                <Card key={strategy.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{strategy.strategy_name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {strategy.strategy_description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Used {strategy.times_used} times
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteStrategy(strategy.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="locations" className="space-y-4">
            <Dialog open={showNewLocation} onOpenChange={setShowNewLocation}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Risky Location
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Risky Location</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Location Name</Label>
                    <Input
                      placeholder="e.g., Casino downtown"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      placeholder="Why is this location risky?"
                      value={locationNotes}
                      onChange={(e) => setLocationNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleAddLocation} className="w-full">
                    Add Location
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {locations.length === 0 ? (
              <Card className="p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No risky locations tracked</p>
              </Card>
            ) : (
              locations.map((location) => (
                <Card key={location.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{location.location_name}</h3>
                      {location.notes && (
                        <p className="text-sm text-muted-foreground">{location.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteLocation(location.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <Dialog open={showNewSchedule} onOpenChange={setShowNewSchedule}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Check-in Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Check-in Schedule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Check-in Time</Label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Frequency</Label>
                    <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekdays">Weekdays</SelectItem>
                        <SelectItem value="weekends">Weekends</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reminder Message</Label>
                    <Textarea
                      placeholder="Optional reminder message..."
                      value={scheduleMessage}
                      onChange={(e) => setScheduleMessage(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <Button onClick={handleAddSchedule} className="w-full">
                    Add Schedule
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {schedules.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No check-in schedules set</p>
              </Card>
            ) : (
              schedules.map((schedule) => (
                <Card key={schedule.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">
                        {schedule.check_in_time} - {schedule.frequency}
                      </h3>
                      {schedule.message && (
                        <p className="text-sm text-muted-foreground">{schedule.message}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteSchedule(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default RelapsePrevention;
