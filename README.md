# keijiban

前提:

このリストは、本アプリケーションの機能を実装するために必要だった SQL 文のみを網羅しています。

Supabase のダッシュボードから直接実行した SQL 文は含まれません (ただし、マイグレーションファイルに記述されているものは含まれます)。

一部の SQL 文は複数回修正されている場合があります。このリストでは最終的な状態のものを記載します。

SQL 文リスト:

activities テーブルの作成 (マイグレーションファイル: 20250106130639_summer_bird.sql):

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read all activities
CREATE POLICY "Anyone can view activities"
  ON activities
  FOR SELECT
  USING (true);

-- Allow authenticated users to create activities
CREATE POLICY "Users can create their own activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own activities
CREATE POLICY "Users can update their own activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own activities
CREATE POLICY "Users can delete their own activities"
  ON activities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS activities_user_id_idx ON activities(user_id);
CREATE INDEX IF NOT EXISTS activities_created_at_idx ON activities(created_at DESC);
Use code with caution.
SQL
profiles テーブルの作成 (マイグレーションファイル: 20250108020450_create_profiles_table.sql):

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read all profiles
CREATE POLICY "Anyone can view profiles"
  ON profiles
  FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Remove trigger function and trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create index
CREATE INDEX IF NOT EXISTS profiles_nickname_idx ON profiles(nickname);
Use code with caution.
SQL
activities_with_user_info ビューの作成 (マイグレーションファイル: 20250110160000_create_activities_with_user_info_view.sql):

-- Create activities_with_user_info view
    CREATE OR REPLACE VIEW activities_with_user_info AS
    SELECT
        a.id AS activity_id,
        a.content,
        a.created_at,
        a.user_id,
        p.nickname AS user_nickname,
        u.email AS user_email
    FROM activities a
    LEFT JOIN profiles p ON a.user_id = p.id
    LEFT JOIN auth.users u ON a.user_id = u.id
    ORDER BY a.created_at DESC;
Use code with caution.
SQL
auth.usersテーブルに display_name カラムを追加 (マイグレーションファイル: 20250110120000_add_display_name_to_auth_users.sql):
sql -- Add display_name column to auth.users table ALTER TABLE auth.users ADD COLUMN display_name TEXT;

insert_nickname 関数の作成 (マイグレーションファイル: 20250110140000_create_insert_nickname_function.sql):

CREATE OR REPLACE FUNCTION public.insert_nickname()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, created_at, updated_at)
  VALUES (new.id, new.raw_user_meta_data->>'nickname', NOW(), NOW());
  RETURN new;
END;
$$;
Use code with caution.
SQL
on_auth_user_created トリガーの作成 (マイグレーションファイル: 20250110150000_create_insert_nickname_trigger.sql):

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.insert_nickname();
Use code with caution.
SQL
説明:

テーブル作成:

activities テーブルは投稿内容、ユーザー ID、作成日時を保存します。

profiles テーブルはユーザーのニックネームと、auth.users テーブルへの参照を保持します。

Row Level Security (RLS):

activities テーブルと profiles テーブルには、RLS ポリシーが設定されています。これにより、ユーザーは自分のデータのみを操作できるようになります。

ビューの作成:

activities_with_user_info ビューは、 activities、profiles、 auth.users テーブルを結合して、必要な情報をまとめて取得できるようにしています。

関数とトリガー:

insert_nickname 関数は、新しいユーザーが登録されたときに、profiles テーブルにニックネームを挿入します。

on_auth_user_created トリガーは、auth.users テーブルに新しいユーザーが登録されたときに、insert_nickname 関数を実行します。

補足:

auth.users テーブルにはデフォルトでメールアドレスやパスワードなどの認証情報が保存されます。

上記の SQL 文は、Supabase のダッシュボードの SQL Editor で直接実行することも、マイグレーションファイルとして作成することもできます。

これらの SQL 文は、アプリケーションの基本的な機能を実装するために必要なものです。

これらの SQL 文は、今回のアプリケーションの基盤となるデータベース構成を定義しています。今後の開発の参考になれば幸いです。
