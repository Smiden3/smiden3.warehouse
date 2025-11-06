import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, sendPasswordResetEmail } from 'firebase/auth';
import { useTheme } from '../hooks/useTheme';
import { Eye, EyeOff } from '../constants';

const logoUrl = 'https://i.postimg.cc/1tdy0QLp/reve-v1.png';

export const Auth: React.FC = () => {
  const { theme } = useTheme();
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const resetFormState = (mode: 'login' | 'signup' | 'reset') => {
    setAuthMode(mode);
    setError('');
    setMessage('');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await setPersistence(auth, browserLocalPersistence);
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Неверный формат email адреса.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Неверный email или пароль.');
          break;
        case 'auth/email-already-in-use':
          setError('Пользователь с таким email уже существует.');
          break;
        case 'auth/weak-password':
          setError('Пароль должен быть не менее 6 символов.');
          break;
        default:
          setError('Произошла ошибка. Попробуйте снова.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Пожалуйста, введите ваш email.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Ссылка для сброса пароля отправлена! Проверьте ваш почтовый ящик.');
    } catch (err: any) {
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Неверный формат email адреса.');
          break;
        case 'auth/user-not-found':
          setError('Пользователь с таким email не найден.');
          break;
        default:
          setError('Не удалось отправить письмо. Попробуйте снова.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center items-center mb-6">
          <img src={logoUrl} alt="Логотип" className="h-24 w-auto" />
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text ml-4">СКЛАД/仓库</h1>
        </div>

        <div className="bg-light-card dark:bg-dark-glass dark:backdrop-blur-lg dark:border dark:border-dark-glass-border p-8 rounded-xl shadow-lg">
          {authMode !== 'reset' && (
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                onClick={() => resetFormState('login')}
                className={`flex-1 pb-2 font-semibold transition-colors ${authMode === 'login' ? 'text-light-accent dark:text-dark-accent border-b-2 border-light-accent dark:border-dark-accent' : 'text-gray-500 dark:text-gray-400'}`}
              >
                Вход
              </button>
              <button
                onClick={() => resetFormState('signup')}
                className={`flex-1 pb-2 font-semibold transition-colors ${authMode === 'signup' ? 'text-light-accent dark:text-dark-accent border-b-2 border-light-accent dark:border-dark-accent' : 'text-gray-500 dark:text-gray-400'}`}
              >
                Регистрация
              </button>
            </div>
          )}

          {authMode === 'reset' ? (
            <>
              <h2 className="text-xl font-bold text-center mb-6 text-light-text dark:text-dark-text">Сброс пароля</h2>
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 border focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                {message && <p className="text-sm text-green-600 dark:text-green-400 text-center">{message}</p>}
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-light-accent dark:bg-dark-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-accent dark:focus:ring-dark-accent disabled:opacity-50"
                  >
                    {loading ? 'Отправка...' : 'Отправить ссылку'}
                  </button>
                </div>
              </form>
              <div className="mt-4 text-center">
                <button onClick={() => resetFormState('login')} className="text-sm font-medium text-light-accent dark:text-dark-accent hover:opacity-80">
                  Вернуться ко входу
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 border focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Пароль
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 border focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-light-text dark:hover:text-dark-text"
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {authMode === 'login' && (
                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={() => resetFormState('reset')}
                      className="font-medium text-light-accent dark:text-dark-accent hover:opacity-80 focus:outline-none"
                    >
                      Забыли пароль?
                    </button>
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-light-accent dark:bg-dark-accent hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-accent dark:focus:ring-dark-accent disabled:opacity-50"
                >
                  {loading ? 'Загрузка...' : (authMode === 'login' ? 'Войти' : 'Зарегистрироваться')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};