// components/ActivityList.tsx
// import { Activity } from '../../types/activity';

// type ActivityListProps = {
//   activities: Activity[];
// };

export function ActivityList({ activities }: { activities: any[] }) {
  return (
    <ul className="w-full max-w-2xl space-y-4">
      {activities.map((activity) => (
        <li
          key={activity.activity_id}
          className="bg-white rounded-lg shadow p-4 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-base font-medium text-gray-800">
              {activity.nickname || activity.email}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(activity.created_at).toLocaleString()}
            </p>
          </div>
          <p className="text-gray-700">{activity.content}</p>
        </li>
      ))}
    </ul>
  );
}
