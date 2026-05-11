import React, { useState } from 'react';
import toast from 'react-hot-toast';
import axiosInstance from '../../../utils/axiosInstance.util';

const InputWrapper = ({ label, children }) => (
  <div className="mb-5">
    <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">{label}</label>
    {children}
  </div>
);

export default function ChecklistForm({ vehicleId, onSuccess }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    exterior: {
      paintCondition: 5,
      scratches: false,
      dents: false,
      rust: false,
      tiresCondition: 'Good',
      notes: ''
    },
    interior: {
      seatsCondition: 'Good',
      dashboardCondition: 'Good',
      acWorks: true,
      electronicsWork: true,
      notes: ''
    },
    engine: {
      fluidLeaks: false,
      abnormalNoise: false,
      startupSmoothness: 'Smooth',
      batteryHealth: 'Good',
      notes: ''
    },
    testDrive: {
      brakesCondition: 'Good',
      steeringFeel: 'Smooth',
      suspension: 'Smooth',
      transmissionShift: 'Smooth',
      notes: ''
    },
    overallRating: 5,
    isApprovedForAuction: true,
    mechanicSummary: ''
  });

  const updateSection = (section, field, value) => {
    setForm(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 5) return setStep(s => s + 1);

    setLoading(true);
    try {
      const submitData = {
        exterior: form.exterior,
        interior: form.interior,
        engine: form.engine,
        testDrive: form.testDrive,
        overallRating: form.overallRating,
        isApprovedForAuction: form.isApprovedForAuction,
        mechanicSummary: form.mechanicSummary
      };

      await axiosInstance.post(`/mechanic/submit-inspection/${vehicleId}`, submitData);
      toast.success('Inspection report submitted successfully!');
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit inspection report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 md:p-12 relative overflow-hidden mt-8">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black text-gray-900">Multi-Point Inspection</h3>
        <span className="bg-indigo-50 text-indigo-700 font-bold px-4 py-1.5 rounded-full text-sm border border-indigo-100">
          Step {step} of 5
        </span>
      </div>

      <div className="w-full bg-gray-100 h-2.5 rounded-full mb-10 overflow-hidden relative">
        <div
          className="absolute top-0 left-0 h-full bg-indigo-500 transition-all duration-300 ease-out"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xl font-bold text-indigo-900 border-b border-gray-100 pb-3 mb-6">Exterior & Body Check</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <InputWrapper label="Paint Condition (1-10)">
                <input type="number" min="1" max="10" required className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl" value={form.exterior.paintCondition} onChange={e => updateSection('exterior', 'paintCondition', Number(e.target.value))} />
              </InputWrapper>
              <InputWrapper label="Tires Condition">
                <select required className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl" value={form.exterior.tiresCondition} onChange={e => updateSection('exterior', 'tiresCondition', e.target.value)}>
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Needs Replacement">Needs Replacement</option>
                </select>
              </InputWrapper>
            </div>
            <div className="grid grid-cols-3 gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                <input type="checkbox" checked={form.exterior.scratches} onChange={e => updateSection('exterior', 'scratches', e.target.checked)} />
                Has Scratches
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                <input type="checkbox" checked={form.exterior.dents} onChange={e => updateSection('exterior', 'dents', e.target.checked)} />
                Has Dents
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                <input type="checkbox" checked={form.exterior.rust} onChange={e => updateSection('exterior', 'rust', e.target.checked)} />
                Has Rust
              </label>
            </div>
            <InputWrapper label="Exterior Notes">
              <textarea className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl resize-none h-24" value={form.exterior.notes} onChange={e => updateSection('exterior', 'notes', e.target.value)} />
            </InputWrapper>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xl font-bold text-indigo-900 border-b border-gray-100 pb-3 mb-6">Interior & Electronics</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <InputWrapper label="Seats & Upholstery">
                <select required className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl" value={form.interior.seatsCondition} onChange={e => updateSection('interior', 'seatsCondition', e.target.value)}>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Torn/Damaged">Torn/Damaged</option>
                </select>
              </InputWrapper>
              <InputWrapper label="Dashboard & Trims">
                <select required className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl" value={form.interior.dashboardCondition} onChange={e => updateSection('interior', 'dashboardCondition', e.target.value)}>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Scratched/Cracked">Scratched/Cracked</option>
                </select>
              </InputWrapper>
            </div>
            <div className="grid grid-cols-2 gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                <input type="checkbox" checked={form.interior.acWorks} onChange={e => updateSection('interior', 'acWorks', e.target.checked)} />
                A/C Works Normally
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                <input type="checkbox" checked={form.interior.electronicsWork} onChange={e => updateSection('interior', 'electronicsWork', e.target.checked)} />
                Electronics/Infotainment Working
              </label>
            </div>
            <InputWrapper label="Interior Notes">
              <textarea className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl resize-none h-24" value={form.interior.notes} onChange={e => updateSection('interior', 'notes', e.target.value)} />
            </InputWrapper>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xl font-bold text-indigo-900 border-b border-gray-100 pb-3 mb-6">Engine, Battery & Fluids</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <InputWrapper label="Startup Smoothness">
                <select required className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl" value={form.engine.startupSmoothness} onChange={e => updateSection('engine', 'startupSmoothness', e.target.value)}>
                  <option value="Smooth">Smooth</option>
                  <option value="Rough">Rough</option>
                  <option value="Failed">Failed</option>
                </select>
              </InputWrapper>
              <InputWrapper label="Battery Health">
                <select required className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl" value={form.engine.batteryHealth} onChange={e => updateSection('engine', 'batteryHealth', e.target.value)}>
                  <option value="Good">Good</option>
                  <option value="Weak">Weak</option>
                  <option value="Dead">Dead</option>
                </select>
              </InputWrapper>
            </div>
            <div className="grid grid-cols-2 gap-4 p-5 bg-gray-50 rounded-xl border border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                <input type="checkbox" checked={form.engine.fluidLeaks} onChange={e => updateSection('engine', 'fluidLeaks', e.target.checked)} />
                Fluid/Oil Leaks Detected
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                <input type="checkbox" checked={form.engine.abnormalNoise} onChange={e => updateSection('engine', 'abnormalNoise', e.target.checked)} />
                Abnormal Engine Noises
              </label>
            </div>
            <InputWrapper label="Engine Notes">
              <textarea className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl resize-none h-24" value={form.engine.notes} onChange={e => updateSection('engine', 'notes', e.target.value)} />
            </InputWrapper>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xl font-bold text-indigo-900 border-b border-gray-100 pb-3 mb-6">Test Drive & Suspension</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <InputWrapper label="Brakes Condition">
                <select required className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl" value={form.testDrive.brakesCondition} onChange={e => updateSection('testDrive', 'brakesCondition', e.target.value)}>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Spongy">Spongy</option>
                  <option value="Needs Replacement">Needs Replacement</option>
                </select>
              </InputWrapper>
              <InputWrapper label="Steering Feel">
                <select required className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl" value={form.testDrive.steeringFeel} onChange={e => updateSection('testDrive', 'steeringFeel', e.target.value)}>
                  <option value="Smooth">Smooth</option>
                  <option value="Vibrates">Vibrates</option>
                  <option value="Pulls to side">Pulls to side</option>
                </select>
              </InputWrapper>
              <InputWrapper label="Suspension/Shocks">
                <select required className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl" value={form.testDrive.suspension} onChange={e => updateSection('testDrive', 'suspension', e.target.value)}>
                  <option value="Smooth">Smooth</option>
                  <option value="Noisy">Noisy</option>
                  <option value="Bouncy">Bouncy</option>
                </select>
              </InputWrapper>
              <InputWrapper label="Transmission Shifts">
                <select required className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl" value={form.testDrive.transmissionShift} onChange={e => updateSection('testDrive', 'transmissionShift', e.target.value)}>
                  <option value="Smooth">Smooth</option>
                  <option value="Jerky">Jerky</option>
                  <option value="Slipping">Slipping</option>
                  <option value="N/A">N/A</option>
                </select>
              </InputWrapper>
            </div>
            <InputWrapper label="Test Drive Notes">
              <textarea className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl resize-none h-24" value={form.testDrive.notes} onChange={e => updateSection('testDrive', 'notes', e.target.value)} />
            </InputWrapper>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6 animate-fade-in">
            <h4 className="text-xl font-bold text-indigo-900 border-b border-gray-100 pb-3 mb-6">Final Mechanic Verdict</h4>
            <div className={`p-6 rounded-2xl border-2 mb-6 ${form.isApprovedForAuction ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <label className="flex items-center gap-4 cursor-pointer">
                <input type="checkbox" className={`w-8 h-8 rounded ${form.isApprovedForAuction ? 'text-green-600 focus:ring-green-500' : 'text-red-600 focus:ring-red-500'}`} checked={form.isApprovedForAuction} onChange={e => setForm(f => ({ ...f, isApprovedForAuction: e.target.checked }))} />
                <div>
                  <div className={`text-xl font-black ${form.isApprovedForAuction ? 'text-green-800' : 'text-red-800'}`}>APPROVED FOR AUCTION?</div>
                  <div className={`text-sm font-medium ${form.isApprovedForAuction ? 'text-green-600' : 'text-red-600'}`}>
                    {form.isApprovedForAuction ? 'Vehicle meets minimal safety and quality standards.' : 'Vehicle DOES NOT meet standards. Recommending rejection.'}
                  </div>
                </div>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-end">
              <InputWrapper label="Overall Rating (1-10)">
                <div className="relative">
                  <input type="number" min="1" max="10" required className="w-full text-2xl font-black p-4 border border-gray-200 bg-gray-50 rounded-xl text-center" value={form.overallRating} onChange={e => setForm(f => ({ ...f, overallRating: Number(e.target.value) }))} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">/ 10</span>
                </div>
              </InputWrapper>
            </div>

            <InputWrapper label="Executive Summary">
              <textarea required className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl resize-none h-32" value={form.mechanicSummary} onChange={e => setForm(f => ({ ...f, mechanicSummary: e.target.value }))} />
            </InputWrapper>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1 || loading}
            className={`px-6 py-3 font-bold rounded-xl text-gray-700 hover:bg-gray-100 transition-colors ${step === 1 ? 'invisible' : ''}`}
          >
            ← Previous
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`px-10 py-3 font-black rounded-xl text-white shadow-sm transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100 ${
              step === 5 ? 'bg-gray-900 hover:bg-black text-lg' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? 'Submitting Report...' : (step === 5 ? 'Submit Report' : 'Next Step →')}
          </button>
        </div>
      </form>
    </div>
  );
}
