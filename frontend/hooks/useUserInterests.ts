import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

interface UserInterest {
  id: string;
  busScheduleId: string;
  pickupPointId: string;
  status: string;
  createdAt: Date;
}

export function useUserInterests() {
  const [interests, setInterests] = useState<UserInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getUserInterests();
      setInterests(response.interests.map(interest => ({
        id: interest._id,
        busScheduleId: typeof interest.busScheduleId === 'string' ? interest.busScheduleId : interest.busScheduleId._id,
        pickupPointId: typeof interest.pickupPointId === 'string' ? interest.pickupPointId : interest.pickupPointId._id,
        status: interest.status,
        createdAt: new Date(interest.createdAt),
      })));
    } catch (err: any) {
      console.error('Error fetching user interests:', err);
      setError(err.message || 'Failed to fetch user interests');
      setInterests([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const showInterest = async (busScheduleId: string, pickupPointId: string) => {
    try {
      console.log('Showing interest in bus schedule:', busScheduleId);
      const response = await apiService.createUserInterest(busScheduleId, pickupPointId);
      
      // Add the new interest to the local state immediately for better UX
      const newInterest: UserInterest = {
        id: response.interest._id,
        busScheduleId: typeof response.interest.busScheduleId === 'string' ? response.interest.busScheduleId : response.interest.busScheduleId._id,
        pickupPointId: typeof response.interest.pickupPointId === 'string' ? response.interest.pickupPointId : response.interest.pickupPointId._id,
        status: response.interest.status,
        createdAt: new Date(),
      };
      
      setInterests(prev => [...prev, newInterest]);
      return true;
    } catch (err: any) {
      console.error('Error showing interest:', err);
      setError(err.message || 'Failed to show interest');
      return false;
    }
  };

  const updateInterest = async (id: string, status: string) => {
    try {
      console.log('Updating interest status:', id, status);
      await apiService.updateUserInterest(id, status);
      
      // Update the local state immediately
      setInterests(prev => prev.map(interest => 
        interest.id === id ? { ...interest, status } : interest
      ));
      return true;
    } catch (err: any) {
      console.error('Error updating interest:', err);
      setError(err.message || 'Failed to update interest');
      return false;
    }
  };

  const removeInterest = async (id: string) => {
    try {
      console.log('Removing interest:', id);
      await apiService.deleteUserInterest(id);
      
      // Remove from local state immediately
      setInterests(prev => prev.filter(interest => interest.id !== id));
      return true;
    } catch (err: any) {
      console.error('Error removing interest:', err);
      setError(err.message || 'Failed to remove interest');
      return false;
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  const refetch = () => {
    fetchInterests();
  };

  return { 
    interests, 
    loading, 
    error, 
    refetch, 
    showInterest, 
    updateInterest, 
    removeInterest 
  };
}