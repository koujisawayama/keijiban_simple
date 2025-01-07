import { Activity, Users } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { useActivities } from './hooks/useActivities';
import { AuthForm } from './components/auth/AuthForm';
import { ActivityForm } from './components/activity/ActivityForm';
import { ActivityList } from './components/activity/ActivityList';
import { Button } from './components/ui/Button';
import ErrorBoundary from './components/activity/ErrorBoundary'; // エラー境界をインポート

function App() {
  const { user } = useAuth();
  const { activities, loading, error, fetchActivities } = useActivities();

  if (error) {
    console.error('Error fetching activities:', error);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-indigo-600" />
                <h1 className="ml-2 text-xl font-bold text-gray-900">
                  Community Activity
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{user.email}</span>
                </div>
                <Button
                  onClick={() => supabase.auth.signOut()}
                  className="!bg-gray-600 hover:!bg-gray-700"
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0 space-y-6 flex flex-col items-center">
            <ActivityForm onPostSuccess={fetchActivities} />
            <ActivityList activities={activities} />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;

