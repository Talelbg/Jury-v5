import React from 'react';
import { UserRole, Judge } from '../types';
import { LogoIcon } from './icons';

interface HeaderProps {
  user: { role: UserRole; id?: string } | null;
  onLogout: () => void;
  judges?: Judge[];
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, judges }) => {
    
    const getJudgeName = (id?: string) => {
        if (!id || !judges) return '';
        const judge = judges.find(j => j.id === id);
        return judge ? judge.name : '';
    }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <LogoIcon className="h-8 w-8 rounded-md" />
            <h1 className="ml-3 text-2xl font-bold text-gray-800 tracking-tight">
                Hedera Africa Hackathon <span className="font-light text-gray-500 hidden sm:inline">| Evaluation Platform</span>
            </h1>
          </div>
          {user && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">
                Logged in as: <span className="font-semibold capitalize">{user.role}{user.role === 'judge' ? `: ${getJudgeName(user.id)}` : ''}</span>
              </span>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-[#5c11c9] border border-transparent rounded-md shadow-sm hover:bg-[#4a0e9f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5c11c9] transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;