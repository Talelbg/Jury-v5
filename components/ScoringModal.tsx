import React, { useState } from 'react';
import { Project, Criterion, Score, TRL } from '../types';

interface ScoringModalProps {
  project: Project;
  judgeId: string;
  criteria: Criterion[];
  existingScore?: Score;
  onClose: () => void;
  onSave: (newScore: Score) => Promise<void>;
}

const LinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

const ScoringModal: React.FC<ScoringModalProps> = ({ project, judgeId, criteria, existingScore, onClose, onSave }) => {
  const [scores, setScores] = useState<{ [criterionId: string]: number }>(() => {
    if (existingScore) {
      return existingScore.criteriaScores;
    }
    const initialScores: { [criterionId: string]: number } = {};
    criteria.forEach(c => {
      initialScores[c.id] = 5;
    });
    return initialScores;
  });
  
  const [juryTrl, setJuryTrl] = useState<TRL>(existingScore?.juryTrl || project.trl);
  const [notes, setNotes] = useState(existingScore?.notes || '');

  const handleScoreChange = (criterionId: string, value: number) => {
    const newScore = Math.max(0, Math.min(10, value));
    setScores(prev => ({ ...prev, [criterionId]: newScore }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newScore: Score = {
      id: existingScore?.id || `s_${project.id}_${judgeId}_${Date.now()}`,
      projectId: project.id,
      judgeId: judgeId,
      criteriaScores: scores,
      juryTrl: juryTrl,
      notes: notes,
    };
    await onSave(newScore);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-3xl">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Evaluate Project: {project.name}</h3>
          <p className="text-sm text-gray-500">{project.track} - Admin TRL: {project.trl}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 max-h-[60vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Left side: Project Info & Notes */}
            <div className="space-y-4">
               <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Project Details</h4>
                   <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200 space-y-3">
                      <p className="max-h-24 overflow-y-auto">{project.description}</p>
                       {project.links && project.links.length > 0 && (
                          <div className="border-t border-gray-200 pt-3">
                              <h5 className="font-medium text-gray-700 mb-2">Project Links</h5>
                              <div className="space-y-1.5">
                                  {project.links.map((link, index) => (
                                      <a 
                                        key={index} 
                                        href={link.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center text-[#5c11c9] hover:underline"
                                      >
                                          <LinkIcon />
                                          <span>{link.label}</span>
                                      </a>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              </div>
              <div>
                <label htmlFor="juryTrl" className="block text-sm font-medium text-gray-700 mb-1">Your TRL Assessment</label>
                <select
                  id="juryTrl"
                  value={juryTrl}
                  onChange={(e) => setJuryTrl(e.target.value as TRL)}
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5c11c9] focus:outline-none"
                >
                  <option value={TRL.IDEATION}>{TRL.IDEATION}</option>
                  <option value={TRL.PROTOTYPE}>{TRL.PROTOTYPE}</option>
                </select>
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Private Notes</label>
                <textarea
                  id="notes"
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Your personal thoughts on this project..."
                  className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5c11c9] focus:outline-none"
                />
              </div>
            </div>

            {/* Right side: Scoring Criteria */}
            <ul className="space-y-4">
              {criteria.map(criterion => (
                <li key={criterion.id}>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor={`score-${criterion.id}`} className="font-medium text-gray-700 text-sm">
                      {criterion.name}
                      <span className="ml-2 text-xs text-gray-400 font-mono">({criterion.weight[project.trl]}%)</span>
                    </label>
                    <span className="font-bold text-lg text-[#5c11c9] w-10 text-center">
                      {scores[criterion.id] || 0}
                    </span>
                  </div>
                  <input
                    id={`score-${criterion.id}`}
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={scores[criterion.id] || 0}
                    onChange={(e) => handleScoreChange(criterion.id, parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end items-center">
            <div className='space-x-3'>
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium transition-colors">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 rounded-md bg-[#5c11c9] hover:bg-[#4a0e9f] text-white font-medium transition-colors">
                {existingScore ? 'Update Evaluation' : 'Submit Evaluation'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScoringModal;
