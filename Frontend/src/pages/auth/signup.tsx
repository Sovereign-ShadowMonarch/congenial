import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { LockClosedIcon, UserIcon, KeyIcon } from '@heroicons/react/24/outline';

const signUpSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  premium_api_key: z.string().optional(),
  premium_api_secret: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setError(null);
    setIsLoading(true);

    try {
      // Most minimal payload - just focus on the core requirements
      // Based on the HTTP 400 errors, we want to simplify as much as possible
      const userData = {
        name: data.username, // keep for internal typing
        username: data.username,
        password: data.password,
      };
      
      // Skip premium fields entirely for now to minimize payload complexity
      // We can add these back once basic registration works
      
      console.log('Attempting registration with minimal payload...');
      await registerUser(userData);
      
      console.log('Registration successful, redirecting to dashboard');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration error details:', err);
      
      // Extract the most useful error message for the user
      let errorMessage;
      
      if (typeof err === 'object') {
        if (err.message) {
          errorMessage = err.message;
        } else if (err.details && typeof err.details === 'object') {
          // Try to extract a message from the details
          errorMessage = JSON.stringify(err.details);
        } else {
          errorMessage = 'Registration failed. Please try a different username.';
        }
      } else {
        errorMessage = 'An unexpected error occurred during registration.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-base-content">
            Create a new account
          </h2>
          <p className="mt-2 text-center text-sm text-base-content/70">
            Or{' '}
            <Link href="/auth/signin" className="font-medium text-primary hover:text-primary-focus">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              {error && (
                <div className="alert alert-error mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-base-content/50" />
                  </div>
                  <input
                    {...register('username')}
                    type="text"
                    className={`input input-bordered w-full pl-10 ${errors.username ? 'input-error' : ''}`}
                    placeholder="Choose a username"
                  />
                </div>
                {errors.username && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.username.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-base-content/50" />
                  </div>
                  <input
                    {...register('password')}
                    type="password"
                    className={`input input-bordered w-full pl-10 ${errors.password ? 'input-error' : ''}`}
                    placeholder="Create a strong password"
                  />
                </div>
                {errors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.password.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Confirm Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-base-content/50" />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className={`input input-bordered w-full pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
                  </label>
                )}
              </div>

              <div className="divider">Premium Features (Optional)</div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Premium API Key</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-base-content/50" />
                  </div>
                  <input
                    {...register('premium_api_key')}
                    type="text"
                    className="input input-bordered w-full pl-10"
                    placeholder="Premium API Key (optional)"
                  />
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Premium API Secret</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-base-content/50" />
                  </div>
                  <input
                    {...register('premium_api_secret')}
                    type="password"
                    className="input input-bordered w-full pl-10"
                    placeholder="Premium API Secret (optional)"
                  />
                </div>
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
