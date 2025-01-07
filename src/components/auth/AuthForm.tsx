import React, { useState, useRef } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

// デバウンス関数
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// パスワードのバリデーション
const validatePassword = (pass: string) => {
  if (pass.length < 6) {
    return 'パスワードは6文字以上必要です';
  }
  return null;
};

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNicknameUnique, setIsNicknameUnique] = useState(true);
  const [showErrorAnimation, setShowErrorAnimation] = useState(false);
  const shakeRef = useRef<HTMLDivElement>(null);

  // エラー時のアニメーション
  const startShakeAnimation = () => {
    setShowErrorAnimation(true);
    setTimeout(() => setShowErrorAnimation(false), 1500);
  };

  // エラーハンドリング共通関数
  const handleError = (err: unknown) => {
    console.error('エラー:', err);
    if (err instanceof Error) {
      if (err.message.includes('rate limit exceeded')) {
        setError('短時間に多くのリクエストを送信しました。しばらく待ってから再度お試しください');
      } else {
        setError(err.message);
      }
    } else {
      setError('予期せぬエラーが発生しました');
    }
    startShakeAnimation();
  };

  // ニックネームの重複チェック
  const handleNicknameChange = debounce(async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, 500);

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
          setIsLoading(false);
          return;
        }

        // ユーザー登録処理
        const signUpWithRetry = async () => {
          let retryCount = 0;
          
          while (retryCount < 3) {
            const result = await supabase.auth.signUp({
              email,
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`,
                data: {
                  nickname
                }
              }
            });
            
            if (!result.error || !result.error.message.includes('rate limit exceeded')) {
              return result;
            }
            
            // 指数バックオフでリトライ
            await new Promise(resolve => setTimeout(resolve, 1000 * (2 ** retryCount)));
            retryCount++;
          }
          throw new Error('リトライ回数の上限に達しました');
        };

        const signUpResult = await signUpWithRetry();

        console.log({
          email,
          password,
          nickname,
        });

        if (signUpResult.error || !signUpResult.data?.user) {
          throw signUpResult.error || new Error('ユーザー作成に失敗しました');
        }

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

        alert(`ようこそ、${profileData.nickname}さん！`);
      }
    } catch (err) {
      handleError(err);
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
          onChange={(e) => {
            const value = e.target.value;
            setPassword(value);
            const error = validatePassword(value);
            setError(error || '');
          }}
          disabled={isLoading}
          required
          minLength={6}
        />

        {!isLogin && (
          <Input
          type="text"
          label="ニックネーム"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)} // デバウンスなしで直接更新
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
