import React, { useState } from 'react';
import { UserRole, Judge, Track, TRACKS } from '../types';
import { AdminIcon, JudgeIcon, LogoIcon } from './icons';

interface LoginScreenProps {
  onAdminLogin: () => void;
  onJuryLogin: (judgeId: string, newJudgeData?: Omit<Judge, 'id'>) => Promise<void>;
  judges: Judge[];
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onAdminLogin, onJuryLogin, judges }) => {
  const [loginMode, setLoginMode] = useState<'admin' | 'jury'>('admin');
  const [selectedJudge, setSelectedJudge] = useState<string>(judges.length > 0 ? judges[0].id : 'new');
  
  // State for new jury member registration
  const [newJudgeName, setNewJudgeName] = useState('');
  const [newJudgeTracks, setNewJudgeTracks] = useState<Track[]>([]);

  const handleTrackChange = (track: Track) => {
    setNewJudgeTracks(prev =>
      prev.includes(track)
        ? prev.filter(t => t !== track)
        : [...prev, track]
    );
  };

  const handleJuryLoginSubmit = async () => {
    if (selectedJudge === 'new') {
        if (!newJudgeName.trim()) {
            alert('Please enter your name.');
            return;
        }
        if (newJudgeTracks.length === 0) {
            alert('Please select at least one track.');
            return;
        }
        await onJuryLogin('new', { name: newJudgeName.trim(), tracks: newJudgeTracks });
    } else {
        await onJuryLogin(selectedJudge);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="text-center p-8">
            <div className="flex justify-center items-center mb-6">
                <LogoIcon className="w-16 h-16 rounded-lg" />
            </div>
             <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to the Hedera Africa Hackathon</h2>
             <p className="text-gray-600 mb-10">Evaluation Platform</p>

            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-lg">
                <div className="flex border-b border-gray-200 mb-6">
                    <button 
                        onClick={() => setLoginMode('admin')} 
                        className={`flex-1 py-3 font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${loginMode === 'admin' ? 'text-[#5c11c9] border-b-2 border-[#5c11c9]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <AdminIcon className="w-6 h-6"/> Admin
                    </button>
                     <button 
                        onClick={() => setLoginMode('jury')} 
                        className={`flex-1 py-3 font-semibold text-lg flex items-center justify-center gap-2 transition-colors ${loginMode === 'jury' ? 'text-[#95e000] border-b-2 border-[#95e000]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <JudgeIcon className="w-6 h-6"/> Jury Member
                    </button>
                </div>
                
                {loginMode === 'admin' && (
                    <div className='text-left'>
                        <p className="text-gray-600 mb-6">Log in to manage the hackathon, including projects, judges, criteria, and to view the final results.</p>
                        <button
                            onClick={onAdminLogin}
                            className="w-full px-6 py-3 rounded-lg bg-[#5c11c9] hover:bg-[#4a0e9f] text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#5c11c9] focus:ring-offset-2"
                        >
                            Login as Admin
                        </button>
                    </div>
                )}
                
                {loginMode === 'jury' && (
                    <div className='text-left space-y-4'>
                        <div>
                            <label htmlFor="judge-select" className="block text-sm font-medium text-gray-700 mb-1">Select your profile or register</label>
                            <select
                                id="judge-select"
                                value={selectedJudge}
                                onChange={(e) => setSelectedJudge(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#95e000] focus:outline-none"
                            >
                                {judges.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                                <option value="new">-- Register as a new Judge --</option>
                            </select>
                        </div>
                        
                        {selectedJudge === 'new' && (
                            <div className="p-4 bg-gray-50 rounded-md border border-gray-200 space-y-4">
                                <div>
                                    <label htmlFor="new-judge-name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                    <input
                                        id="new-judge-name"
                                        type="text"
                                        value={newJudgeName}
                                        onChange={(e) => setNewJudgeName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#95e000] focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select your assigned tracks</label>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {TRACKS.map(track => (
                                          <div key={track} className="flex items-center">
                                            <input
                                              id={`track-reg-${track}`}
                                              type="checkbox"
                                              checked={newJudgeTracks.includes(track)}
                                              onChange={() => handleTrackChange(track)}
                                              className="h-4 w-4 text-[#95e000] border-gray-300 rounded focus:ring-[#95e000]"
                                            />
                                            <label htmlFor={`track-reg-${track}`} className="ml-2 text-sm text-gray-600">
                                              {track}
                                            </label>
                                          </div>
                                        ))}
                                      </div>
                                </div>
                            </div>
                        )}
                        
                        <button
                            onClick={handleJuryLoginSubmit}
                            className="w-full px-6 py-3 rounded-lg bg-[#95e000] hover:bg-[#82c400] text-black font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[#95e000] focus:ring-offset-2"
                        >
                            Login
                        </button>
                    </div>
                )}

            </div>
        </div>
    </div>
  );
};

export default LoginScreen;
