import React, { useState, useMemo } from 'react';
import { Project, Judge, Criterion, Score, ProjectResult, TRACKS, TRL, Track, ProjectLink } from '../types';
import ResultsTable from './ResultsTable';
import EditProjectModal from './EditProjectModal';
import JudgeModal from './JudgeModal';
import CriterionModal from './CriterionModal';
import { TrophyIcon, ProjectIcon, JudgeIcon, ListIcon, EditIcon, DeleteIcon } from './icons';
import { calculateFinalRankings } from '../services/evaluationService';

// Add declaration for XLSX from CDN
declare var XLSX: any;

interface AdminDashboardProps {
  projects: Project[];
  judges: Judge[];
  criteria: Criterion[];
  scores: Score[];
  addProjects: (newProjects: Omit<Project, 'id'>[]) => Promise<void>;
  editProject: (updatedProject: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addJudge: (newJudge: Omit<Judge, 'id'>) => Promise<Judge>;
  editJudge: (updatedJudge: Judge) => Promise<void>;
  deleteJudge: (judgeId: string) => Promise<void>;
  addCriterion: (newCriterion: Omit<Criterion, 'id'>) => Promise<void>;
  editCriterion: (updatedCriterion: Criterion) => Promise<void>;
  deleteCriterion: (criterionId: string) => Promise<void>;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center space-x-4">
        <div className="bg-gray-100 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-500 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    </div>
);


const AdminDashboard: React.FC<AdminDashboardProps> = ({ projects, judges, criteria, scores, addProjects, editProject, deleteProject, addJudge, editJudge, deleteJudge, addCriterion, editCriterion, deleteCriterion }) => {
    const [activeTab, setActiveTab] = useState('results');
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importTrack, setImportTrack] = useState<Track>(TRACKS[0]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [editingJudge, setEditingJudge] = useState<Judge | null>(null);
    const [isJudgeModalOpen, setIsJudgeModalOpen] = useState(false);
    const [editingCriterion, setEditingCriterion] = useState<Criterion | null>(null);
    const [isCriterionModalOpen, setIsCriterionModalOpen] = useState(false);
    
    const finalResults = useMemo(() => calculateFinalRankings(projects, scores, criteria), [projects, scores, criteria]);

    const totalScoresPossible = useMemo(() => {
        // Assuming each project needs 2 judges from the mock data logic. This can be made more dynamic.
        return projects.length * 2;
    }, [projects]);
    const evaluationProgress = totalScoresPossible > 0 ? (scores.length / totalScoresPossible) * 100 : 0;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImportFile(e.target.files[0]);
        } else {
            setImportFile(null);
        }
    };

    const handleOpenJudgeModal = (judge: Judge | null) => {
        setEditingJudge(judge);
        setIsJudgeModalOpen(true);
    };

    const handleSaveJudge = async (judgeData: Omit<Judge, 'id'> | Judge) => {
        if ('id' in judgeData) {
            await editJudge(judgeData);
        } else {
            await addJudge(judgeData);
        }
        setIsJudgeModalOpen(false);
        setEditingJudge(null);
    };

    const handleOpenCriterionModal = (criterion: Criterion | null) => {
        setEditingCriterion(criterion);
        setIsCriterionModalOpen(true);
    };

    const handleSaveCriterion = async (criterionData: Omit<Criterion, 'id'> | Criterion) => {
        if ('id' in criterionData) {
            await editCriterion(criterionData);
        } else {
            await addCriterion(criterionData);
        }
        setIsCriterionModalOpen(false);
        setEditingCriterion(null);
    };

    const handleImport = () => {
        if (!importFile) {
            alert("Please select a file to import.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                // FIX: Cast the result of `sheet_to_json` instead of passing a type argument, as `XLSX` is untyped.
                const json = XLSX.utils.sheet_to_json(worksheet) as { 'Project Name': string; 'Description': string; 'TRL': string; 'Links'?: string }[];

                const getTRL = (trlString: string): TRL => {
                    if (typeof trlString !== 'string') return TRL.IDEATION;
                    const lowerTrl = trlString.toLowerCase();
                    if (lowerTrl.includes('prototype') || lowerTrl.includes('4-6')) {
                        return TRL.PROTOTYPE;
                    }
                    return TRL.IDEATION;
                };

                const newProjects: Omit<Project, 'id'>[] = json
                    .filter(row => row['Project Name']) // Ensure project name exists
                    .map((row, index) => {
                        const links: ProjectLink[] = row.Links?.split(',')
                            .map(linkPair => {
                                const [label, url] = linkPair.split('|').map(s => s.trim());
                                return { label, url };
                            })
                            .filter(l => l.label && l.url) || [];

                        return {
                            name: row['Project Name'],
                            description: row['Description'] || 'No description provided.',
                            track: importTrack,
                            trl: getTRL(row['TRL']),
                            links: links.length > 0 ? links : undefined,
                        };
                    });
                
                if (newProjects.length > 0) {
                    await addProjects(newProjects);
                    alert(`${newProjects.length} projects processed from the file.`);
                } else {
                    alert('No valid projects found in the file to import.');
                }
                
                setImportFile(null);
                const fileInput = document.getElementById('project-import-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';

            } catch (error) {
                console.error("Error importing file:", error);
                alert("Failed to import projects. Please check the file format and column headers ('Project Name', 'Description', 'TRL', 'Links') and try again.");
            }
        };
        reader.readAsArrayBuffer(importFile);
    };


    const renderContent = () => {
        switch (activeTab) {
            case 'results':
                return <ResultsTable results={finalResults} judges={judges} />;
            case 'projects':
                return (
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                             <h3 className="text-xl font-bold">All Projects</h3>
                             <span className="font-mono text-[#5c11c9] bg-[#5c11c9]/10 px-3 py-1 rounded-md text-sm">{projects.length} Projects</span>
                        </div>
                        
                        {/* Import Section */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Import Projects from Excel</h4>
                            <p className="text-sm text-gray-500 mb-4">
                                Upload an Excel file (.xlsx, .xls, .csv) with columns: "Project Name", "Description", "TRL", and "Links" (optional, format: Label1|URL1, Label2|URL2).
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className='w-full sm:w-auto'>
                                  <label htmlFor="track-select" className="sr-only">Select Track</label>
                                  <select
                                      id="track-select"
                                      value={importTrack}
                                      onChange={(e) => setImportTrack(e.target.value as Track)}
                                      className="bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5c11c9] focus:outline-none w-full"
                                  >
                                      {TRACKS.map(track => <option key={track} value={track}>{track}</option>)}
                                  </select>
                                </div>
                                <div className='w-full flex-1'>
                                    <label htmlFor="project-import-input" className="sr-only">Choose file</label>
                                    <input 
                                        id="project-import-input"
                                        type="file" 
                                        accept=".xlsx, .xls, .csv"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#5c11c9]/10 file:text-[#5c11c9] hover:file:bg-[#5c11c9]/20 cursor-pointer"
                                    />
                                </div>
                                <button
                                    onClick={handleImport}
                                    disabled={!importFile}
                                    className="px-6 py-2 rounded-md bg-[#5c11c9] hover:bg-[#4a0e9f] text-white font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                                >
                                    Import
                                </button>
                            </div>
                        </div>

                        <ul className="divide-y divide-gray-200 max-h-[50vh] overflow-y-auto pr-2">
                            {projects.map(p => (
                                <li key={p.id} className="py-3 flex justify-between items-center group">
                                    <div>
                                        <p className="font-semibold text-gray-900">{p.name}</p>
                                        <p className="text-sm text-gray-500">{p.track} - {p.trl}</p>
                                    </div>
                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setEditingProject(p)}
                                            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                                            aria-label="Edit project"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteProject(p.id)}
                                            className="p-2 rounded-md bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-700 transition-colors"
                                            aria-label="Delete project"
                                        >
                                            <DeleteIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            case 'judges':
                 return (
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">All Judges</h3>
                            <button
                                onClick={() => handleOpenJudgeModal(null)}
                                className="px-4 py-2 rounded-md bg-[#5c11c9] hover:bg-[#4a0e9f] text-white font-medium transition-colors"
                            >
                                Add Judge
                            </button>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {judges.map(j => (
                                <li key={j.id} className="py-3 flex justify-between items-center group">
                                    <div>
                                        <p className="font-semibold text-gray-900">{j.name}</p>
                                        <p className="text-sm text-gray-500">Tracks: {j.tracks.join(', ')}</p>
                                    </div>
                                     <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenJudgeModal(j)}
                                            className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                                            aria-label="Edit judge"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteJudge(j.id)}
                                            className="p-2 rounded-md bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-700 transition-colors"
                                            aria-label="Delete judge"
                                        >
                                            <DeleteIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            case 'criteria':
                return (
                     <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Evaluation Criteria & Weights</h3>
                            <button
                                onClick={() => handleOpenCriterionModal(null)}
                                className="px-4 py-2 rounded-md bg-[#5c11c9] hover:bg-[#4a0e9f] text-white font-medium transition-colors"
                            >
                                Add Criterion
                            </button>
                        </div>
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2">Criterion</th>
                                    <th className="px-4 py-2 text-center">Ideation Weight</th>
                                    <th className="px-4 py-2 text-center">Prototype Weight</th>
                                    <th className="px-4 py-2 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                                {criteria.map(c => (
                                    <tr key={c.id}>
                                        <td className="px-4 py-2 font-medium text-gray-900">{c.name}</td>
                                        <td className="px-4 py-2 text-center font-mono">{c.weight[TRL.IDEATION]}%</td>
                                        <td className="px-4 py-2 text-center font-mono">{c.weight[TRL.PROTOTYPE]}%</td>
                                        <td className="px-4 py-2">
                                            <div className="flex space-x-2 justify-center">
                                                <button
                                                    onClick={() => handleOpenCriterionModal(c)}
                                                    className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                                                    aria-label="Edit criterion"
                                                >
                                                    <EditIcon className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteCriterion(c.id)}
                                                    className="p-2 rounded-md bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-700 transition-colors"
                                                    aria-label="Delete criterion"
                                                >
                                                    <DeleteIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
        }
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Projects" value={projects.length} icon={<ProjectIcon className="w-6 h-6 text-[#5c11c9]"/>} />
                <StatCard title="Total Judges" value={judges.length} icon={<JudgeIcon className="w-6 h-6 text-[#95e000]"/>} />
                <StatCard title="Scores Submitted" value={`${scores.length} / ${totalScoresPossible}`} icon={<ListIcon className="w-6 h-6 text-[#5c11c9]"/>} />
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <p className="text-gray-500 text-sm mb-2">Evaluation Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-[#5c11c9] h-2.5 rounded-full" style={{ width: `${evaluationProgress}%` }}></div>
                    </div>
                    <p className="text-right text-lg font-bold mt-1">{evaluationProgress.toFixed(1)}%</p>
                </div>
            </div>

             <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('results')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'results' ? 'border-[#5c11c9] text-[#5c11c9]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Results</button>
                    <button onClick={() => setActiveTab('projects')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'projects' ? 'border-[#5c11c9] text-[#5c11c9]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Projects</button>
                    <button onClick={() => setActiveTab('judges')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'judges' ? 'border-[#5c11c9] text-[#5c11c9]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Judges</button>
                    <button onClick={() => setActiveTab('criteria')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'criteria' ? 'border-[#5c11c9] text-[#5c11c9]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Criteria</button>
                </nav>
            </div>
            
            {renderContent()}

            {editingProject && (
                <EditProjectModal
                    project={editingProject}
                    onClose={() => setEditingProject(null)}
                    onSave={async (updatedProject) => {
                        await editProject(updatedProject);
                        setEditingProject(null);
                    }}
                />
            )}

            {isJudgeModalOpen && (
                <JudgeModal
                    judge={editingJudge}
                    onClose={() => {
                        setIsJudgeModalOpen(false);
                        setEditingJudge(null);
                    }}
                    onSave={handleSaveJudge}
                />
            )}

            {isCriterionModalOpen && (
                <CriterionModal
                    criterion={editingCriterion}
                    onClose={() => {
                        setIsCriterionModalOpen(false);
                        setEditingCriterion(null);
                    }}
                    onSave={handleSaveCriterion}
                />
            )}

        </div>
    );
};

export default AdminDashboard;
