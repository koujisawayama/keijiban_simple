// hooks/useActivities.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity } from '../types/activity';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('activities')
        .select(
          `
          id,
          content,
          created_at,
          auth.users!inner( email) AS user_email,
          profiles!left( nickname) AS user_nickname
        `
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching activities:', error.message);
      } else if (data) {
        setActivities(data as unknown as Activity[]); // 型キャスト
      }
    };

    fetchActivities();
  }, []);

  return activities;
}
