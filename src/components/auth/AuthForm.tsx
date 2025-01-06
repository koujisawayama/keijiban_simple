import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(''); // ニックネームを追加
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (pass: string) => {
    if (pass.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!isLogin) {
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          return;
        }

        // サインアップ処理
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
          });

        if (signUpError || !signUpData.user) {
          setError(signUpError?.message || 'User creation failed');
          return;
        }

        // プロファイル情報を保存
        const { error: profileError } = await supabase
          .from('profiles') // `profiles` テーブルに保存
          .insert({
            id: signUpData.user.id, // `auth.users.id` を参照
            nickname, // 入力されたニックネーム
          });

        if (profileError) {
          setError(profileError.message);
          return;
        }

        alert('Sign up successful! Please check your email for verification.');
      } else {
        // ログイン処理
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          setError('Invalid email or password');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">
        {isLogin ? 'Welcome Back' : 'Join the Community'}
      </h2>
      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
        <Input
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
          minLength={6}
        />
        {!isLogin && ( // サインアップ時のみニックネームを表示
          <Input
            type="text"
            label="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={isLoading}
            required
          />
        )}
        <Button
          type="submit"
          icon={isLogin ? LogIn : UserPlus}
          className="w-full"
          disabled={isLoading}
        >
          {isLogin ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        {isLogin ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-indigo-600 hover:text-indigo-500"
          disabled={isLoading}
        >
          {isLogin ? 'Sign up' : 'Sign in'}
        </button>
      </p>
    </div>
  );
}
