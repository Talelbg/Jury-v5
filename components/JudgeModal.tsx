import React, { useState, useEffect } from 'react';
import { Judge, Track, TRACKS } from '../types';

interface JudgeModalProps {
  judge: Judge | null;
  onClose: () => void;
  onSave: (judge: Omit<Judge, 'id'> | Judge) => void;
}

const JudgeModal: React.FC<JudgeModalProps> = ({ judge, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [selectedTracks, setSelectedTracks] = useState<Track[]>([]);

  useEffect(() => {
    if (judge) {
      setName(judge.name);
      setSelectedTracks(judge.tracks);
    } else {
      setName('');
      setSelectedTracks([]);
    }
  }, [judge]);

  const handleTrackChange = (track: Track) => {
    setSelectedTracks(prev =>
      prev.includes(track)
        ? prev.filter(t => t !== track)
        : [...prev, track]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert('Judge name cannot be empty.');
        return;
    }
    const judgeData = {
        name: name.trim(),
        tracks: selectedTracks,
    };

    if (judge) {
        onSave({ ...judgeData, id: judge.id });
    } else {
        onSave(judgeData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{judge ? 'Edit Judge' : 'Add New Judge'}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Judge Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5c11c9] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Tracks</label>
              <div className="space-y-2">
                {TRACKS.map(track => (
                  <div key={track} className="flex items-center">
                    <input
                      id={`track-${track}`}
                      type="checkbox"
                      checked={selectedTracks.includes(track)}
                      onChange={() => handleTrackChange(track)}
                      className="h-4 w-4 text-[#5c11c9] border-gray-300 rounded focus:ring-[#5c11c9]"
                    />
                    <label htmlFor={`track-${track}`} className="ml-3 text-sm text-gray-700">
                      {track}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-md bg-[#5c11c9] hover:bg-[#4a0e9f] text-white font-medium transition-colors">
              Save Judge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JudgeModal;