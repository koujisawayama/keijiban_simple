import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity } from '../types/activity';

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('activities')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (nickname),
          auth:user_id (email)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        const formattedData = data.map((item) => ({
          id: item.id,
          content: item.content,
          created_at: item.created_at,
          user_id: item.user_id,
          nickname: item.profiles?.nickname || null,
          email: item.auth?.email || null
        }));

        setActivities(formattedData);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初回データ取得
    fetchActivities();

    // リアルタイム更新の設定
    const subscription = supabase
      .channel('activities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => fetchActivities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { activities, loading, error };
}
