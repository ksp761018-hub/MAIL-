import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, Check, ArrowRight } from 'lucide-react';

interface AiAssistantProps {
  fieldType: 'recommendationReason' | 'experienceSummary' | 'skillsSummary';
  fieldLabel: string;
  onApply: (generatedText: string) => void;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ fieldType, fieldLabel, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [job, setJob] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setGeneratedText('');

    try {
      const apiKeyInStorage = localStorage.getItem('gemini_api_key') || '';
      const response = await fetch('/api/gemini/generate-field', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': apiKeyInStorage
        },
        body: JSON.stringify({
          field: fieldType,
          job: job || undefined,
          experience: experience || undefined,
          skills: skills || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('AI 분석 중 서버 오류가 발생했습니다.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedText(data.text || '');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'AI 생성이 실패하였습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (generatedText) {
      onApply(generatedText);
      setIsOpen(false);
      // Reset
      setJob('');
      setExperience('');
      setSkills('');
      setGeneratedText('');
    }
  };

  return (
    <div className="mt-2 text-xs">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-1 px-2.5 rounded-lg border border-indigo-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          공공기관형 AI 자동완성 도우미
        </button>
      ) : (
        <div className="bg-indigo-50/50 hover:bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 space-y-3 transition-all">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              {fieldLabel} AI 작성기
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 font-medium"
            >
              닫기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1 font-medium">대상 직무 (공란 가능)</label>
              <input
                type="text"
                placeholder="예: 일반 사무행정"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1 font-medium">주요 경력/경험 요약</label>
              <input
                type="text"
                placeholder="예: OOO무역 1년 근무, 전산회계 보유"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1 font-medium">핵심 역량/장점</label>
              <input
                type="text"
                placeholder="예: 꼼꼼함, 엑셀 능숙"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={handleGenerate}
              className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1 px-3 rounded-lg transition-colors shadow-sm disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              AI 분석 생성하기
            </button>
          </div>

          {error && <p className="text-rose-500 text-[11px] font-medium">{error}</p>}

          {generatedText && (
            <div className="bg-white p-2.5 rounded-lg border border-indigo-100 flex flex-col gap-2">
              <div className="text-[11px] leading-relaxed text-slate-700">
                <span className="font-semibold text-[10px] uppercase bg-indigo-50 text-indigo-700 px-1 py-0.5 rounded mr-1">추천 문구</span>
                "{generatedText}"
              </div>
              <button
                type="button"
                onClick={handleApply}
                className="self-end inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-[11px] font-medium shadow-sm transition-colors"
              >
                <Check className="w-3 h-3" />
                이 문구 적용하기
              </button>
            </div>
          )}

          <p className="text-[9px] text-slate-400 leading-normal">
            * AI 도우미는 과장 억제(헤드헌팅 톤 방지) 및 팩트 중심의 공공기관 안내 가이드라인을 강제하여 작동합니다.
          </p>
        </div>
      )}
    </div>
  );
};
