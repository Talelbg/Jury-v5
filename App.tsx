import React, { useState, useMemo, useEffect } from 'react';
import { UserRole, Project, Judge, Criterion, Score, Track } from './types';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import JudgeDashboard from './components/JudgeDashboard';
import Header from './components/Header';
import * as dbService from './services/dbService';


function App() {
  const [user, setUser] = useState<{ role: UserRole; id?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  // Initial Data Load from Backend
  useEffect(() => {
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const data = await dbService.getAllData();
            setProjects(data.projects);
            setJudges(data.judges);
            setCriteria(data.criteria);
            setScores(data.scores);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to connect to backend.';
            setError(`Could not load data. Please ensure the backend server is running. (${errorMessage})`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, []);

  // WebSocket for Real-time Updates
  useEffect(() => {
    // Do not establish WebSocket connection if there was an initial error
    if (error) return;

    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => console.log('WebSocket connection established');
    ws.onclose = () => console.log('WebSocket connection closed');
    ws.onerror = (err) => console.error('WebSocket error:', err);

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            if (message.type === 'DATA_UPDATE') {
                const { projects, judges, criteria, scores } = message.payload;
                setProjects(projects || []);
                setJudges(judges || []);
                setCriteria(criteria || []);
                setScores(scores || []);
            }
        } catch (e) {
            console.error('Error parsing WebSocket message:', e);
        }
    };

    // Cleanup function to close the connection when the component unmounts
    return () => {
        ws.close();
    };
  }, [error]); // Re-run if error state changes (though we only connect if no error)


  // --- Admin Handlers (now async and call dbService) ---
  const addProjects = async (newProjectsData: Omit<Project, 'id'>[]) => {
      await dbService.createProjects(newProjectsData);
  };
  const editProject = async (updatedProject: Project) => {
      await dbService.updateProject(updatedProject);
  };
  const deleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated scores and cannot be undone.')) {
        return;
    }
    await dbService.deleteProject(projectId);
  };

  const addJudge = async (newJudgeData: Omit<Judge, 'id'>): Promise<Judge> => {
    return await dbService.createJudge(newJudgeData);
  };

  const editJudge = async (updatedJudge: Judge) => {
      await dbService.updateJudge(updatedJudge);
  };
  const deleteJudge = async (judgeId: string) => {
    if (!window.confirm('Are you sure you want to delete this judge? This will also delete all their scores and cannot be undone.')) {
        return;
    }
    await dbService.deleteJudge(judgeId);
  };

  const addCriterion = async (newCriterionData: Omit<Criterion, 'id'>) => {
      await dbService.createCriterion(newCriterionData);
  };
  const editCriterion = async (updatedCriterion: Criterion) => {
      await dbService.updateCriterion(updatedCriterion);
  };
  const deleteCriterion = async (criterionId: string) => {
     if (!window.confirm('Are you sure you want to delete this criterion? This could affect existing scores.')) {
        return;
     }
    await dbService.deleteCriterion(criterionId);
  };

  // --- Judge Handler ---
  const addOrUpdateScore = async (newScore: Score) => {
    await dbService.createOrUpdateScore(newScore);
  };
  
  const deleteScore = async (scoreId: string) => {
    if (!window.confirm('Are you sure you want to delete this evaluation? This action cannot be undone.')) {
        return;
    }
    await dbService.deleteScore(scoreId);
  };

  const handleAdminLogin = () => setUser({ role: UserRole.ADMIN });

  const handleJuryLogin = async (judgeId: string, newJudgeData?: Omit<Judge, 'id'>) => {
    let finalJudgeId = judgeId;
    if (judgeId === 'new' && newJudgeData) {
      const newJudge = await addJudge(newJudgeData);
      finalJudgeId = newJudge.id;
    }
    setUser({ role: UserRole.JUDGE, id: finalJudgeId });
  };
  
  const handleLogout = () => setUser(null);

  const judgeData = useMemo(() => {
    if (user?.role !== UserRole.JUDGE || !user.id) {
        return null;
    }
    const currentJudge = judges.find(j => j.id === user.id);
    if (!currentJudge) {
        return null;
    }
    const judgeProjects = projects.filter(p => currentJudge.tracks.includes(p.track as Track));
    const judgeScores = scores.filter(s => s.judgeId === currentJudge.id);
    
    return { currentJudge, judgeProjects, judgeScores };
  }, [user, judges, projects, scores]);

  const renderContent = () => {
    if (isLoading) {
        return <div className="p-8 text-center text-gray-600">Loading evaluation data...</div>
    }

    if (error) {
        return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg max-w-2xl mx-auto mt-10 border border-red-200">{error}</div>
    }

    if (!user) {
      return <LoginScreen onAdminLogin={handleAdminLogin} onJuryLogin={handleJuryLogin} judges={judges} />;
    }

    switch (user.role) {
      case UserRole.ADMIN:
        return <AdminDashboard 
            projects={projects} 
            judges={judges} 
            criteria={criteria} 
            scores={scores}
            addProjects={addProjects}
            editProject={editProject}
            deleteProject={deleteProject}
            addJudge={addJudge}
            editJudge={editJudge}
            deleteJudge={deleteJudge}
            addCriterion={addCriterion}
            editCriterion={editCriterion}
            deleteCriterion={deleteCriterion}
        />;
      case UserRole.JUDGE:
        if (!judgeData || !judgeData.currentJudge) {
            // This can happen briefly if a judge is deleted while they are logged in.
            // The websocket will remove them, and this logic will log them out gracefully.
            handleLogout();
            return null; // Or a message
        }
        
        return <JudgeDashboard
            judge={judgeData.currentJudge}
            projects={judgeData.judgeProjects}
            criteria={criteria}
            scores={judgeData.judgeScores}
            onScoreSubmit={addOrUpdateScore}
            onScoreDelete={deleteScore}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header user={user} onLogout={handleLogout} judges={judges} />
      <main className="max-w-screen-xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
