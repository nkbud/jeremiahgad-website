import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { CalendarCheck, Loader2, AlertTriangle, Clock, DollarSign, User, ArrowRight, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

// Helper to get dates for the next N days
const getNextNDays = (n) => {
  const days = [];
  for (let i = 0; i < n; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push(date);
  }
  return days;
};

const formatTimeForDisplay = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date(0, 0, 0, parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};


const BookAppointmentPage = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [availableSlots, setAvailableSlots] = useState([]); // Admin-defined general slots
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [generatedTimeSlots, setGeneratedTimeSlots] = useState([]); // Specific bookable instances
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null); // The specific datetime instance user picks
  const [selectedAdminSlot, setSelectedAdminSlot] = useState(null); // The original admin slot definition
  const [isBooking, setIsBooking] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

  const bookingDates = useMemo(() => getNextNDays(14), []); // Show availability for next 2 weeks

  // Fetch admin-defined general availability slots
  useEffect(() => {
    const fetchAdminSlots = async () => {
      setLoadingSlots(true);
      try {
        const { data, error } = await supabase
          .from('appointment_slots')
          .select('*, admin:profiles(id, full_name, avatar_url)')
          .eq('is_active', true);
        if (error) throw error;
        setAvailableSlots(data || []);
      } catch (err) {
        toast({ variant: "destructive", title: "Error", description: "Could not load available appointment slots." });
      } finally {
        setLoadingSlots(false);
      }
    };
    fetchAdminSlots();
  }, [toast]);

  // Generate specific bookable time slots for the selectedDate
  useEffect(() => {
    if (!selectedDate || availableSlots.length === 0) {
      setGeneratedTimeSlots([]);
      return;
    }

    const dayOfWeek = selectedDate.getDay(); // 0 for Sunday, ..., 6 for Saturday
    const relevantAdminSlots = availableSlots.filter(slot => slot.day_of_week === dayOfWeek);
    let newTimeSlots = [];

    const fetchBookedSlotsForDate = async () => {
        const dateString = selectedDate.toISOString().split('T')[0];
        const { data: existingBookings, error } = await supabase
            .from('bookings')
            .select('appointment_datetime, duration_minutes')
            .gte('appointment_datetime', `${dateString}T00:00:00.000Z`)
            .lt('appointment_datetime', `${dateString}T23:59:59.999Z`);

        if (error) {
            toast({ variant: "destructive", title: "Error checking existing bookings."});
            return [];
        }
        return existingBookings || [];
    };


    const generate = async () => {
        const existingBookings = await fetchBookedSlotsForDate();

        relevantAdminSlots.forEach(adminSlot => {
            const [startH, startM] = adminSlot.start_time.split(':').map(Number);
            const [endH, endM] = adminSlot.end_time.split(':').map(Number);

            let currentTime = new Date(selectedDate);
            currentTime.setHours(startH, startM, 0, 0);

            const endTime = new Date(selectedDate);
            endTime.setHours(endH, endM, 0, 0);
            
            while (currentTime < endTime) {
                const slotEndTime = new Date(currentTime.getTime() + adminSlot.duration_minutes * 60000);
                if (slotEndTime > endTime) break; // Slot extends beyond admin availability

                const isBooked = existingBookings.some(booking => {
                    const bookingStart = new Date(booking.appointment_datetime);
                    const bookingEnd = new Date(bookingStart.getTime() + booking.duration_minutes * 60000);
                    // Check for overlap
                    return (currentTime < bookingEnd && slotEndTime > bookingStart);
                });

                if (!isBooked) {
                    newTimeSlots.push({
                        start: new Date(currentTime),
                        end: slotEndTime,
                        adminSlotId: adminSlot.id, // Store original slot ID
                        price: adminSlot.price,
                        currency: adminSlot.currency,
                        duration: adminSlot.duration_minutes,
                        admin: adminSlot.admin
                    });
                }
                currentTime = new Date(slotEndTime.getTime() + (adminSlot.buffer_time_minutes || 0) * 60000);
            }
        });
        setGeneratedTimeSlots(newTimeSlots.sort((a,b) => a.start - b.start));
    };
    
    generate();

  }, [selectedDate, availableSlots, toast]);

  const handleDateChange = (dateIsoString) => {
    setSelectedDate(new Date(dateIsoString));
    setSelectedTimeSlot(null); // Reset selected time slot when date changes
  };

  const handleTimeSlotSelect = (timeSlot) => {
    if (!user) {
        toast({ title: "Authentication Required", description: "Please log in or sign up to book an appointment.", variant: "destructive"});
        // Optionally navigate to /auth page
        return;
    }
    setSelectedTimeSlot(timeSlot.start); // Store the specific start time Date object
    // Find the original admin slot that this timeSlot instance corresponds to
    const originalAdminSlot = availableSlots.find(s => s.id === timeSlot.adminSlotId);
    setSelectedAdminSlot(originalAdminSlot);
    setIsStripeModalOpen(true);
  };

  const handleConfirmBookingWithStripe = async () => {
    if (!selectedTimeSlot || !selectedAdminSlot || !user || !profile) return;
    
    setIsBooking(true);
    // THIS IS WHERE STRIPE INTEGRATION WILL GO
    // 1. Create a 'pending_payment' booking in your DB
    // 2. Call Supabase Edge Function to create Stripe Checkout Session
    // 3. Redirect user to Stripe Checkout
    // 4. Handle success/cancel with webhook or redirect URLs

    toast({
        title: "Stripe Integration Needed",
        description: "Please provide your Stripe Publishable Key and Price ID to enable payments. Booking not yet confirmed.",
        variant: "default",
        duration: 10000,
        action: <Button onClick={() => console.log("Stripe setup guide")}>Setup Guide</Button>
    });

    // For now, let's simulate a pending booking for UI demo purposes.
    // In a real scenario, this would happen AFTER Stripe setup.
    try {
        const { data, error } = await supabase.from('bookings').insert({
            user_profile_id: profile.id,
            admin_profile_id: selectedAdminSlot.admin.id,
            appointment_slot_id: selectedAdminSlot.id,
            appointment_datetime: selectedTimeSlot.toISOString(),
            duration_minutes: selectedAdminSlot.duration_minutes,
            price_at_booking: selectedAdminSlot.price,
            currency_at_booking: selectedAdminSlot.currency,
            status: 'pending_stripe_setup', // Special status
        }).select().single();

        if (error) throw error;

        toast({ title: "Booking Tentatively Noted", description: "Payment integration is pending. Your selected slot is noted."});
        setIsStripeModalOpen(false);
        setSelectedTimeSlot(null);
        setSelectedAdminSlot(null);
        // Re-fetch slots to reflect (even if tentative)
        const dayOfWeek = selectedDate.getDay();
        const relevantAdminSlots = availableSlots.filter(slot => slot.day_of_week === dayOfWeek);
        setGeneratedTimeSlots([]); // Force regeneration
    } catch(err) {
        toast({ variant: "destructive", title: "Error", description: "Could not note booking: " + err.message });
    } finally {
        setIsBooking(false);
    }
};

  if (authLoading || loadingSlots) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Appointments...</p>
      </div>
    );
  }


  return (
    <div className="space-y-12">
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 rounded-xl shadow-xl"
      >
        <CalendarCheck className="h-16 w-16 text-white mx-auto mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Book an Appointment</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          Schedule your consultation. Select a date and time that works for you.
        </p>
      </motion.section>

      <Card className="glassmorphism-card">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>Choose a date for your appointment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            onValueChange={handleDateChange}
            defaultValue={selectedDate.toISOString().split('T')[0]}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a date" />
            </SelectTrigger>
            <SelectContent>
              {bookingDates.map(date => (
                <SelectItem key={date.toISOString()} value={date.toISOString().split('T')[0]}>
                  {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card className="glassmorphism-card">
          <CardHeader>
            <CardTitle>Available Time Slots for {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</CardTitle>
            <CardDescription>Pick a time slot below. All times are in your local timezone.</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedTimeSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {generatedTimeSlots.map((slot, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="flex flex-col h-auto p-3 text-center items-center justify-center hover:bg-primary/10"
                    onClick={() => handleTimeSlotSelect(slot)}
                  >
                    <span className="text-lg font-semibold">{formatTimeForDisplay(slot.start.toTimeString().split(' ')[0])}</span>
                    <span className="text-xs text-muted-foreground">{slot.duration} min</span>
                     {slot.admin && <span className="text-xs mt-1 text-primary/80">with {slot.admin.full_name.split(' ')[0]}</span>}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No available slots for this date. Please try another day.</p>
            )}
          </CardContent>
        </Card>
      )}

        <Dialog open={isStripeModalOpen} onOpenChange={setIsStripeModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirm Appointment</DialogTitle>
                    {selectedTimeSlot && selectedAdminSlot && (
                        <DialogDescription>
                            You are about to book an appointment for:
                            <br/><strong>Date:</strong> {new Date(selectedTimeSlot).toLocaleDateString()}
                            <br/><strong>Time:</strong> {formatTimeForDisplay(new Date(selectedTimeSlot).toTimeString().split(' ')[0])}
                            <br/><strong>Duration:</strong> {selectedAdminSlot.duration_minutes} minutes
                            <br/><strong>Price:</strong> {selectedAdminSlot.price} {selectedAdminSlot.currency}
                            <br/><strong>With:</strong> {selectedAdminSlot.admin.full_name}
                        </DialogDescription>
                    )}
                </DialogHeader>
                 <div className="my-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-md">
                    <div className="flex">
                        <div className="py-1"><Info className="h-5 w-5 text-yellow-500 mr-3"/></div>
                        <div>
                            <p className="font-bold">Stripe Payment Required</p>
                            <p className="text-sm">To complete your booking, payment processing via Stripe is needed. Please ask the site administrator to configure Stripe integration.</p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsStripeModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleConfirmBookingWithStripe} disabled={isBooking || !user}>
                        {isBooking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {user ? "Proceed (Payment Pending Setup)" : "Login to Book"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <Card className="mt-12 bg-blue-50 dark:bg-slate-800 border-blue-200 dark:border-slate-700">
            <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-300">Important Information</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-600 dark:text-blue-400 space-y-2">
                <p><Clock className="inline h-4 w-4 mr-1"/> All appointment times are displayed in your current local timezone.</p>
                <p><DollarSign className="inline h-4 w-4 mr-1"/> Payments are processed securely. For full functionality, Stripe integration needs to be completed by the site administrator.</p>
                <p><User className="inline h-4 w-4 mr-1"/> You need to be logged in to book an appointment. If you don't have an account, you can sign up easily.</p>
            </CardContent>
        </Card>
    </div>
  );
};

export default BookAppointmentPage;