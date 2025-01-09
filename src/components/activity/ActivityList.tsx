import React, { useState, useEffect } from 'react';
import { Activity } from '../../types/activity';
import { supabase } from '../../lib/supabase';
import { Trash2 } from 'lucide-react';

interface ActivityListProps {
activities: Activity[];
onDeleteSuccess?: () => void;
}

export function ActivityList({ activities, onDeleteSuccess }: ActivityListProps) {
const [isDeleting, setIsDeleting] = useState(false);
const [currentUserId, setCurrentUserId] = useState<string | null>(null);


useEffect(() => {
const fetchSession = async () => {
    const { data: { session } } = (await supabase.auth.getSession()) as any;
  setCurrentUserId(session?.user?.id || null);
}
    fetchSession()
}, [])

const handleDeleteActivity = async (activityId: string) => {
        if (isDeleting) return;
        setIsDeleting(true);
      if (window.confirm('本当にこの投稿を削除しますか？')) {
        try {
          const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', activityId);

          if (error) {
            throw error;
          }

            if (onDeleteSuccess) {
                await onDeleteSuccess();
            }
        } catch (error) {
          console.error('Error deleting activity:', error);
          alert('投稿の削除に失敗しました。');
        }finally {
          setIsDeleting(false);
        }
      }
    };


console.log('currentUserId:', currentUserId)
if(!currentUserId) return null;

return (
<ul className="w-full max-w-2xl space-y-4">
  {activities.map((activity) => {
      console.log('activity.user_id:', activity.user_id)
    return(
    <li
      key={activity.id}
      className="bg-white rounded-lg shadow p-4 flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
               <p className="text-base font-medium text-gray-800">
          {activity.user_nickname || activity.user_email}
        </p>
          </div>
           <div className="flex items-center gap-2">
         <p className="text-sm text-gray-500">
          {new Date(activity.created_at).toLocaleString()}
        </p>
        {activity.user_id === currentUserId && (
          <button
           onClick={() => handleDeleteActivity(activity.id)}
              className="text-gray-500 hover:text-red-500"
               disabled={isDeleting}
          >
              <Trash2 className="w-4 h-4" />
          </button>
        )}
         </div>
      </div>
      <p className="text-gray-700">{activity.content}</p>
    </li>
    )
  })}
</ul>
);
}