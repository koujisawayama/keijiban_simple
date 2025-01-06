// types/activity.ts
export type Activity = {
  id: string;
  content: string;
  created_at: string;
  user_email: string;
  user_nickname: string | null;
};
