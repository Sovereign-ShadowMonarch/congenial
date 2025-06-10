import React, { useState, useEffect } from 'react';
import { useLoginMutation, useRegisterMutation, useGetCurrentUserQuery } from '../../store/apis/authApi';
import { useAppDispatch, useAppSelector } from '../../store';
import { useNavigate } from 'react-router-dom';
import { useConditionalQuery } from '../../utils/apiHooks';

enum AuthMode {
  LOGIN = 'login',
  REGISTER = 'register',
}

export const AuthenticationForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);

  // Use login mutation with error handling
  const [login, { isLoading: isLoginLoading, error: loginError }] = useLoginMutation();
  
  // Use register mutation with error handling
  const [register, { isLoading: isRegisterLoading, error: registerError }] = useRegisterMutation();
  
  // Use conditional query to fetch current user only when we have a token
  const { data: currentUser, isLoading: isUserLoading } = useConditionalQuery(
    useGetCurrentUserQuery,
    undefined, // No params needed
    !!auth.token // Only run query if token exists
  );
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    try {
      if (mode === AuthMode.LOGIN) {
        await login({ email, password }).unwrap();
      } else {
        // Validate password match
        if (password !== confirmPassword) {
          setFormError('Passwords do not match');
          return;
        }
        
        await register({ email, password, username }).unwrap();
      }
      
      // On successful auth, redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      // Error handling is already done by RTK Query
      // but we can add form-specific error handling here
      setFormError(err.message || 'Authentication failed');
    }
  };
  
  // Clear form errors when switching modes
  useEffect(() => {
    setFormError(null);
  }, [mode]);
  
  // If user is already logged in and we have user data, redirect to dashboard
  useEffect(() => {
    if (auth.token && currentUser) {
      navigate('/dashboard');
    }
  }, [auth.token, currentUser, navigate]);
  
  // Determine if form is submitting
  const isLoading = isLoginLoading || isRegisterLoading || isUserLoading;
  
  // Get the error from API calls
  const apiError = loginError || registerError;
  const errorMessage = formError || (apiError as any)?.message;
  
  // Determine if the form is valid
  const isValid = 
    email.trim() !== '' && 
    password.trim() !== '' && 
    (mode === AuthMode.LOGIN || (username.trim() !== '' && confirmPassword.trim() !== ''));
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            {mode === AuthMode.LOGIN ? 'Sign in to your account' : 'Create your account'}
          </h2>
        </div>
        
        {/* Error messages */}
        {errorMessage && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Authentication Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {errorMessage}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            {/* Username field (only for register) */}
            {mode === AuthMode.REGISTER && (
              <div>
                <label htmlFor="username" className="sr-only">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Username"
                />
              </div>
            )}
            
            {/* Email field */}
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`relative block w-full appearance-none rounded-none ${mode === AuthMode.LOGIN ? 'rounded-t-md' : ''} border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
                placeholder="Email address"
              />
            </div>
            
            {/* Password field */}
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === AuthMode.LOGIN ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`relative block w-full appearance-none rounded-none ${mode === AuthMode.LOGIN ? 'rounded-b-md' : ''} border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
                placeholder="Password"
              />
            </div>
            
            {/* Confirm password field (only for register) */}
            {mode === AuthMode.REGISTER && (
              <div>
                <label htmlFor="confirm-password" className="sr-only">Confirm password</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white dark:bg-gray-800 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="Confirm password"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
            >
              {isLoading ? (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : mode === AuthMode.LOGIN ? (
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                </span>
              ) : null}
              {mode === AuthMode.LOGIN ? 'Sign in' : 'Sign up'}
            </button>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="text-sm">
              {mode === AuthMode.LOGIN ? (
                <button 
                  type="button"
                  onClick={() => setMode(AuthMode.REGISTER)}
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Don't have an account? Sign up
                </button>
              ) : (
                <button 
                  type="button"
                  onClick={() => setMode(AuthMode.LOGIN)}
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Already have an account? Sign in
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthenticationForm;
