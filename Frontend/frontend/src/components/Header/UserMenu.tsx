import React from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { UserIcon, ArrowRightOnRectangleIcon, Cog8ToothIcon, KeyIcon } from '@heroicons/react/24/outline';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect happens in the logout function
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return (
      <button 
        className="btn btn-primary btn-sm"
        onClick={() => router.push('/auth/signin')}
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
          <UserIcon className="h-6 w-6" />
        </div>
      </label>
      <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
        <li className="menu-title px-4 py-2">
          <span className="opacity-70">Signed in as</span>
          <span className="font-bold">{user.username}</span>
        </li>
        <div className="divider my-0"></div>
        <li>
          <a onClick={() => router.push('/settings')} className="flex items-center p-2">
            <Cog8ToothIcon className="h-5 w-5 mr-2" />
            Settings
          </a>
        </li>
        <li>
          <a onClick={() => router.push('/auth/reset')} className="flex items-center p-2">
            <KeyIcon className="h-5 w-5 mr-2" />
            Change Password
          </a>
        </li>
        <div className="divider my-0"></div>
        <li>
          <a onClick={handleLogout} className="flex items-center p-2 text-error">
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
            Sign Out
          </a>
        </li>
      </ul>
    </div>
  );
};

export default UserMenu;
