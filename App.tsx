import React, { useState, useEffect } from 'react';
import SafetyHeader from './components/SafetyHeader';
import InputSection from './components/InputSection';
import ResultsDisplay from './components/ResultsDisplay';
import { analyzeLabReport } from './services/geminiService';
import { LabAnalysisResponse } from './types';
import { AlertCircle, Key } from 'lucide-react';

const App: React.FC = () => {
  const [result, setResult] = useState<LabAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      try {
        if (window.aistudio) {
          const has = await window.aistudio.hasSelectedApiKey();
          setHasKey(has);
        } else {
          // If not in AI Studio environment, assume env var is set manually or handled externally
          setHasKey(true);
        }
      } catch (e) {
        console.error("Error checking API key status:", e);
        setHasKey(true);
      } finally {
        setIsCheckingKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success after dialog closes to mitigate race condition
        setHasKey(true);
        setError(null);
      } catch (e) {
        console.error("Error selecting key:", e);
      }
    }
  };

  const handleAnalyze = async (text: string, fileData: string | undefined, mimeType: string) => {
    setLoading(true);
    setError(null);
    try {
      // Pass the mimeType (e.g., 'application/pdf') to the service
      const data = await analyzeLabReport(text, fileData, mimeType);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      
      const errorMessage = err.toString();
      // Handle permission errors (403) or missing entity errors by prompting for key re-selection
      if (
        errorMessage.includes('403') || 
        errorMessage.includes('The caller does not have permission') || 
        errorMessage.includes('Requested entity was not found')
      ) {
        setHasKey(false);
        setError("Access denied. Please select a valid API Key to continue.");
      } else {
        setError("We couldn't analyze that report. Please ensure the file is a clear image or PDF, or try pasting the text values directly.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse bg-slate-200 h-12 w-12 rounded-full"></div>
      </div>
    );
  }

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center space-y-6">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Key className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">API Key Required</h2>
            <p className="text-slate-600 mt-2 leading-relaxed">
              To use LabLingo, you need to select a Google Cloud API key for the Gemini API.
            </p>
          </div>
          <button
            onClick={handleSelectKey}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            Select API Key
          </button>
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-100">
            <p>Please select a key from a paid GCP project.</p> 
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noreferrer" 
              className="underline hover:text-blue-600 inline-block mt-1"
            >
              View Billing Documentation
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SafetyHeader />
      
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!result ? (
          <div className="space-y-8">
            <div className="text-center space-y-4 mb-10">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Understand your lab results.</h2>
              <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
                Upload a photo (PDF/Image) or paste text from your recent blood work. We'll translate the medical jargon into plain English.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-700 animate-fade-in">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Analysis Failed</h3>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <InputSection onAnalyze={handleAnalyze} isAnalyzing={loading} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-center text-sm text-slate-500">
              <div>
                <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-blue-600 font-bold border border-slate-100">1</div>
                <p>Upload your lab report (PDF or Photo)</p>
              </div>
              <div>
                <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-blue-600 font-bold border border-slate-100">2</div>
                <p>AI analyzes values against standard ranges</p>
              </div>
              <div>
                <div className="bg-white w-12 h-12 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-blue-600 font-bold border border-slate-100">3</div>
                <p>Get a clear, plain-English breakdown</p>
              </div>
            </div>
          </div>
        ) : (
          <ResultsDisplay data={result} onReset={handleReset} />
        )}
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-xs">
          <p>© {new Date().getFullYear()} LabLingo. Powered by Gemini.</p>
          <p className="mt-2">Privacy focused: Your data is processed for analysis and not stored permanently.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
