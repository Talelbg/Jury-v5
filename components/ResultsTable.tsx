import React, { useState, useMemo } from 'react';
import { ProjectResult, Track, TRACKS, Judge } from '../types';

interface ExpandedRowProps {
    result: ProjectResult;
    judgeMap: Map<string, string>;
}

const ExpandedRow: React.FC<ExpandedRowProps> = ({ result, judgeMap }) => {
    return (
        <tr className="bg-gray-50">
            <td colSpan={7} className="p-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-bold mb-2 text-[#5c11c9]">{result.project.name} - Scoring Breakdown</h4>
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                            <tr>
                                <th className="p-2">Judge</th>
                                <th className="p-2 text-right">Avg. Raw Score</th>
                                <th className="p-2 text-right">Weighted Score</th>
                                <th className="p-2 text-right">Normalized (Z-Score)</th>
                            </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-200'>
                            {Object.keys(result.judgeStats).map((judgeId) => {
                                const stats = result.judgeStats[judgeId];
                                return (
                                    <tr key={judgeId}>
                                        <td className="p-2 font-medium">{judgeMap.get(judgeId) || judgeId}</td>
                                        <td className="p-2 text-right">{stats.raw.toFixed(2)}</td>
                                        <td className="p-2 text-right">{stats.weighted.toFixed(2)}</td>
                                        <td className="p-2 text-right font-bold">{stats.normalized.toFixed(3)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </td>
        </tr>
    );
};

interface ResultsTableProps {
  results: ProjectResult[];
  judges: Judge[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results, judges }) => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<Track | 'All'>('All');

  const judgeMap = useMemo(() => new Map(judges.map(j => [j.id, j.name])), [judges]);

  const filteredResults = useMemo(() => {
    if (selectedTrack === 'All') return results;
    return results.filter(r => r.project.track === selectedTrack);
  }, [results, selectedTrack]);

  const handleRowClick = (projectId: string) => {
    setExpandedRow(expandedRow === projectId ? null : projectId);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Final Rankings</h3>
        <select
          value={selectedTrack}
          onChange={(e) => setSelectedTrack(e.target.value as Track | 'All')}
          className="bg-white border border-gray-300 rounded-md px-3 py-1.5 focus:ring-2 focus:ring-[#5c11c9] focus:outline-none"
        >
          <option value="All">All Tracks</option>
          {TRACKS.map(track => <option key={track} value={track}>{track}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Rank</th>
              <th scope="col" className="px-6 py-3">Project</th>
              <th scope="col" className="px-6 py-3">Track</th>
              <th scope="col" className="px-6 py-3">TRL</th>
              <th scope="col" className="px-6 py-3 text-right">Avg. Weighted Score</th>
              <th scope="col" className="px-6 py-3 text-right">Final Score (Avg. Z-Score)</th>
              <th scope="col" className="px-6 py-3 text-center">Details</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200'>
            {filteredResults.map((result) => (
                <React.Fragment key={result.project.id}>
                    <tr 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(result.project.id)}
                    >
                        <td className="px-6 py-4 font-bold text-lg text-gray-900">
                           {result.rank}
                        </td>
                        <td scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            {result.project.name}
                        </td>
                        <td className="px-6 py-4">{result.project.track}</td>
                        <td className="px-6 py-4">
                             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${result.project.trl === 'Ideation (TRL 1-3)' ? 'bg-purple-100 text-purple-800' : 'bg-[#95e000]/20 text-[#5a8600]'}`}>
                                {result.project.trl.split(' ')[0]}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-base text-gray-700">
                            {result.avgWeightedScore.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-lg text-[#5c11c9]">
                            {result.finalScore.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-center">
                            <span className="font-medium text-[#5c11c9] hover:underline">
                                {expandedRow === result.project.id ? 'Hide' : 'View'}
                            </span>
                        </td>
                    </tr>
                    {expandedRow === result.project.id && <ExpandedRow result={result} judgeMap={judgeMap} />}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;