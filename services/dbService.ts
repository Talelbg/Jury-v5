// services/dbService.ts
import { Project, Judge, Criterion, Score } from '../types';

interface DBState {
  projects: Project[];
  judges: Judge[];
  criteria: Criterion[];
  scores: Score[];
}

const API_BASE_URL = '/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// --- Public API ---

export const getAllData = async (): Promise<DBState> => {
  const response = await fetch(`${API_BASE_URL}/data`);
  return handleResponse(response);
};

// Project API
export const createProjects = async (newProjectsData: Omit<Project, 'id'>[]): Promise<Project[]> => {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProjectsData),
  });
  return handleResponse(response);
};

export const updateProject = async (updatedProject: Project): Promise<Project> => {
  const response = await fetch(`${API_BASE_URL}/projects/${updatedProject.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedProject),
  });
  return handleResponse(response);
};

export const deleteProject = async (projectId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// Judge API
export const createJudge = async (newJudgeData: Omit<Judge, 'id'>): Promise<Judge> => {
  const response = await fetch(`${API_BASE_URL}/judges`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newJudgeData),
  });
  return handleResponse(response);
};

export const updateJudge = async (updatedJudge: Judge): Promise<Judge> => {
  const response = await fetch(`${API_BASE_URL}/judges/${updatedJudge.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedJudge),
  });
  return handleResponse(response);
};

export const deleteJudge = async (judgeId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/judges/${judgeId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// Criterion API
export const createCriterion = async (newCriterionData: Omit<Criterion, 'id'>): Promise<Criterion> => {
   const response = await fetch(`${API_BASE_URL}/criteria`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newCriterionData),
  });
  return handleResponse(response);
};

export const updateCriterion = async (updatedCriterion: Criterion): Promise<Criterion> => {
  const response = await fetch(`${API_BASE_URL}/criteria/${updatedCriterion.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedCriterion),
  });
  return handleResponse(response);
};

export const deleteCriterion = async (criterionId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/criteria/${criterionId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// Score API
export const createOrUpdateScore = async (score: Score): Promise<Score> => {
  // Uses the upsert endpoint on the backend
  const response = await fetch(`${API_BASE_URL}/scores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(score),
  });
  return handleResponse(response);
};

export const deleteScore = async (scoreId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/scores/${scoreId}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};