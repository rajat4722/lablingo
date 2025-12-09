import React from 'react';
import { Activity, ShieldAlert } from 'lucide-react';

const SafetyHeader: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">LabLingo</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Plain English Lab Explainer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-800">Not Medical Advice</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SafetyHeader;