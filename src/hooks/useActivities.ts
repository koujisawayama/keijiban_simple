import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity } from '../types/activity';

interface UseActivitiesResult {
  activities: Activity[];
  loading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
}

export function useActivities(): UseActivitiesResult {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('activities_with_nickname')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (data) {
        const formattedData = data.map((item: any) => {
          const activity = {
            id: item.activity_id,
            content: item.content,
            created_at: item.created_at,
            user_email: item.user_email,
            user_nickname: item.nickname
          };
          
          if (!isValidActivity(activity)) {
            throw new Error('Invalid activity data');
          }
          
          return activity;
        });

        setActivities(formattedData);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      let errorMessage = '投稿データの取得に失敗しました';
      
      if (err instanceof Error) {
        if (err.message.includes('JWT expired')) {
          errorMessage = '認証エラー: セッションが切れています。再度ログインしてください';
        } else if (err.message.includes('network error')) {
          errorMessage = 'ネットワークエラー: インターネット接続を確認してください';
        } else if (err.message.includes('permission denied')) {
          errorMessage = 'アクセス権限エラー: 管理者に問い合わせてください';
        } else {
          errorMessage = `エラーが発生しました: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      
      // 5秒後にリトライ
      setTimeout(() => {
        fetchActivities();
      }, 5000);
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

  const isValidActivity = (activity: Activity): boolean => {
    return !!activity.content && !!activity.created_at;
  };

  return { activities, loading, error, fetchActivities };
}
