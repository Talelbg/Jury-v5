import { Project, Score, Criterion, TRL, ProjectResult } from '../types';

// Helper to calculate mean and standard deviation
const getStats = (arr: number[]): { mean: number; stdev: number } => {
  if (arr.length === 0) return { mean: 0, stdev: 0 };
  const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
  const variance = arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length;
  const stdev = Math.sqrt(variance);
  return { mean, stdev };
};

export const calculateFinalRankings = (
  projects: Project[],
  scores: Score[],
  criteria: Criterion[]
): ProjectResult[] => {
  if (scores.length === 0 || projects.length === 0) return [];
  
  const criteriaMap = new Map(criteria.map(c => [c.id, c]));
  const projectsMap = new Map(projects.map(p => [p.id, p]));

  // Step 1: Calculate weighted scores for every score entry
  const allWeightedScores: { judgeId: string; projectId: string; weightedScore: number }[] = [];
  
  scores.forEach(score => {
    const project = projectsMap.get(score.projectId);
    if (!project) return;

    let totalWeightedScore = 0;
    for (const criterionId in score.criteriaScores) {
      const criterion = criteriaMap.get(criterionId);
      if (criterion) {
        const rawScore = score.criteriaScores[criterionId];
        const weight = criterion.weight[project.trl];
        totalWeightedScore += rawScore * (weight / 10); // Normalizing weight from 100 to 10-point scale
      }
    }
    allWeightedScores.push({ judgeId: score.judgeId, projectId: score.projectId, weightedScore: totalWeightedScore });
  });

  // Step 2: Calculate Z-Score normalization stats for each judge
  const judgeStats: { [judgeId: string]: { mean: number; stdev: number } } = {};
  const scoresByJudge: { [judgeId: string]: number[] } = {};

  allWeightedScores.forEach(s => {
    if (!scoresByJudge[s.judgeId]) {
      scoresByJudge[s.judgeId] = [];
    }
    scoresByJudge[s.judgeId].push(s.weightedScore);
  });

  for (const judgeId in scoresByJudge) {
    judgeStats[judgeId] = getStats(scoresByJudge[judgeId]);
  }

  // Step 3: Calculate normalized score for each project and final average
  const projectResultsMap = new Map<string, { project: Project; normalizedScores: number[], weightedScores: number[], judgeStats: ProjectResult['judgeStats'] }>();

  allWeightedScores.forEach(s => {
    const project = projectsMap.get(s.projectId)!;
    if (!projectResultsMap.has(s.projectId)) {
      projectResultsMap.set(s.projectId, { project, normalizedScores: [], weightedScores: [], judgeStats: {} });
    }
    
    const { mean, stdev } = judgeStats[s.judgeId];
    // If a judge gives the same score to all projects, stdev is 0. Avoid division by zero.
    const normalizedScore = stdev === 0 ? 0 : (s.weightedScore - mean) / stdev;
    
    const currentResult = projectResultsMap.get(s.projectId)!;
    currentResult.normalizedScores.push(normalizedScore);
    currentResult.weightedScores.push(s.weightedScore);
    
    const rawScore = scores.find(sc => sc.projectId === s.projectId && sc.judgeId === s.judgeId)!;
    // FIX: Use Object.keys to iterate and sum scores to avoid typing issues with Object.values on indexed types.
    const criterionKeys = Object.keys(rawScore.criteriaScores);
    const rawTotal = criterionKeys.length > 0 ? criterionKeys.reduce((acc, key) => acc + rawScore.criteriaScores[key], 0) / criterionKeys.length : 0;
    
    currentResult.judgeStats[s.judgeId] = {
        raw: rawTotal,
        weighted: s.weightedScore,
        normalized: normalizedScore,
    };
  });

  const finalResults: Omit<ProjectResult, 'rank'>[] = Array.from(projectResultsMap.values()).map(
    ({ project, normalizedScores, weightedScores, judgeStats }) => {
      const finalScore = normalizedScores.length > 0
        ? normalizedScores.reduce((acc, val) => acc + val, 0) / normalizedScores.length
        : 0;

      const avgWeightedScore = weightedScores.length > 0
        ? weightedScores.reduce((acc, val) => acc + val, 0) / weightedScores.length
        : 0;
      
      return {
        project,
        scores: scores.filter(s => s.projectId === project.id),
        finalScore,
        avgWeightedScore,
        judgeStats,
      };
    }
  );

  // Step 4: Sort and rank
  finalResults.sort((a, b) => b.finalScore - a.finalScore);

  return finalResults.map((result, index) => ({
    ...result,
    rank: index + 1,
  }));
};