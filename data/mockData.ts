import { Project, Judge, Criterion, Score, TRL, TRACKS } from '../types';

export const MOCK_CRITERIA: Criterion[] = [
  { id: 'c1', name: 'Technical Innovation & Complexity', weight: { [TRL.IDEATION]: 25, [TRL.PROTOTYPE]: 30 } },
  { id: 'c2', name: 'Hedera Integration & Use Case', weight: { [TRL.IDEATION]: 30, [TRL.PROTOTYPE]: 30 } },
  { id: 'c3', name: 'Feasibility & Business Potential', weight: { [TRL.IDEATION]: 25, [TRL.PROTOTYPE]: 20 } },
  { id: 'c4', name: 'Presentation & Pitch Quality', weight: { [TRL.IDEATION]: 20, [TRL.PROTOTYPE]: 20 } },
];

export const MOCK_JUDGES: Judge[] = [
  { id: 'j1', name: 'Dr. Leemon Baird', tracks: ['AI and Depin', 'Onchain Finance & RWA'] },
  { id: 'j2', name: 'Mance Harmon', tracks: ['DLT for Operations', 'Immersive Experiences'] },
  { id: 'j3', name: 'Shayne Higdon', tracks: ['Cross-Chain Track', 'Onchain Finance & RWA'] },
  { id: 'j4', name: 'Zenobia Godschalk', tracks: ['AI and Depin', 'Immersive Experiences'] },
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'p1',
        name: 'DeFiYield Pro',
        description: 'An AI-powered yield aggregator for Hedera-based DeFi protocols, optimizing returns for liquidity providers.',
        track: 'Onchain Finance & RWA',
        trl: TRL.PROTOTYPE,
        links: [{label: 'GitHub', url: 'https://github.com'}, {label: 'Demo Video', url: 'https://youtube.com'}]
    },
    {
        id: 'p2',
        name: 'VeriSupply',
        description: 'A decentralized supply chain tracking system using Hedera Consensus Service for transparent and immutable logistics.',
        track: 'DLT for Operations',
        trl: TRL.PROTOTYPE,
    },
    {
        id: 'p3',
        name: 'AI Guardian',
        description: 'A concept for a decentralized AI oracle network secured by Hedera, providing tamper-proof data feeds for smart contracts.',
        track: 'AI and Depin',
        trl: TRL.IDEATION,
        links: [{label: 'Pitch Deck', url: 'https://pitch.com'}]
    },
    {
        id: 'p4',
        name: 'HederaVerse',
        description: 'A proof-of-concept metaverse platform where in-game assets are tokenized as NFTs on Hedera.',
        track: 'Immersive Experiences',
        trl: TRL.IDEATION,
    },
    {
        id: 'p5',
        name: 'ChainLink Bridge for HBAR',
        description: 'A cross-chain bridge to enable seamless asset transfer between Ethereum and Hedera networks.',
        track: 'Cross-Chain Track',
        trl: TRL.PROTOTYPE,
    },
    {
        id: 'p6',
        name: 'RWA Tokenizer',
        description: 'Platform to tokenize real-world assets like real estate and art, leveraging Hedera Token Service.',
        track: 'Onchain Finance & RWA',
        trl: TRL.PROTOTYPE,
    }
];


export const MOCK_SCORES: Score[] = [
    // Scores for DeFiYield Pro (p1)
    { id: 's1', projectId: 'p1', judgeId: 'j1', criteriaScores: { c1: 8, c2: 9, c3: 7, c4: 8 }, notes: 'Very strong technical implementation.' },
    { id: 's2', projectId: 'p1', judgeId: 'j3', criteriaScores: { c1: 9, c2: 8, c3: 8, c4: 7 }, juryTrl: TRL.PROTOTYPE },

    // Scores for VeriSupply (p2)
    { id: 's3', projectId: 'p2', judgeId: 'j2', criteriaScores: { c1: 7, c2: 8, c3: 9, c4: 7 } },
    
    // Scores for AI Guardian (p3)
    { id: 's4', projectId: 'p3', judgeId: 'j1', criteriaScores: { c1: 9, c2: 9, c3: 8, c4: 7 }, juryTrl: TRL.IDEATION, notes: 'Great idea, needs a solid roadmap.' },
    { id: 's5', projectId: 'p3', judgeId: 'j4', criteriaScores: { c1: 8, c2: 10, c3: 7, c4: 8 } },

    // Scores for HederaVerse (p4)
    { id: 's6', projectId: 'p4', judgeId: 'j2', criteriaScores: { c1: 6, c2: 7, c3: 7, c4: 9 } },
    { id: 's7', projectId: 'p4', judgeId: 'j4', criteriaScores: { c1: 7, c2: 6, c3: 8, c4: 8 }, notes: 'Pitch was excellent.' },

    // RWA Tokenizer (p6) is judged by j1 and j3
    { id: 's8', projectId: 'p6', judgeId: 'j1', criteriaScores: { c1: 9, c2: 7, c3: 9, c4: 8 } },

];
