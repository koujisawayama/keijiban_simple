-- Create activities_with_nickname view
CREATE OR REPLACE VIEW activities_with_nickname AS
SELECT 
  a.id AS activity_id,
  a.content,
  a.created_at,
  a.user_id,
  u.email AS user_email,
  p.nickname
FROM activities a
JOIN auth.users u ON a.user_id = u.id
LEFT JOIN profiles p ON a.user_id = p.id
ORDER BY a.created_at DESC;