import React, { useState, useEffect } from 'react';
import { Criterion, TRL } from '../types';

interface CriterionModalProps {
  criterion: Criterion | null;
  onClose: () => void;
  onSave: (criterion: Omit<Criterion, 'id'> | Criterion) => void;
}

const CriterionModal: React.FC<CriterionModalProps> = ({ criterion, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [ideationWeight, setIdeationWeight] = useState(0);
  const [prototypeWeight, setPrototypeWeight] = useState(0);

  useEffect(() => {
    if (criterion) {
      setName(criterion.name);
      setIdeationWeight(criterion.weight[TRL.IDEATION]);
      setPrototypeWeight(criterion.weight[TRL.PROTOTYPE]);
    } else {
      setName('');
      setIdeationWeight(20); // Default value
      setPrototypeWeight(20); // Default value
    }
  }, [criterion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        alert('Criterion name cannot be empty.');
        return;
    }
    
    if (isNaN(ideationWeight) || isNaN(prototypeWeight) || ideationWeight < 0 || prototypeWeight < 0 || ideationWeight > 100 || prototypeWeight > 100) {
        alert('Weights must be a number between 0 and 100.');
        return;
    }

    const criterionData = {
        name: name.trim(),
        weight: {
            [TRL.IDEATION]: Number(ideationWeight),
            [TRL.PROTOTYPE]: Number(prototypeWeight),
        }
    };

    if (criterion) {
        onSave({ ...criterionData, id: criterion.id });
    } else {
        onSave(criterionData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{criterion ? 'Edit Criterion' : 'Add New Criterion'}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Criterion Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5c11c9] focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="ideationWeight" className="block text-sm font-medium text-gray-700 mb-1">Ideation Weight (%)</label>
                    <input
                        type="number"
                        id="ideationWeight"
                        value={ideationWeight}
                        onChange={(e) => setIdeationWeight(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5c11c9] focus:outline-none"
                        min="0"
                        max="100"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="prototypeWeight" className="block text-sm font-medium text-gray-700 mb-1">Prototype Weight (%)</label>
                    <input
                        type="number"
                        id="prototypeWeight"
                        value={prototypeWeight}
                        onChange={(e) => setPrototypeWeight(Number(e.target.value))}
                        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#5c11c9] focus:outline-none"
                        min="0"
                        max="100"
                        required
                    />
                </div>
            </div>
          </div>
          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 rounded-md bg-[#5c11c9] hover:bg-[#4a0e9f] text-white font-medium transition-colors">
              Save Criterion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriterionModal;