import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, MapPin, Plus, Trash2, AlertTriangle, Navigation, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';

interface RiskyLocation {
  id: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  radius: number;
  is_active: boolean;
  notes: string | null;
}

const LocationAlerts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [locations, setLocations] = useState<RiskyLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [watchingLocation, setWatchingLocation] = useState(false);
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);

  // New location form
  const [newLocation, setNewLocation] = useState({
    name: '',
    radius: 200,
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadLocations();
    }
  }, [user]);

  useEffect(() => {
    // Check if geolocation is supported
    if ('geolocation' in navigator && watchingLocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentPosition(position);
          checkProximity(position);
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { enableHighAccuracy: true, maximumAge: 30000 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [watchingLocation, locations]);

  const loadLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('risky_locations')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const checkProximity = (position: GeolocationPosition) => {
    const activeLocations = locations.filter((l) => l.is_active && l.latitude && l.longitude);

    for (const location of activeLocations) {
      const distance = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        location.latitude!,
        location.longitude!
      );

      if (distance <= location.radius) {
        // Within risky zone
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⚠️ Recovery Alert', {
            body: `You're near ${location.location_name}. Stay strong! Consider using a coping strategy.`,
            icon: '/icon-192.png',
          });
        }
        toast.warning(`You're near ${location.location_name}. Stay strong!`, {
          duration: 10000,
          action: {
            label: 'Coping Tools',
            onClick: () => navigate('/relapse-prevention'),
          },
        });
      }
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
      });
    });
  };

  const addLocation = async () => {
    if (!newLocation.name.trim()) {
      toast.error('Please enter a location name');
      return;
    }

    setSaving(true);

    try {
      let latitude: number | null = null;
      let longitude: number | null = null;

      try {
        const position = await getCurrentLocation();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch {
        toast.info('Location saved without GPS coordinates. You can update them later.');
      }

      const { error } = await supabase.from('risky_locations').insert({
        user_id: user!.id,
        location_name: newLocation.name.trim(),
        latitude,
        longitude,
        radius: newLocation.radius,
        notes: newLocation.notes.trim() || null,
        is_active: true,
      });

      if (error) throw error;

      toast.success('Risky location added');
      setIsDialogOpen(false);
      setNewLocation({ name: '', radius: 200, notes: '' });
      loadLocations();
    } catch (error) {
      console.error('Error adding location:', error);
      toast.error('Failed to add location');
    } finally {
      setSaving(false);
    }
  };

  const toggleLocation = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('risky_locations')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      loadLocations();
    } catch (error) {
      console.error('Error toggling location:', error);
      toast.error('Failed to update location');
    }
  };

  const deleteLocation = async (id: string) => {
    try {
      const { error } = await supabase.from('risky_locations').delete().eq('id', id);

      if (error) throw error;
      toast.success('Location removed');
      loadLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled');
      }
    }
  };

  const startWatching = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    requestNotificationPermission();
    setWatchingLocation(true);
    toast.success('Location monitoring started');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-28">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4 gentle-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Location Alerts</h1>
            <p className="text-sm text-muted-foreground">Get warned near risky places</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Risky Location</DialogTitle>
                <DialogDescription>
                  Mark a place you want to be warned about when approaching.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Location Name</Label>
                  <Input
                    placeholder="e.g., Casino on Main St"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alert Radius: {newLocation.radius}m</Label>
                  <Slider
                    value={[newLocation.radius]}
                    onValueChange={([v]) => setNewLocation({ ...newLocation, radius: v })}
                    min={50}
                    max={1000}
                    step={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll be alerted when within this distance
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Notes (optional)</Label>
                  <Input
                    placeholder="Why this place is risky for you"
                    value={newLocation.notes}
                    onChange={(e) => setNewLocation({ ...newLocation, notes: e.target.value })}
                  />
                </div>
                <Button onClick={addLocation} disabled={saving} className="w-full">
                  {saving ? 'Adding...' : 'Add Location (Use Current GPS)'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Monitoring Status */}
        <Card className={watchingLocation ? 'border-green-500/50 bg-green-500/5' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-full ${
                    watchingLocation ? 'bg-green-500/20' : 'bg-muted'
                  }`}
                >
                  <Navigation
                    className={`h-6 w-6 ${watchingLocation ? 'text-green-500' : ''}`}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">Location Monitoring</h3>
                  <p className="text-sm text-muted-foreground">
                    {watchingLocation
                      ? 'Active - You will be alerted near risky locations'
                      : 'Inactive - Start to receive proximity alerts'}
                  </p>
                </div>
              </div>
              <Button
                variant={watchingLocation ? 'secondary' : 'default'}
                onClick={() =>
                  watchingLocation ? setWatchingLocation(false) : startWatching()
                }
              >
                {watchingLocation ? 'Stop' : 'Start'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-destructive/20">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">How It Works</h3>
                <p className="text-sm text-muted-foreground">
                  Add locations that trigger your urges (casinos, bars, etc.). When you're near
                  these places, you'll receive an alert with coping tools. Your location data
                  stays on your device and is never shared.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locations List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Marked Locations ({locations.length})
          </h2>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : locations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No risky locations added yet</p>
                <p className="text-sm">Add places you want to be warned about</p>
              </CardContent>
            </Card>
          ) : (
            locations.map((location) => (
              <Card key={location.id} className={!location.is_active ? 'opacity-60' : ''}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          location.is_active ? 'bg-destructive/20' : 'bg-muted'
                        }`}
                      >
                        <MapPin
                          className={`h-5 w-5 ${
                            location.is_active ? 'text-destructive' : ''
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{location.location_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Alert radius: {location.radius}m
                        </p>
                        {location.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{location.notes}</p>
                        )}
                        {!location.latitude && (
                          <p className="text-xs text-yellow-600 mt-1">No GPS coordinates set</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={location.is_active}
                        onCheckedChange={(checked) => toggleLocation(location.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteLocation(location.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default LocationAlerts;
