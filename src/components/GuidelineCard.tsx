import React, { useState } from 'react';
import { AlertCircle, CheckCircle, HelpCircle, FileText, Ban } from 'lucide-react';
import { PROHIBITED_EXPRESSIONS, RECOMMENDED_EXPRESSIONS, EXPRESSION_PRINCIPLES } from '../types';

interface GuidelineCardProps {
  currentText: string;
  onFixExpression?: (prohibited: string, replacement: string) => void;
}

export const GuidelineCard: React.FC<GuidelineCardProps> = ({ currentText, onFixExpression }) => {
  const [activeTab, setActiveTab] = useState<'principles' | 'prohibited' | 'recommended'>('principles');

  // Find occurrences of prohibited words in the current text
  const detectedProhibited = PROHIBITED_EXPRESSIONS.filter(word => 
    currentText.replaceAll(' ', '').includes(word.replaceAll(' ', '')) || currentText.includes(word)
  );

  // Map prohibited to suggested
  const getSuggestion = (prohibited: string): string => {
    switch (prohibited) {
      case '완벽히 부합하는 핵심 인재':
        return '귀사의 채용조건과 구직자의 경력 및 희망직무가 부합하는 구직자';
      case '즉각적인 기여를 할 수 있을 것으로 확신합니다':
        return '직무 수행에 필요한 기본 역량과 관련 경험을 보유하고 있어 원만한 수행이 기대됩니다';
      case '치열한 경쟁을 뚫고 합격':
        return '서류전형에 우수한 결과로 합격';
      case '인사담당자의 시선을 사로잡은 결과':
        return '해당 직무에 필요한 역량과 경험을 갖춘 결과';
      case '최종 합격의 순간까지 함께 집중해 봅시다':
        return '면접 일정에 차질이 없도록 필요한 부분을 지원해 드리겠습니다';
      case '수석 취업 컨설턴트':
        return '취업지원팀 담당자';
      case '컨설팅 세션':
        return '취업 지원 안내';
      default:
        return '공공기관 권장 표현';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-slate-800 text-sm">작성 가이드라인 및 유의사항</h2>
        </div>
        {detectedProhibited.length > 0 && (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full border border-amber-200 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            지양 표현 {detectedProhibited.length}건 감지됨
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 bg-slate-50/50 p-1 gap-1">
        <button
          onClick={() => setActiveTab('principles')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
            activeTab === 'principles'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          표현 원칙
        </button>
        <button
          onClick={() => setActiveTab('prohibited')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'prohibited'
              ? 'bg-white text-rose-600 shadow-sm border border-slate-100'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          지양 표현 (헤드헌터 톤)
          {detectedProhibited.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 ring-4 ring-rose-100 animate-pulse"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('recommended')}
          className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${
            activeTab === 'recommended'
              ? 'bg-white text-emerald-600 shadow-sm border border-slate-100'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          권장 표현 (공공형)
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 overflow-y-auto text-slate-600 max-h-[380px] lg:max-h-[none]">
        {activeTab === 'principles' && (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-slate-800 text-xs mb-1">공공기관·고용센터 기본 원칙</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  작성하는 안내문은 공공기관의 공식 발송용이므로, 신뢰성 있고 공평하며 과장 없는 명료한 본문을 지향해야 합니다.
                </p>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-3">
              <h4 className="text-xs font-semibold text-slate-700 mb-2">{EXPRESSION_PRINCIPLES.title}</h4>
              <ul className="space-y-2">
                {EXPRESSION_PRINCIPLES.items.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-xs leading-relaxed">
                    <span className="text-slate-400 font-mono flex-shrink-0 select-none">{idx + 1}.</span>
                    <span className="text-slate-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 p-3 bg-indigo-50/50 border border-indigo-100/60 rounded-lg">
              <h4 className="text-xs font-semibold text-indigo-800 mb-1 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> 최종 활용 기준
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                안내문 톤은 항상 객관적 상태를 전달하며, 구직자의 <strong>증명 가능한 사유/경력 및 연락경로(수신/회신처)의 정확성</strong>을 극대화하십시오.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'prohibited' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              민간 서치펌이나 고가 역량 컨설팅사 느낌을 주는 자극적·주관적 어구는 배제하십시오. 실시간으로 아래 단어가 감지되면 안내 창이 표시됩니다.
            </p>

            {detectedProhibited.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg mb-3">
                <h4 className="text-xs font-semibold text-rose-800 flex items-center gap-1 mb-1.5">
                  <AlertCircle className="w-4 h-4" /> 실시간 본문 감지 알림
                </h4>
                <div className="space-y-2">
                  {detectedProhibited.map((word, idx) => {
                    const suggestion = getSuggestion(word);
                    return (
                      <div key={idx} className="bg-white p-2 rounded border border-rose-100 flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
                        <div>
                          <span className="inline-block bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded font-medium">검출</span>
                          <span className="text-xs font-mono font-medium text-slate-800 ml-1.5">"{word}"</span>
                        </div>
                        {onFixExpression && (
                          <button
                            onClick={() => onFixExpression(word, suggestion)}
                            className="text-[11px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded font-medium border border-indigo-100 self-end md:self-auto transition-colors"
                          >
                            권장형으로 자동 치환
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2.5">
              {PROHIBITED_EXPRESSIONS.map((word, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <Ban className="w-3.5 h-3.5 text-rose-500 mt-1 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-rose-700">{word}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                      → 권장형: <span className="text-slate-700 italic">"{getSuggestion(word)}"</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'recommended' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              공공 안내와 공식 조율에 알맞게 정제된 신뢰성 높은 추천 표현입니다. 작성 시 적극적으로 복사·활용하세요.
            </p>

            <div className="space-y-2">
              {RECOMMENDED_EXPRESSIONS.map((expression, idx) => (
                <div 
                  key={idx}
                  className="p-3 bg-emerald-50/30 border border-emerald-100 rounded-lg hover:border-emerald-300 transition-all group"
                >
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {expression}
                  </p>
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(expression);
                        alert('권장 표현이 클립보드에 복사되었습니다. 필요한 곳에 붙여넣어 쓰세요.');
                      }}
                      className="text-[10px] text-emerald-700 font-medium bg-emerald-100/50 group-hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200/50 transition-all"
                    >
                      문구 복사
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
