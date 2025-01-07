import React, { useState, useRef } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ProfileData {
  id: string | number;
  nickname: string;
}

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const shakeRef = useRef<HTMLDivElement>(null);
  const [isNicknameUnique, setIsNicknameUnique] = useState(true);
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);

  // パスワードのバリデーション
  const validatePassword = (pass: string) => {
    if (pass.length < 6) {
      return 'パスワードは6文字以上必要です';
    }
    return null;
  };

  // エラー時のアニメーション
  const startShakeAnimation = () => {
    setShowErrorAnimation(true);
    setTimeout(() => setShowErrorAnimation(false), 1500);
  };

  // ニックネームの重複チェック
  const handleNicknameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    
    if (value.trim() === '') {
      setIsNicknameUnique(true);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('nickname', value);

      if (error) throw error;
      
      setIsNicknameUnique(!data?.length);
      setError(data?.length ? 'このニックネームは既に使用されています' : '');
    } catch (err) {
      console.error('ニックネーム確認エラー:', err);
      setError('ニックネームの確認中にエラーが発生しました');
    }
  };

  // フォーム送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    if (!isNicknameUnique && !isLogin) {
      startShakeAnimation();
      setError('このニックネームは既に使用されています');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (!isLogin) {
        // パスワードチェック
        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          return;
        }

        // ユーザー登録処理
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              nickname,
              created_at: new Date().toISOString()
            }
          }
        });

        // エラーハンドリング
        if (signUpError || !signUpData?.user) {
          throw signUpError || new Error('ユーザー作成に失敗しました');
        }

        // プロフィール作成
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: signUpData.user.id,
            nickname
          })
          .select()
          .single();

        if (profileError) throw profileError;

        alert('登録が完了しました！確認メールをチェックしてください');
      } else {
        // ログイン処理
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (loginError) throw loginError;

        // プロフィール情報取得
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, nickname')
          .eq('id', loginData.user.id)
          .single();

        if (profileError) throw profileError;
      }
    } catch (err) {
      console.error('認証エラー:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('認証中に予期せぬエラーが発生しました');
      }
      startShakeAnimation();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      ref={shakeRef}
      className={`w-full max-w-md p-8 bg-white rounded-lg shadow-lg ${
        showErrorAnimation ? 'animate-shake' : ''
      }`}
    >
      <h2 className="text-2xl font-bold text-center mb-6">
        {isLogin ? 'ログイン' : '新規登録'}
      </h2>

      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />

        <Input
          type="password"
          label="パスワード（6文字以上）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
          minLength={6}
        />

        {!isLogin && (
          <Input
            type="text"
            label="ニックネーム"
            value={nickname}
            onChange={handleNicknameChange}
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
          {isLogin ? 'ログイン' : '新規登録'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        {isLogin ? 'アカウントをお持ちでないですか？ ' : '既にアカウントをお持ちですか？ '}
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="text-indigo-600 hover:text-indigo-500"
          disabled={isLoading}
        >
          {isLogin ? '新規登録' : 'ログイン'}
        </button>
      </p>
    </div>
  );
}