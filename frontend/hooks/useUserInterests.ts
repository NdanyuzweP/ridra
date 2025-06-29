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
        busScheduleId: interest.busScheduleId,
        pickupPointId: interest.pickupPointId,
        status: interest.status,
        createdAt: interest.createdAt,
      })));
    } catch (err: any) {
      console.error('Error fetching user interests:', err);
      setError(err.message || 'Failed to fetch user interests');
    } finally {
      setLoading(false);
    }
  };

  const showInterest = async (busScheduleId: string, pickupPointId: string) => {
    try {
      await apiService.createUserInterest(busScheduleId, pickupPointId);
      await fetchInterests(); // Refresh the list
      return true;
    } catch (err: any) {
      console.error('Error showing interest:', err);
      setError(err.message || 'Failed to show interest');
      return false;
    }
  };

  const updateInterest = async (id: string, status: string) => {
    try {
      await apiService.updateUserInterest(id, status);
      await fetchInterests(); // Refresh the list
      return true;
    } catch (err: any) {
      console.error('Error updating interest:', err);
      setError(err.message || 'Failed to update interest');
      return false;
    }
  };

  const removeInterest = async (id: string) => {
    try {
      await apiService.deleteUserInterest(id);
      await fetchInterests(); // Refresh the list
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