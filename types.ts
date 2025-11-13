// FIX: Removed a circular import of `TRL` from this file, which was causing a conflict with the `TRL` enum defined below.

export enum UserRole {
  ADMIN = 'admin',
  JUDGE = 'judge',
}

export enum TRL {
  IDEATION = 'Ideation (TRL 1-3)',
  PROTOTYPE = 'Prototype (TRL 4-6)',
}

export const TRACKS = [
  'AI and Depin',
  'Onchain Finance & RWA',
  'DLT for Operations',
  'Immersive Experiences',
  'Cross-Chain Track',
] as const;

export type Track = typeof TRACKS[number];

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  track: Track;
  trl: TRL;
  links?: ProjectLink[];
}

export interface Judge {
  id: string;
  name: string;
  tracks: Track[];
}

export interface Criterion {
  id: string;
  name: string;
  weight: {
    [TRL.IDEATION]: number;
    [TRL.PROTOTYPE]: number;
  };
}

export interface Score {
  id: string;
  projectId: string;
  judgeId: string;
  criteriaScores: {
    [criterionId: string]: number;
  };
  juryTrl?: TRL;
  notes?: string;
}

export interface ProjectResult {
    project: Project;
    scores: Score[];
    finalScore: number;
    avgWeightedScore: number;
    judgeStats: {
        [judgeId: string]: {
            raw: number;
            weighted: number;
            normalized: number;
        };
    };
    rank: number;
}