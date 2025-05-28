import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const resetSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof resetSchema>;

export default function PasswordReset() {
  const router = useRouter();
  const { user, changePassword } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    if (!user) {
      setError('You must be logged in to change your password');
      return;
    }

    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await changePassword(data.currentPassword, data.newPassword);
      setSuccess('Password changed successfully');
      reset(); // Reset form fields
    } catch (err: any) {
      setError(err.message || 'Failed to change password. Please check your current password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-base-content">
            Change Password
          </h2>
          <p className="mt-2 text-center text-sm text-base-content/70">
            Update your account password
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

              {success && (
                <div className="alert alert-success mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Current Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-base-content/50" />
                  </div>
                  <input
                    {...register('currentPassword')}
                    type="password"
                    className={`input input-bordered w-full pl-10 ${errors.currentPassword ? 'input-error' : ''}`}
                    placeholder="Enter your current password"
                  />
                </div>
                {errors.currentPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.currentPassword.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">New Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-base-content/50" />
                  </div>
                  <input
                    {...register('newPassword')}
                    type="password"
                    className={`input input-bordered w-full pl-10 ${errors.newPassword ? 'input-error' : ''}`}
                    placeholder="Enter your new password"
                  />
                </div>
                {errors.newPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.newPassword.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Confirm New Password</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-base-content/50" />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type="password"
                    className={`input input-bordered w-full pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="Confirm your new password"
                  />
                </div>
                {errors.confirmPassword && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control mt-6">
                <button
                  type="submit"
                  className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Changing password...' : 'Change password'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <Link href="/dashboard" className="link link-primary text-sm">
                  Return to Dashboard
                </Link>
              </div>

              <div className="text-center mt-4">
                <Link href="/dashboard" className="link link-primary text-sm">
                  Return to dashboard
                </Link>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
