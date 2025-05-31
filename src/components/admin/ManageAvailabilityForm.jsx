import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CalendarPlus, PlusCircle, Loader2 } from 'lucide-react';

const ManageAvailabilityForm = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [slots, setSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day_of_week: '1', 
    start_time: '09:00',
    end_time: '17:00',
    duration_minutes: 60,
    price: 50.00,
    currency: 'USD',
    is_active: true,
    buffer_time_minutes: 0,
  });
  const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);

  const daysOfWeek = [
    { value: '0', label: 'Sunday' }, { value: '1', label: 'Monday' }, { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' }, { value: '4', label: 'Thursday' }, { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
  ];

  const fetchSlots = useCallback(async () => {
    if (!profile?.id) return;
    setIsLoadingSlots(true);
    try {
      const { data, error } = await supabase
        .from('appointment_slots')
        .select('*')
        .eq('admin_profile_id', profile.id)
        .order('day_of_week')
        .order('start_time');
      if (error) throw error;
      setSlots(data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error fetching slots', description: error.message });
    } finally {
      setIsLoadingSlots(false);
    }
  }, [profile?.id, toast]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const handleSlotInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSlot(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value),
    }));
  };
  
  const handleSlotSelectChange = (name, value) => {
     setNewSlot(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!profile?.id) {
        toast({variant: 'destructive', title: 'Error', description: 'Admin profile not found.'});
        return;
    }
    setIsSubmittingSlot(true);
    try {
      const slotToInsert = {
        ...newSlot,
        admin_profile_id: profile.id,
        day_of_week: parseInt(newSlot.day_of_week),
        duration_minutes: parseInt(newSlot.duration_minutes),
        buffer_time_minutes: parseInt(newSlot.buffer_time_minutes) || 0,
      };
      const { error } = await supabase.from('appointment_slots').insert(slotToInsert);
      if (error) throw error;
      toast({ title: 'Slot Added!', description: 'New availability slot created.' });
      fetchSlots(); 
      setNewSlot({ day_of_week: '1', start_time: '09:00', end_time: '17:00', duration_minutes: 60, price: 50.00, currency: 'USD', is_active: true, buffer_time_minutes: 0 });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error adding slot', description: error.message });
    } finally {
      setIsSubmittingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm("Are you sure you want to delete this slot?")) return;
    try {
        const { error } = await supabase.from('appointment_slots').delete().eq('id', slotId);
        if (error) throw error;
        toast({ title: 'Slot Deleted', description: 'Availability slot removed.'});
        fetchSlots();
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error deleting slot', description: error.message });
    }
  };
  
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="glassmorphism-card">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary"><CalendarPlus className="mr-2 h-6 w-6" /> Manage Availability</CardTitle>
        <CardDescription>Define your weekly recurring appointment slots.</CardDescription>
      </CardHeader>
      <form onSubmit={handleAddSlot}>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><Label htmlFor="day_of_week">Day of Week</Label>
              <Select name="day_of_week" value={newSlot.day_of_week} onValueChange={(val) => handleSlotSelectChange('day_of_week', val)}>
                <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                <SelectContent>{daysOfWeek.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="start_time">Start Time</Label><Input type="time" name="start_time" value={newSlot.start_time} onChange={handleSlotInputChange} required /></div>
            <div><Label htmlFor="end_time">End Time</Label><Input type="time" name="end_time" value={newSlot.end_time} onChange={handleSlotInputChange} required /></div>
            <div><Label htmlFor="duration_minutes">Duration (min)</Label><Input type="number" name="duration_minutes" value={newSlot.duration_minutes} onChange={handleSlotInputChange} required min="15"/></div>
            <div><Label htmlFor="price">Price</Label><Input type="number" name="price" step="0.01" value={newSlot.price} onChange={handleSlotInputChange} /></div>
            <div><Label htmlFor="currency">Currency</Label><Input type="text" name="currency" value={newSlot.currency} onChange={handleSlotInputChange} maxLength="3" placeholder="USD" /></div>
            <div><Label htmlFor="buffer_time_minutes">Buffer Time (min)</Label><Input type="number" name="buffer_time_minutes" value={newSlot.buffer_time_minutes} onChange={handleSlotInputChange} min="0"/></div>
            <div className="flex items-end"><Label className="flex items-center"><Input type="checkbox" name="is_active" checked={newSlot.is_active} onChange={handleSlotInputChange} className="mr-2"/> Active</Label></div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmittingSlot}>
            {isSubmittingSlot ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />} Add Slot
          </Button>
        </CardFooter>
      </form>

      <CardContent>
        <h3 className="text-lg font-semibold mt-6 mb-3">Current Availability Slots</h3>
        {isLoadingSlots ? <Loader2 className="animate-spin"/> : slots.length === 0 ? <p>No slots defined yet.</p> : (
          <ul className="space-y-2">
            {slots.map(slot => (
              <li key={slot.id} className="p-3 border rounded-md flex justify-between items-center bg-muted/50">
                <div>
                    <span className="font-semibold">{daysOfWeek.find(d => d.value === slot.day_of_week.toString())?.label}</span>: {formatTime(slot.start_time)} - {formatTime(slot.end_time)} ({slot.duration_minutes} min)
                    <br/>Price: {slot.price} {slot.currency} {slot.is_active ? <span className="text-green-500">(Active)</span> : <span className="text-red-500">(Inactive)</span>}
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteSlot(slot.id)}>Delete</Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageAvailabilityForm;