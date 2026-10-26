import React, { useState, useEffect } from 'react';
import { 
  FileSearch, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { ATSResumeAnalysis, StudentProfileData } from '../types';
import { analyzeResumeText } from '../services/resumeAnalysisService';
import { extractTextFromPdf, isPdfFile, readFileAsDataUrl, formatFileSize } from '../utils/pdfExtractor';

interface ResumeAnalyzerProps {
  student: StudentProfileData;
  onScoreSaved?: (score: number) => void;
  onResumeAnalyzed?: (
    result: ATSResumeAnalysis, 
    resumeText: string, 
    fileName?: string, 
    pdfUrl?: string, 
    fileSize?: string
  ) => void;
}

export const ResumeAnalyzer: React.FC<ResumeAnalyzerProps> = ({ 
  student, 
  onScoreSaved, 
  onResumeAnalyzed 
}) => {
  const [resumeText, setResumeText] = useState(student.resumeText || '');
  const [analysis, setAnalysis] = useState<ATSResumeAnalysis | null>(() => {
    if (student.resumeText || student.skills?.length) {
      return analyzeResumeText(student.resumeText || student.skills.join(', '), student.preferred_role);
    }
    return null;
  });
  const [fileName, setFileName] = useState(student.resumeFileName || '');
  const [pdfUrl, setPdfUrl] = useState(student.resumePdfUrl || '');
  const [fileSize, setFileSize] = useState(student.resumeFileSize || '');
  const [isExtracting, setIsExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showRawText, setShowRawText] = useState(false);

  useEffect(() => {
    if (student.resumeText && !resumeText) {
      setResumeText(student.resumeText);
    }
    if (student.resumeFileName && !fileName) {
      setFileName(student.resumeFileName);
    }
    if (student.resumePdfUrl && !pdfUrl) {
      setPdfUrl(student.resumePdfUrl);
    }
    if (student.resumeFileSize && !fileSize) {
      setFileSize(student.resumeFileSize);
    }
  }, [student]);

  const runAnalysis = (text: string, currentFileName = fileName, currentPdfUrl = pdfUrl, currentFileSize = fileSize) => {
    const result = analyzeResumeText(text, student.preferred_role);
    setAnalysis(result);
    if (text.trim()) {
      onScoreSaved?.(result.atsScore);
      onResumeAnalyzed?.(
        result, 
        text, 
        currentFileName || undefined, 
        currentPdfUrl || undefined, 
        currentFileSize || undefined
      );
    }
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage('');

    // Strict validation: Resume must be in .PDF format
    if (!isPdfFile(file)) {
      setErrorMessage('Please upload your resume in .PDF format (.pdf file).');
      event.target.value = '';
      return;
    }

    try {
      setIsExtracting(true);
      const formattedSize = formatFileSize(file.size);
      setFileSize(formattedSize);
      setFileName(file.name);

      // 1. Read as Data URL to store and preview PDF
      const dataUrl = await readFileAsDataUrl(file);
      setPdfUrl(dataUrl);

      // 2. Extract text from PDF
      const extraction = await extractTextFromPdf(file);
      const extractedText = extraction.text.trim();

      if (!extractedText) {
        setErrorMessage('PDF attached successfully! Note: Could not extract selectable text layer (scanned or image-based PDF). You can paste or refine your resume text below for full ATS scoring.');
      }

      setResumeText(extractedText);
      runAnalysis(extractedText || student.skills.join(', '), file.name, dataUrl, formattedSize);
    } catch (err: any) {
      console.error('PDF extraction failed:', err);
      setErrorMessage(err.message || 'Failed to process PDF resume. Please ensure the file is a valid PDF.');
    } finally {
      setIsExtracting(false);
      event.target.value = '';
    }
  };

  const handleRemoveResume = () => {
    setFileName('');
    setPdfUrl('');
    setFileSize('');
    setResumeText('');
    setAnalysis(null);
    setErrorMessage('');
    onScoreSaved?.(0);
    onResumeAnalyzed?.(
      { atsScore: 0, readinessGrade: 'Critical Gaps', foundSkills: [], missingKeySkills: [], suggestions: ['Upload a PDF resume to analyze keywords.'] },
      '',
      undefined,
      undefined,
      undefined
    );
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>AI ATS Engine</span>
          </div>
          <h2 className="text-lg font-black text-slate-900">
            Resume Keyword & ATS Readiness Analyzer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload your official <strong>.PDF resume</strong> for real-time ATS scoring and keyword alignment against <strong>{student.preferred_role}</strong> criteria.
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <FileSearch className="w-5 h-5" />
        </div>
      </div>

      {/* Error / Warning Alert */}
      {errorMessage && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {/* PDF Upload Dropzone / Attached Card */}
      {fileName || pdfUrl ? (
        <div className="p-4 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-2xl border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 text-red-600 flex flex-col items-center justify-center shrink-0 shadow-xs">
              <FileText className="w-5 h-5 text-red-600" />
              <span className="text-[9px] font-black uppercase tracking-wider text-red-700">PDF</span>
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 truncate max-w-[260px] sm:max-w-[340px]" title={fileName}>
                  {fileName || 'resume.pdf'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  PDF Attached
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {fileSize ? `${fileSize} • ` : ''}Parsed for ATS keyword matching
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {pdfUrl && (
              <a
                href={pdfUrl}
                download={fileName || 'resume.pdf'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl transition-all shadow-xs cursor-pointer"
                title="Download or preview uploaded PDF"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>View PDF</span>
              </a>
            )}

            <label className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Replace PDF</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfUpload}
                disabled={isExtracting}
                className="sr-only"
              />
            </label>

            <button
              type="button"
              onClick={handleRemoveResume}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Remove PDF resume"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="relative flex flex-col items-center justify-center w-full min-h-36 p-6 rounded-2xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/30 hover:bg-indigo-50/60 transition-all cursor-pointer group text-center">
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handlePdfUpload}
            disabled={isExtracting}
            className="sr-only"
          />

          {isExtracting ? (
            <div className="flex flex-col items-center gap-2 text-indigo-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-xs font-bold text-slate-900">Extracting text & parsing PDF tokens...</p>
              <p className="text-[11px] text-slate-500">Running client-side privacy-first ATS scan</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100/80 group-hover:bg-indigo-200 text-indigo-600 flex items-center justify-center mb-3 transition-colors shadow-xs">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-xs font-bold text-slate-900">
                Click to browse or drop your resume in <span className="text-indigo-600 underline">.PDF format</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Strictly accepts official PDF documents (.pdf up to 15MB). Your data remains 100% private in your browser.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-white text-indigo-700 border border-indigo-200 mt-3 shadow-2xs">
                <Upload className="w-3 h-3" />
                <span>Upload .PDF File</span>
              </div>
            </>
          )}
        </label>
      )}

      {/* ATS Analysis Cards */}
      {analysis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <div className="rounded-xl bg-indigo-50/80 border border-indigo-100 p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">ATS Match Score</span>
            <div className="flex items-baseline gap-1">
              <strong className="text-3xl font-black text-indigo-700">{analysis.atsScore}</strong>
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            </div>
            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
              analysis.atsScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
              analysis.atsScore >= 65 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {analysis.readinessGrade}
            </span>
          </div>

          <div className="rounded-xl bg-emerald-50/80 border border-emerald-100 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-xs flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Matched Skills ({analysis.foundSkills.length})</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {analysis.foundSkills.length > 0 ? (
                analysis.foundSkills.slice(0, 6).map(skill => (
                  <span key={skill} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-slate-400 italic">No recognized keywords found yet.</span>
              )}
              {analysis.foundSkills.length > 6 && (
                <span className="text-[10px] text-emerald-700 font-bold self-center">
                  +{analysis.foundSkills.length - 6} more
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-amber-50/80 border border-amber-100 p-4 space-y-1">
            <span className="font-bold text-amber-900 text-xs flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Priority Recommendation</span>
            </span>
            <p className="text-[11px] text-amber-900 leading-relaxed pt-1">
              {analysis.suggestions[0] || 'Good alignment with current industry standards.'}
            </p>
          </div>
        </div>
      )}

      {/* Target missing keywords note */}
      {analysis && analysis.missingKeySkills?.length > 0 && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-600">
            <strong className="text-slate-800">Target Role Keywords to Add: </strong>
            {analysis.missingKeySkills.slice(0, 6).join(', ')}
          </div>
        </div>
      )}

      {/* Collapsible Extracted Resume Text Accordion */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
        <button
          type="button"
          onClick={() => setShowRawText(!showRawText)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>Extracted Resume Text & Supplementary Details</span>
            {resumeText && (
              <span className="text-[10px] text-slate-400 font-normal">
                ({resumeText.split(/\s+/).filter(Boolean).length} words)
              </span>
            )}
          </div>
          {showRawText ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {showRawText && (
          <div className="p-4 border-t border-slate-200 space-y-3 bg-white">
            <p className="text-[11px] text-slate-500">
              Below is the raw text extracted from your PDF resume. You can inspect or edit keywords directly to test ATS scoring variations.
            </p>
            <textarea
              value={resumeText}
              onChange={event => {
                setResumeText(event.target.value);
                runAnalysis(event.target.value);
              }}
              placeholder="Resume text extracted from your PDF will appear here..."
              rows={5}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              aria-label="Extracted resume text"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => runAnalysis(resumeText)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Re-analyze Text
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
