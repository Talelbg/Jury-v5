import React, { useState, useMemo } from 'react';
import { Project, Judge, Criterion, Score } from '../types';
import ScoringModal from './ScoringModal';
import { EditIcon, ListIcon, DeleteIcon } from './icons';

interface JudgeDashboardProps {
  judge: Judge;
  projects: Project[];
  criteria: Criterion[];
  scores: Score[];
  onScoreSubmit: (newScore: Score) => void;
  onScoreDelete: (scoreId: string) => void;
}

const JudgeDashboard: React.FC<JudgeDashboardProps> = ({ judge, projects, criteria, scores, onScoreSubmit, onScoreDelete }) => {
  const [scoringProject, setScoringProject] = useState<Project | null>(null);

  const scoresByProjectId = useMemo(() => {
    const map = new Map<string, Score>();
    scores.forEach(score => map.set(score.projectId, score));
    return map;
  }, [scores]);

  const [projectsToScore, scoredProjects] = useMemo(() => {
    const toScore: Project[] = [];
    const scored: Project[] = [];
    projects.forEach(p => {
      if (scoresByProjectId.has(p.id)) {
        scored.push(p);
      } else {
        toScore.push(p);
      }
    });
    return [toScore, scored];
  }, [projects, scoresByProjectId]);


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-bold mb-2">Hedera Africa Hackathon Judge Dashboard</h2>
      <p className="text-lg text-gray-600 mb-8">Welcome, <span className="font-semibold text-[#5c11c9]">{judge.name}</span>. You are assigned to the <span className="font-semibold">{judge.tracks.join(', ')}</span> tracks.</p>

      <div className="bg-[#5c11c9]/10 border border-[#5c11c9]/20 text-[#3d0b85] p-4 rounded-lg mb-8">
        <h4 className="font-bold mb-2">How to Evaluate Projects</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Projects assigned to you are listed under <strong>"Projects to Evaluate"</strong>.</li>
            <li>Click the <strong>"Score"</strong> button to open the evaluation form for a project.</li>
            <li>In the form, you can review the project's description, assess its Technology Readiness Level (TRL), and leave private notes for your reference.</li>
            <li>Use the sliders to give a score from <strong>0 to 10</strong> for each criterion.</li>
            <li>Once you're done, click <strong>"Submit Evaluation"</strong>.</li>
            <li>Your completed evaluations will move to the <strong>"Completed Evaluations"</strong> list. You can modify them anytime by clicking <strong>"Edit Score"</strong>.</li>
        </ol>
      </div>


      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-800">Projects to Evaluate ({projectsToScore.length})</h3>
          {projectsToScore.length > 0 ? (
            <ul className="bg-white p-4 rounded-xl border border-gray-200 divide-y divide-gray-200">
              {projectsToScore.map(project => (
                <li key={project.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.track} - {project.trl}</p>
                  </div>
                  <button
                    onClick={() => setScoringProject(project)}
                    className="px-4 py-2 rounded-md bg-[#5c11c9] hover:bg-[#4a0e9f] text-white font-medium transition-colors flex items-center"
                  >
                    <ListIcon className="w-4 h-4 mr-2"/>
                    Score
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-500">No projects left to score. Great job!</p>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-800">Completed Evaluations ({scoredProjects.length})</h3>
          {scoredProjects.length > 0 && (
            <ul className="bg-white p-4 rounded-xl border border-gray-200 divide-y divide-gray-200">
              {scoredProjects.map(project => (
                <li key={project.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.track} - {project.trl}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setScoringProject(project)}
                      className="px-4 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium transition-colors flex items-center"
                    >
                       <EditIcon className="w-4 h-4 mr-2"/>
                      Edit Score
                    </button>
                    <button
                        onClick={() => {
                            const scoreToDelete = scoresByProjectId.get(project.id);
                            if (scoreToDelete) {
                                onScoreDelete(scoreToDelete.id);
                            }
                        }}
                        className="p-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-red-100 hover:text-red-600 hover:border-red-200 transition-colors"
                        aria-label="Delete evaluation"
                    >
                        <DeleteIcon className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {scoringProject && (
        <ScoringModal
          project={scoringProject}
          judgeId={judge.id}
          criteria={criteria}
          existingScore={scoresByProjectId.get(scoringProject.id)}
          onClose={() => setScoringProject(null)}
          onSave={onScoreSubmit}
        />
      )}
    </div>
  );
};

export default JudgeDashboard;