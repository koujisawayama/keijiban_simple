import React, { useState, useRef } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
 //型を定義しておくことでコードの見通しが良くなる
 interface ProfileData  {
       id: string | number;
     nickname:string;
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
 const validatePassword = (pass: string) => {
      if (pass.length < 6) {
     return 'Password must be at least 6 characters long';
   }
  return null;
};
const startShakeAnimation = () => {
      setShowErrorAnimation(true);
        setTimeout(() => {
         setShowErrorAnimation(false);
        }, 1500);
   };
    const handleNicknameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
       setNickname(value);
      if (value.trim() === '') {
      setIsNicknameUnique(true);
        return;
       }
       try{
        const { data , error} = await supabase.from('profiles').select('nickname');
          if (error) {
          console.error("Failed to check nickname", error);
          setError("Failed to check nickname uniqueness.");
          return;
            }
       const nicknameExists = data?.some((profile) => profile.nickname === value);
     setIsNicknameUnique(!nicknameExists);
   if(nicknameExists){
      setError("This nickname is already used.");
         startShakeAnimation();
         }else {
       setError("")
           }
     }catch(err){
        setError("Error checking nickname uniqueness")
         console.error(err)
         }
       };
    const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
  if (!isNicknameUnique && !isLogin ) {
      startShakeAnimation();
      setError('This nickname is already in use');
     return;
     }
       setError('');
    setIsLoading(true);
  try {
 if (!isLogin) {
  const passwordError = validatePassword(password);
  if (passwordError) {
  setError(passwordError);
    return;
    }
  const { data: signUpData, error: signUpError } =
       await supabase.auth.signUp({
         email,
         password,
    });
 if (signUpError || !signUpData?.user) { // !signUpData.userで、undefinedの場合も拾える
    setError(signUpError?.message || 'User creation failed');
       return;
       }

        const {data:checkData,error : checkError} = await supabase.from('profiles')
            .select("id")
           if(checkError)
           {
              setError("Error trying to verify if profiles.id already exists")
              return
              }
          if(checkData && checkData.some(profile =>  String(profile.id) ===  String(signUpData?.user?.id))){
            startShakeAnimation()
       setError("This user ID has already been used!")
                await supabase.auth.signOut();
          return;
           }
         const { error: profileError } = await supabase
                .from('profiles')
               .insert({
                  id: signUpData?.user?.id,
               nickname,
                });
   if (profileError) {
         setError(profileError.message);
    return;
       }
       alert('Sign up successful! Please check your email for verification.');
   } else {
        const { data: loginData, error: loginError} = await supabase.auth.signInWithPassword({
            email,
            password,
          });
        if (loginError) {
           setError('Invalid email or password');
              return;
             }
    if(loginData?.user){
 const {data: profileData ,error : profileError} = await supabase
               .from("profiles")
                  .select("id , nickname")
                   .eq("id", loginData.user.id)
        .single() as {data: ProfileData | null , error:any};
               if(profileError) {
                    setError('Profile data failed to retrieve.');
                  return;
                    }
       if(profileData && typeof profileData.nickname === 'string' ){
    const { data: nickNameCheckData, error :checkError} = await supabase
         .from('profiles')
        .select('id , nickname');
   if(checkError){
            setError('An error occured when checking nickname duplicate.');
       }
     if(nickNameCheckData){
         const nicknameDuplicate = nickNameCheckData.some(profile => profile.nickname === profileData.nickname &&   String(profile.id) !==   String(loginData?.user?.id) );
               if (nicknameDuplicate) {
                startShakeAnimation();
        setError('Nickname is already used. You cant sign in with this.');
               await supabase.auth.signOut();
               return;
                     }
       }
             }
        }
   }
    } catch (err) {
       setError('An unexpected error occurred');
       } finally {
      setIsLoading(false);
     }
     };
    return (
        <div
    ref={shakeRef}
       className={`w-full max-w-md p-8 bg-white rounded-lg shadow-lg ${showErrorAnimation ? 'animate-shake' : ''}`}
     style={{
          transform: `translateX(${showErrorAnimation ? Math.sin(Date.now() * 0.08 )*5  + 'px'  : '0'})`,
             transition: `transform 0.02s ease-in-out`,
    position: 'relative',
   }}
  >
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
           label="Password (6文字以上っす)"
          value={password}
   onChange={(e) => setPassword(e.target.value)}
         disabled={isLoading}
          required
           minLength={6}
  />
            {!isLogin && (
 <Input
     type="text"
            label="Nickname"
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