import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, FileType } from 'lucide-react';

interface InputSectionProps {
  onAnalyze: (text: string, fileData: string | undefined, mimeType: string) => void;
  isAnalyzing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    const validDocTypes = ['application/pdf'];
    
    if (!validImageTypes.includes(file.type) && !validDocTypes.includes(file.type)) {
      alert("Please upload a supported file (PDF, JPEG, PNG).");
      return;
    }
    
    setMimeType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      setFileData(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the container entirely, not just entering a child element
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragActive) setDragActive(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    // Reset input value to allow selecting the same file again if needed
    e.target.value = '';
  };

  const handleBoxClick = () => {
    if (!fileData) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileData(null);
    setMimeType('image/png'); // Reset to default
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && !fileData) return;
    onAnalyze(text, fileData || undefined, mimeType);
  };

  const isPdf = mimeType === 'application/pdf';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Input Results</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* File Upload Area */}
          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 transition-colors text-center cursor-pointer outline-none ${
              dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleBoxClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
              onChange={handleFileInput}
            />

            {fileData ? (
              <div className="relative inline-flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border border-slate-200" onClick={(e) => e.stopPropagation()}>
                {isPdf ? (
                  <div className="flex flex-col items-center gap-2 text-slate-700">
                    <FileType className="h-12 w-12 text-red-500" />
                    <span className="font-medium text-sm">PDF Document Uploaded</span>
                  </div>
                ) : (
                  <img src={fileData} alt="Preview" className="max-h-48 rounded-lg shadow-sm" />
                )}
                
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute -top-3 -right-3 bg-white text-slate-500 p-1.5 rounded-full shadow-lg border border-slate-200 hover:text-red-500 transition-colors z-10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 pointer-events-none">
                <div className="bg-slate-100 p-3 rounded-full">
                  <Upload className="h-6 w-6 text-slate-500" />
                </div>
                <div>
                  <p className="font-medium text-blue-600">
                    Click to upload
                  </p>
                  <span className="text-slate-500"> or drag and drop</span>
                </div>
                <p className="text-xs text-slate-400">PDF, PNG, JPG up to 10MB</p>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-sm text-slate-400 uppercase">Or paste text</span>
            </div>
          </div>

          {/* Text Input */}
          <div>
            <label htmlFor="lab-text" className="sr-only">Lab Text</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-slate-400" />
              </div>
              <textarea
                id="lab-text"
                rows={4}
                className="block w-full rounded-xl border-slate-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border resize-none"
                placeholder="Paste your lab values here (e.g., 'LDL 140, HDL 35')..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={(!text && !fileData) || isAnalyzing}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-xl text-white font-medium shadow-sm transition-all
              ${(!text && !fileData) || isAnalyzing 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'}`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Analyzing Report...
              </>
            ) : (
              'Analyze Results'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputSection;