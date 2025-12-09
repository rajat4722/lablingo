import React from 'react';
import { LabAnalysisResponse, TestResult, StatusColor } from '../types';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface ResultsDisplayProps {
  data: LabAnalysisResponse;
  onReset: () => void;
}

const StatusIcon = ({ status }: { status: StatusColor }) => {
  switch (status) {
    case 'Green':
      return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    case 'Yellow':
      return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    case 'Red':
      return <AlertOctagon className="h-6 w-6 text-red-500" />;
    default:
      return <Info className="h-6 w-6 text-slate-400" />;
  }
};

const StatusBadge = ({ status }: { status: StatusColor }) => {
  const styles = {
    Green: 'bg-green-100 text-green-800 border-green-200',
    Yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Red: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {status === 'Green' ? 'Normal' : status === 'Yellow' ? 'Borderline' : 'Attention Needed'}
    </span>
  );
};

const ResultCard: React.FC<{ name: string; result: TestResult }> = ({ name, result }) => {
  const [expanded, setExpanded] = React.useState(false);

  // Dynamic border based on status
  const borderClass = 
    result.status_color === 'Red' ? 'border-l-4 border-l-red-500' :
    result.status_color === 'Yellow' ? 'border-l-4 border-l-yellow-400' :
    'border-l-4 border-l-green-500';

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mb-4 transition-all hover:shadow-md ${borderClass}`}>
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-900 capitalize">{name.replace(/_/g, ' ')}</h3>
              <StatusBadge status={result.status_color} />
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold text-slate-800">{result.value}</span>
              {result.unit && <span className="text-sm text-slate-500">{result.unit}</span>}
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {result.short_explanation}
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-between h-full gap-4">
            <StatusIcon status={result.status_color} />
            {expanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100">
          <div className="grid gap-3 text-sm">
            <div>
              <span className="font-semibold text-slate-700">Detailed Analysis:</span>
              <p className="text-slate-600 mt-1">{result.long_explanation}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="bg-white p-3 rounded border border-slate-200">
                <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Reference Range</span>
                <span className="text-slate-700 font-mono">{result.reference_range_used || 'Default Standard Range'}</span>
              </div>
              
              <div className="bg-blue-50 p-3 rounded border border-blue-100">
                <span className="block text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">Suggested Next Step</span>
                <span className="text-slate-800 font-medium">{result.suggested_next_steps}</span>
              </div>
            </div>
            
            {result.uncertain && (
              <div className="flex items-start gap-2 text-amber-700 bg-amber-50 p-2 rounded text-xs mt-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>The unit or value was ambiguous in the source. Please verify with the original report.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data, onReset }) => {
  const tests = Object.entries(data.tests) as [string, TestResult][];
  
  const attentionCount = tests.filter(([_, t]) => t.status_color === 'Red').length;
  const borderlineCount = tests.filter(([_, t]) => t.status_color === 'Yellow').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Analysis Summary</h2>
        <p className="text-slate-700 leading-relaxed text-lg mb-6">
          {data.overall_summary}
        </p>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-sm">Total Tests:</span>
            <span className="font-bold text-slate-900">{tests.length}</span>
          </div>
          {attentionCount > 0 && (
             <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
             <span className="text-red-700 text-sm font-medium">Attention Needed:</span>
             <span className="font-bold text-red-800">{attentionCount}</span>
           </div>
          )}
           {borderlineCount > 0 && (
             <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-100">
             <span className="text-yellow-700 text-sm font-medium">Borderline:</span>
             <span className="font-bold text-yellow-800">{borderlineCount}</span>
           </div>
          )}
        </div>
      </div>

      {/* Test Results List */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-1">Detailed Breakdown</h3>
        {tests.length > 0 ? (
          tests.map(([key, result]) => (
            <ResultCard key={key} name={key} result={result} />
          ))
        ) : (
          <p className="text-slate-500 italic">No valid test data found to analyze.</p>
        )}
      </div>

      {/* Safety Notice Footer */}
      <div className="bg-slate-100 rounded-lg p-4 text-xs text-slate-500 border border-slate-200 text-center">
        <p className="font-semibold mb-1">Safety Notice</p>
        <p>{data.safety_notice}</p>
      </div>

      <button
        onClick={onReset}
        className="w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
      >
        Analyze Another Report
      </button>
    </div>
  );
};

export default ResultsDisplay;