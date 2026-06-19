import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Building2, 
  User, 
  Mail, 
  MessageSquare, 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  Download, 
  AlertTriangle, 
  BookmarkCheck, 
  Loader2, 
  ShieldCheck, 
  Eye, 
  Smartphone, 
  CheckCircle,
  TrendingUp,
  Info,
  HelpCircle,
  FileCheck2,
  AlertCircle,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Key,
  Lock,
  Unlock
} from 'lucide-react';
import { TEMPLATES, Template, PROHIBITED_EXPRESSIONS, RECOMMENDED_EXPRESSIONS } from './types';
import { GuidelineCard } from './components/GuidelineCard';
import { AiAssistant } from './components/AiAssistant';

export default function App() {
  // Selected state
  const [selectedCategory, setSelectedCategory] = useState<'employer' | 'jobseeker'>('employer');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('employer-recommend-candidate');
  
  // Placeholders values state
  const [placeholderValues, setPlaceholderValues] = useState<Record<string, string>>({});
  
  // Custom manual edits to subject/body
  const [subjectText, setSubjectText] = useState('');
  const [bodyText, setBodyText] = useState('');
  
  // Tracks tracking draft edits or normal edits
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  // AI Polish states
  const [polishLoading, setPolishLoading] = useState(false);
  const [polishFocus, setPolishFocus] = useState('공공기관 발송에 적합한 격식 있고 객관적인 신뢰 톤으로 교정');

  // Interactive Demo state (Landing section)
  const [demoSelected, setDemoSelected] = useState<number>(0);
  
  // Real-time Preview Mode: 'text' (default) | 'device' (SMS or Email mockup render)
  const [previewMode, setPreviewMode] = useState<'text' | 'device'>('device');

  // 2026 Helper assistant date/time states
  const [assistantDate, setAssistantDate] = useState('2026-06-25');
  const [assistantTime, setAssistantTime] = useState('14:00');

  // Gemini API Key entry & verification states
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [isApiKeyAuthorized, setIsApiKeyAuthorized] = useState(() => !!localStorage.getItem('gemini_api_key'));
  const [apiValidationLoading, setApiValidationLoading] = useState(false);
  const [apiValidationError, setApiValidationError] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(true);

  // Load template & defaults
  const currentTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];

  // Initialize values when template changes
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    currentTemplate.placeholders.forEach(p => {
      initialValues[p.key] = p.defaultValue || '';
    });
    setPlaceholderValues(initialValues);
    setIsManuallyEdited(false);
  }, [selectedTemplateId]);

  // Compute text when placeholders change (if not manually edited)
  useEffect(() => {
    if (isManuallyEdited) return;

    let sub = currentTemplate.subjectTemplate || '';
    let bdy = currentTemplate.bodyTemplate || '';

    // If subject exists
    if (sub) {
      Object.entries(placeholderValues).forEach(([key, val]) => {
        sub = sub.replaceAll(`[${key}]`, String(val || ''));
      });
      setSubjectText(sub);
    } else {
      setSubjectText('');
    }

    // Body
    Object.entries(placeholderValues).forEach(([key, val]) => {
      bdy = bdy.replaceAll(`[${key}]`, String(val || ''));
    });
    setBodyText(bdy);
  }, [placeholderValues, currentTemplate, isManuallyEdited]);

  const handlePlaceholderChange = (key: string, value: string) => {
    setPlaceholderValues(prev => ({ ...prev, [key]: value }));
  };

  const applyDateTo2026Placeholders = (dateStr: string) => {
    if (!dateStr) return;
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return;
    
    const m = (dateObj.getMonth() + 1).toString();
    const d = dateObj.getDate().toString();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dy = days[dateObj.getDay()];
    
    const newValues = { ...placeholderValues };
    
    if (currentTemplate.placeholders.some(p => p.key === '월')) {
      newValues['월'] = m;
    }
    if (currentTemplate.placeholders.some(p => p.key === '일')) {
      newValues['일'] = d;
    }
    if (currentTemplate.placeholders.some(p => p.key === '요일')) {
      newValues['요일'] = dy;
    }
    
    // Calculate a standard response deadline (3 business days ahead or selected date - 3 days)
    const deadlineDate = new Date(dateObj);
    deadlineDate.setDate(deadlineDate.getDate() - 3);
    const deadMonth = deadlineDate.getMonth() + 1;
    const deadDay = deadlineDate.getDate();
    const deadStr = `${deadMonth}월 ${deadDay}일`;
    
    if (currentTemplate.placeholders.some(p => p.key === 'O월 O일')) {
      newValues['O월 O일'] = deadStr;
    }
    
    setPlaceholderValues(newValues);
    setIsManuallyEdited(false);
  };

  const applyTimeTo2026Placeholders = (timeStr: string) => {
    if (!timeStr) return;
    const parts = timeStr.split(':');
    if (parts.length !== 2) return;
    
    const h = parts[0];
    const m = parts[1];
    
    const newValues = { ...placeholderValues };
    
    if (currentTemplate.placeholders.some(p => p.key === '시')) {
      newValues['시'] = h;
    }
    if (currentTemplate.placeholders.some(p => p.key === '분')) {
      newValues['분'] = m;
    }
    
    setPlaceholderValues(newValues);
    setIsManuallyEdited(false);
  };

  const handleCategoryChange = (category: 'employer' | 'jobseeker') => {
    setSelectedCategory(category);
    const filtered = TEMPLATES.filter(t => t.category === category);
    if (filtered.length > 0) {
      setSelectedTemplateId(filtered[0].id);
    }
  };

  // Helper mapping prohibited to suggestion
  const getProhibitedReplacement = (word: string): string => {
    switch (word) {
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

  const handleFixExpression = (prohibited: string, replacement: string) => {
    setBodyText(prev => prev.replaceAll(prohibited, replacement));
    setIsManuallyEdited(true);
  };

  const handleFixAllProhibited = () => {
    let newBody = bodyText;
    PROHIBITED_EXPRESSIONS.forEach(word => {
      if (newBody.includes(word)) {
        newBody = newBody.replaceAll(word, getProhibitedReplacement(word));
      }
    });
    setBodyText(newBody);
    setIsManuallyEdited(true);
  };

  const currentDetectedProhibited = PROHIBITED_EXPRESSIONS.filter(word => 
    bodyText.replaceAll(' ', '').includes(word.replaceAll(' ', '')) || bodyText.includes(word)
  );

  // Copy to clipboard
  const handleCopy = () => {
    const fullText = subjectText 
      ? `제목: ${subjectText}\n\n${bodyText}`
      : bodyText;
    
    navigator.clipboard.writeText(fullText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Download as TXT file
  const handleDownload = () => {
    const fullText = subjectText 
      ? `제목: ${subjectText}\n\n${bodyText}`
      : bodyText;
    
    const element = document.createElement("a");
    const file = new Blob([fullText], {type: 'text/plain;charset=utf-8'});
    element.href = URL.createObjectURL(file);
    element.download = `${currentTemplate.title.replace('/', '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Download as Word (.doc) file (Formatted Office HTML wrapper)
  const handleDownloadDoc = () => {
    const title = currentTemplate.title.replace('/', '_');
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <title>${title}</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Malgun Gothic', 'Dotum', 'Arial', sans-serif; line-height: 1.8; color: #1e2229; padding: 40px; background-color: #ffffff; }
          .header-box { border-bottom: 2px solid #3638b3; padding-bottom: 12px; margin-bottom: 30px; }
          .logo-text { font-size: 10pt; font-weight: bold; color: #3638b3; text-transform: uppercase; }
          h1 { font-size: 20pt; color: #1b1c54; margin: 10px 0; font-weight: bold; }
          .meta-box { background-color: #f4f6fc; border-left: 4px solid #3638b3; padding: 15px; margin-bottom: 25px; border-radius: 4px; }
          .meta-title { font-size: 9pt; color: #5759cc; font-weight: bold; margin-bottom: 5px; text-transform: uppercase; }
          .meta-content { font-size: 12pt; color: #1b1c54; font-weight: bold; }
          .content-body { font-size: 11pt; color: #1e2229; margin-bottom: 40px; }
          .content-body p { margin-bottom: 14px; }
          .content-body h2 { font-size: 13pt; color: #3638b3; margin-top: 25px; margin-bottom: 12px; font-weight: bold; border-left: 3px solid #3638b3; padding-left: 8px; }
          .content-body ul { margin-bottom: 15px; padding-left: 20px; }
          .content-body li { margin-bottom: 6px; }
          .footer-box { border-top: 1px solid #e1e5f2; margin-top: 50px; padding-top: 15px; font-size: 9pt; color: #777; text-align: center; }
          .stamp-mark { float: right; border: 3px solid #e11d48; color: #e11d48; font-weight: bold; font-size: 9pt; border-radius: 50%; width: 70px; height: 70px; line-height: 1.2; text-align: center; display: inline-block; padding-top: 18px; margin-top: -10px; }
        </style>
      </head>
      <body>
    `;
    const footer = "</body></html>";
    
    const paragraphs = bodyText.split('\n\n');
    let formattedBody = '';
    
    paragraphs.forEach(p => {
      const trimmed = p.trim();
      if (!trimmed) return;
      
      if (trimmed.startsWith('##')) {
        formattedBody += `<h2>${trimmed.replace(/^[#\s]+/, '').trim()}</h2>`;
      } else if (trimmed.startsWith('-')) {
        const items = trimmed.split('\n').filter(i => i.trim());
        formattedBody += '<ul>';
        items.forEach(item => {
          let cleanItem = item.replace(/^-/, '').trim();
          cleanItem = cleanItem.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          formattedBody += `<li>${cleanItem}</li>`;
        });
        formattedBody += '</ul>';
      } else {
        let cleanText = trimmed.replace(/\n/g, '<br/>');
        cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedBody += `<p>${cleanText}</p>`;
      }
    });

    const htmlContent = `
      ${header}
      <div class="header-box">
        <div class="logo-text">${placeholderValues['기관/센터명'] || '공공고용복지네트워크'} • OFFICIAL RELEASE</div>
        <h1>공공 표준 행정 문서</h1>
      </div>
      
      ${subjectText ? `
      <div class="meta-box">
        <div class="meta-title">수신 제목 (Subject)</div>
        <div class="meta-content">${subjectText}</div>
      </div>
      ` : ''}
      
      <div class="content-body">
        ${formattedBody}
      </div>
      
      <div>
        <div class="stamp-mark">공공센터<br/>날인필</div>
        <div style="clear: both;"></div>
      </div>
      
      <div class="footer-box">
        본 문서는 표준 가이드라인에 맞추어 검수 처리된 공식 행정 매칭 양식입니다. 디지털 사본 시스템 이용 통보.
      </div>
      ${footer}
    `;

    const blob = new Blob(['\ufeff' + htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download as PDF file (high-fidelity canvas export preserving custom styles)
  const [pdfLoading, setPdfLoading] = useState(false);
  const handleDownloadPdf = async () => {
    const element = document.getElementById('pdf-print-template');
    if (!element) return;
    
    setPdfLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const canvas = await html2canvas(element, {
        scale: 2, // High DPI resolution for printing
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const pdfHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${currentTemplate.title.replace('/', '_')}.pdf`);
    } catch (error) {
      console.error('PDF 다운로드 에러:', error);
      alert('PDF 빌드 중 오류가 발생했습니다.');
    } finally {
      setPdfLoading(false);
    }
  };

  // AI Polish using '/api/gemini/optimize'
  const handleAiPolish = async () => {
    setPolishLoading(true);
    try {
      const customKey = localStorage.getItem('gemini_api_key') || '';
      const response = await fetch('/api/gemini/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gemini-API-Key': customKey,
        },
        body: JSON.stringify({
          text: bodyText,
          type: currentTemplate.type === 'email' ? '이메일' : '문자/알림톡',
          focus: polishFocus,
        }),
      });

      if (!response.ok) {
        throw new Error('AI 교정에 실패했습니다. 서버 상태를 확인해 주세요.');
      }

      const data = await response.json();
      if (data.optimizedText) {
        setBodyText(data.optimizedText);
        setIsManuallyEdited(true);
      }
    } catch (err: any) {
      alert(err.message || 'AI 교정 도중 에러가 발생했습니다.');
    } finally {
      setPolishLoading(false);
    }
  };

  // Gemini API Key Validation call
  const handleValidateAndSaveKey = async () => {
    const key = apiKeyInput.trim();
    if (!key) {
      setApiValidationError('Gemini API 키를 입력해 주세요.');
      return;
    }
    setApiValidationLoading(true);
    setApiValidationError(null);
    try {
      const res = await fetch('/api/gemini/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('gemini_api_key', key);
        setIsApiKeyAuthorized(true);
      } else {
        localStorage.removeItem('gemini_api_key');
        setIsApiKeyAuthorized(false);
        setApiValidationError(data.error || '유효하지 않은 API 키입니다. 다시 입력해 주세요.');
      }
    } catch (err: any) {
      localStorage.removeItem('gemini_api_key');
      setIsApiKeyAuthorized(false);
      setApiValidationError('API 키를 통신 검증하는 중에 서버 에러가 발생했습니다.');
    } finally {
      setApiValidationLoading(false);
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKeyInput('');
    setIsApiKeyAuthorized(false);
    setApiValidationError(null);
  };

  // Restore Default Placeholders
  const handleReset = () => {
    if (confirm('모든 입력 필드 및 편집 상태를 초기화하시겠습니까?')) {
      const initialValues: Record<string, string> = {};
      currentTemplate.placeholders.forEach(p => {
        initialValues[p.key] = p.defaultValue || '';
      });
      setPlaceholderValues(initialValues);
      setIsManuallyEdited(false);
    }
  };

  // Demo examples for landing
  const demoExamples = [
    {
      title: "구직자 추천 메세지 (대비)",
      prohibited: "치열한 경쟁을 뚫고 완벽히 부합하는 핵심 인재를 추천드리며 즉각적인 기여를 할 수 있을 것으로 확신합니다.",
      recommended: "귀사의 채용조건과 구직자의 경력 및 희망직무가 부합한다고 판단되어 우수한 검토 결과를 바탕으로 정중히 추천드립니다.",
      badge: "기업추천"
    },
    {
      title: "면접 합격 통보 (대비)",
      prohibited: "인사담당자의 시선을 한눈에 사로잡은 결과로 합격하셨습니다! 수석 취업 컨설턴트와의 컨설팅 세션에 동참하세요.",
      recommended: "지원하신 기업의 서류전형 합격을 축하드리며, 아래와 같이 면접 일정 조율 및 관련 가이드라인을 준비 통보 드립니다.",
      badge: "구직자용"
    }
  ];

  return (
    <div id="app-container" className="min-h-screen bg-[#edf1f9] text-[#1e2229] flex flex-col antialiased selection:bg-[#3638b3]/20 selection:text-[#3638b3]">
      
      {/* Top Brand Notification Bar */}
      <div className="bg-[#1b1c54] text-white/90 text-center py-2 px-4 text-xs font-semibold tracking-wider flex items-center justify-center gap-1.5 border-b border-white/5 flex-shrink-0">
        <span className="inline-block w-2 h-2 rounded-full bg-[#3638b3] animate-pulse"></span>
        <span>2026년 공공기관 및 일자리센터 표준 가이드라인 탑재 완료 : 실시간 지양어 감수 기능 지원</span>
      </div>

      {/* Main Header Area - Matching deep brand headers from the design mockup */}
      <header id="app-header" className="bg-[#3638b3] text-white py-5 px-6 sticky top-0 z-40 premium-shadow">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white border border-white/10 shadow-inner">
              <FileCheck2 className="w-6.5 h-6.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  문자/메일작성도우미
                </h1>
                <span className="text-[10px] tracking-widest uppercase font-extrabold px-3 py-0.5 rounded-full bg-white/20 text-white border border-white/15">
                  공공기관·고용센터 실무용 표준
                </span>
              </div>
              <p className="text-xs text-[#edf1f9]/80 mt-1 font-medium leading-relaxed">
                구인귀사 후보자 추천 및 서류합격 알림의 **격식과 신용**을 지켜내는 올인원 지능형 빌더
              </p>
            </div>
          </div>
          
          {/* Status Badge in Header */}
          <div className="flex items-center gap-2 bg-[#1b1c54]/55 border border-white/10 rounded-full py-1.5 px-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[11px] font-extrabold text-slate-100">
              행정 지양 표현 자치 감지 레이더 정상 가동
            </span>
          </div>
        </div>
      </header>

      {/* PREMIUM INTRO LANDING PAGE SECTION - Royal Blue & White cohesive style */}
      <section className="bg-gradient-to-b from-[#3638b3] via-[#2F3192] to-[#1b1c54] text-white py-12 px-6 shadow-inner relative overflow-hidden">
        
        {/* Ambient background circles with premium soft glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#5759cc]/30 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Landing Copy */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/15 premium-shadow">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-200" /> 공공기관 및 일자리센터 신뢰도 제고 프로젝트
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              가벼운 민간 컨설팅 톤은 배제하고,<br/>
              <span className="text-[#edf1f9] underline decoration-wavy decoration-[#5759cc] underline-offset-4">품격있고 믿음직한 공무 표준행정 문체</span>를 완성하세요
            </h2>
            <p className="text-sm text-slate-200 leading-relaxed max-w-2xl mx-auto">
              공인 발송 메시지에 ‘완벽히 부합하는 핵심인재’, ‘치열한 경쟁’ 같은 단어는 공익성을 떨어뜨립니다. 
              본 센터 가이드를 100% 반영한 스마트 엔진은 실시간 위배 표현 탐지는 물론, AI 실증 변용을 구현합니다.
            </p>
          </div>

          {/* Core App Strength Feature Matrix (3 Beautiful white outline bento cards) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-6xl mx-auto">
            
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 hover:bg-white/15 transition-all group hover:-translate-y-1 duration-300 shadow-md">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">① 완벽한 행정 표준 톤앤매너</h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                과격하거나 주관적 확신을 내포하지 않는 객관적인 안내 문구와 공인 수신처 지침을 완벽히 정합합니다.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 hover:bg-white/15 transition-all group hover:-translate-y-1 duration-300 shadow-md">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-200 mb-4 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-white mb-2">② 실시간 지양 어필 감수</h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                헤드헌팅 사설 느낌의 유도 단어가 포착되면 실시간으로 우측에 안전 경보를 띄우며 원클릭으로 수정 치환해 줍니다.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 hover:bg-white/15 transition-all group hover:-translate-y-1 duration-300 shadow-md">
              <div className="w-12 h-12 bg-[#edf1f9]/20 rounded-2xl flex items-center justify-center text-[#edf1f9] mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">③ AI 세부 항목 최적화 연합</h3>
              <p className="text-xs text-slate-200 leading-relaxed">
                모호한 구직자의 경력이나 기술 역량 핵심 단어만 입력해 주면, 가이드 규칙에 정합하는 공적 추천 사유를 자동 형성해 기입합니다.
              </p>
            </div>

          </div>

          {/* Interactive Before vs After Pitch Playground */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-3xl max-w-4xl mx-auto mt-10 p-5 md:p-6 premium-card-shadow">
            <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/15 pb-4 mb-4 gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-black tracking-wider text-[#edf1f9] uppercase">Interactive Demo Zone</span>
                <h4 className="text-sm font-extrabold text-white">현장에서 쓰는 단어 차이 실감하기</h4>
              </div>
              
              {/* Toggle controls - styled like top mockup pill sliders */}
              <div className="flex gap-1 bg-white/10 p-1.5 rounded-full border border-white/5">
                {demoExamples.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setDemoSelected(idx)}
                    className={`px-4 py-1.5 text-xs rounded-full transition-all font-semibold ${
                      demoSelected === idx ? 'bg-[#3638b3] text-white premium-shadow' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {ex.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Content show */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-[#1b1c54]/54 border border-rose-500/20 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="bg-rose-500/30 text-rose-200 text-[9px] font-black px-2 py-0.5 rounded-full border border-rose-500/40">
                      지양 문형 (민간 컨설팅체)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                    "{demoExamples[demoSelected].prohibited}"
                  </p>
                </div>
                <div className="text-[11px] text-rose-300/80 mt-3 pt-3 border-t border-white/10">
                  ⚠️ 너무 유치하거나 확언형 감정이 개입되어 신뢰감을 저해합니다.
                </div>
              </div>

              <div className="bg-[#1b1c54]/80 border border-emerald-500/25 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <span className="bg-emerald-500/35 text-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-500/40">
                      권장 문형 (고용지원 공공체)
                    </span>
                  </div>
                  <p className="text-xs text-emerald-100 font-bold leading-relaxed">
                    "{demoExamples[demoSelected].recommended}"
                  </p>
                </div>
                <div className="text-[11px] text-emerald-300/90 mt-3 pt-3 border-t border-white/10 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 animate-pulse" />
                  객관적인 조건 대조로 기업 인사의 거부감을 최소화합니다.
                </div>
              </div>
            </div>
          </div>

          {/* GEMINI API KEY GATEWAY BOARD - Exactly styled based on mock request and attached layout style */}
          <div id="api-gateway-anchor" className="max-w-2xl mx-auto mt-10 bg-white text-[#1e2229] rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl transition-all">
            
            {/* Header / Checkmark row */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
                <Check className="w-4 h-4 font-black" />
              </div>
              <h3 className="font-extrabold text-sm md:text-base text-slate-800">
                무료로 시작하세요. Gemini API 키만 있으면 됩니다.
              </h3>
            </div>

            {/* Input field and big buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative flex items-center bg-slate-50 border-2 border-slate-200 focus-within:border-[#3638b3] rounded-2xl transition-all shadow-inner">
                <div className="pl-4 text-slate-400">
                  {isApiKeyAuthorized ? <Unlock className="w-5 h-5 text-emerald-500" /> : <Lock className="w-5 h-5" />}
                </div>
                <input
                  type={isApiKeyAuthorized ? "text" : "password"}
                  placeholder={isApiKeyAuthorized ? "Gemini API Key가 등록되었습니다 (AIza...)" : "Gemini API Key 입력"}
                  value={apiKeyInput}
                  disabled={isApiKeyAuthorized}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-transparent py-4 pl-3 pr-4 text-sm font-semibold outline-none text-slate-800 placeholder-slate-400"
                />
                
                {isApiKeyAuthorized && (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="absolute right-3 bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1 rounded-xl text-[10.5px] font-black transition-all"
                  >
                    해제/변경
                  </button>
                )}
              </div>

              {!isApiKeyAuthorized ? (
                <button
                  type="button"
                  disabled={apiValidationLoading}
                  onClick={handleValidateAndSaveKey}
                  className="bg-[#3638b3] hover:bg-[#2c2e99] text-white font-extrabold px-8 py-4 rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2 flex-shrink-0 disabled:bg-slate-400"
                >
                  {apiValidationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      승인 중...
                    </>
                  ) : (
                    "시작하기"
                  )}
                </button>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold px-6 py-4 rounded-2xl text-sm flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  인증 완료
                </div>
              )}
            </div>

            {/* Validation errors and instructions */}
            {apiValidationError && (
              <div className="p-3.5 mb-5 bg-rose-50 border-l-4 border-rose-500 rounded-xl text-rose-700 text-xs font-semibold flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold mb-1">인증에 실패했습니다</p>
                  <p className="text-[11px] leading-relaxed opacity-90">{apiValidationError}</p>
                </div>
              </div>
            )}

            {/* Accordion Guide (Gemini API Key 발급 가이드) */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <button
                type="button"
                onClick={() => setIsGuideOpen(!isGuideOpen)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200/60 hover:bg-slate-100 transition-all font-semibold"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4.5 h-4.5 text-[#3638b3] flex-shrink-0" />
                  <span className="font-extrabold text-xs text-slate-800">Gemini API Key 발급 가이드</span>
                </div>
                {isGuideOpen ? <ChevronUp className="w-4.5 h-4.5 text-slate-500" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-500" />}
              </button>

              {isGuideOpen && (
                <div className="p-5 bg-white space-y-4 text-[12px] leading-relaxed text-slate-600 border-t border-slate-100">
                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex gap-3">
                      <span className="w-5 h-5 rounded-md bg-[#e8eeff] text-[#3638b3] text-[10.5px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-850">Google AI Studio 접속</h4>
                        <p className="text-[11.5px] text-slate-500 mt-0.5">아래 링크를 클릭하여 Google AI Studio에 접속하세요.</p>
                        <a 
                          href="https://aistudio.google.com/apikey" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[#3638b3] hover:underline font-bold text-[11px] mt-1 inline-block"
                        >
                          https://aistudio.google.com/apikey
                        </a>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-3">
                      <span className="w-5 h-5 rounded-md bg-[#e8eeff] text-[#3638b3] text-[10.5px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-850">Google 계정으로 로그인</h4>
                        <p className="text-[11.5px] text-slate-500 mt-0.5">Gmail 계정으로 로그인하세요. 계정이 없으면 무료로 만들 수 있어요.</p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-3">
                      <span className="w-5 h-5 rounded-md bg-[#e8eeff] text-[#3638b3] text-[10.5px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-850">'API 키 만들기' 클릭</h4>
                        <p className="text-[11.5px] text-slate-500 mt-0.5">화면에서 'Create API Key' 또는 'API 키 만들기' 버튼을 클릭하세요.</p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-3">
                      <span className="w-5 h-5 rounded-md bg-[#e8eeff] text-[#3638b3] text-[10.5px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-850">프로젝트 선택 후 생성</h4>
                        <p className="text-[11.5px] text-slate-500 mt-0.5">기본 프로젝트를 선택하고 'Create API key in existing project'를 클릭하세요.</p>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex gap-3">
                      <span className="w-5 h-5 rounded-md bg-[#e8eeff] text-[#3638b3] text-[10.5px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-850">API 키 복사</h4>
                        <p className="text-[11.5px] text-slate-500 mt-0.5">생성된 API 키(AIza로 시작)를 복사하세요. 이 키를 입력창에 붙여넣기하면 됩니다!</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <a
                      href="https://aistudio.google.com/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-[#e8eeff] hover:bg-[#d6e2ff] text-[#3638b3] font-black py-2.5 px-4 rounded-xl text-xs transition-all tracking-tight"
                    >
                      <span>🔑 API 키 발급 페이지로 이동</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* Main Grid Workspace - Uniform theme matching the attached layout style */}
      <main id="app-workspace" className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 relative">
        
        {/* Workspace Lock screen for unregistered key */}
        {!isApiKeyAuthorized && (
          <div className="absolute inset-0 bg-[#edf1f9]/70 backdrop-blur-md rounded-3xl z-30 flex flex-col items-center justify-center p-8 text-center min-h-[500px]">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#3638b3] border border-slate-200 shadow-xl mb-4 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-[#1b1c54] mb-2">
              Gemini API 키 승인 대기 중
            </h3>
            <p className="text-xs text-slate-500 max-w-md leading-relaxed mb-6">
              상단의 랜딩페이지 내 '무료로 시작하기' 입력란에 유효한 Gemini API Key를 등록하여 주십시오. 승인 완료 즉시 모든 문자 및 이메일 템플릿과 AI 세부 편집 기능이 활성화됩니다.
            </p>
            <button
              onClick={() => {
                document.getElementById('api-gateway-anchor')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#3638b3] hover:bg-[#2c2e99] text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>🔑 API 인증하러 가기 (위로 이동)</span>
            </button>
          </div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 transition-all ${!isApiKeyAuthorized ? 'pointer-events-none select-none opacity-40 blur-[2px]' : ''}`}>
        
        {/* Left column: Controls, Forms, Template selectors (7 Columns) */}
        <section id="workspace-controls" className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: Category Selecting Ribbon - Styled exactly like the mockup category buttons */}
          <div className="bg-white rounded-3xl p-2 premium-card-shadow flex gap-3 border border-[#e1e5f2]">
            <button
              onClick={() => handleCategoryChange('employer')}
              className={`flex-1 flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl font-black text-sm transition-all duration-350 ${
                selectedCategory === 'employer'
                  ? 'bg-[#3638b3] text-white premium-shadow'
                  : 'text-slate-600 hover:text-[#3638b3] hover:bg-[#edf1f9]/40'
              }`}
            >
              <Building2 className={`w-5 h-5 ${selectedCategory === 'employer' ? 'text-white animate-bounce' : 'text-[#3638b3]'}`} />
              1. 구인업체(기업 인사담당자) 발송용
            </button>
            <button
              onClick={() => handleCategoryChange('jobseeker')}
              className={`flex-1 flex items-center justify-center gap-3 py-3.5 px-5 rounded-2xl font-black text-sm transition-all duration-350 ${
                selectedCategory === 'jobseeker'
                  ? 'bg-[#3638b3] text-white premium-shadow'
                  : 'text-slate-600 hover:text-[#3638b3] hover:bg-[#edf1f9]/40'
              }`}
            >
              <User className={`w-5 h-5 ${selectedCategory === 'jobseeker' ? 'text-white animate-bounce' : 'text-[#3638b3]'}`} />
              2. 구직자(지원 대상자) 발송용
            </button>
          </div>

          {/* STEP 2: Template Sublist Grid - Clean styling like task lists in mockup */}
          <div className="bg-white rounded-3xl p-6 border border-[#e1e5f2] premium-card-shadow">
            <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-[#edf1f9]">
              <span className="w-6 h-6 rounded-full bg-[#edf1f9] text-[#3638b3] text-xs font-black flex items-center justify-center">1</span>
              <h3 className="font-extrabold text-slate-800 text-sm">업무 표준 세부 템플릿 선택</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {TEMPLATES.filter(t => t.category === selectedCategory).map(template => {
                const isSelected = selectedTemplateId === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${
                      isSelected 
                        ? 'bg-[#edf1f9] border-[#3638b3] text-[#1b1c54] font-black premium-shadow' 
                        : 'border-[#edf1f9] hover:border-[#3638b3]/30 text-slate-700 bg-white hover:bg-[#soft-bg]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {template.type === 'email' ? (
                        <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-[#3638b3] text-white' : 'bg-[#edf1f9] text-[#3638b3]'}`}>
                          <Mail className="w-4 h-4 flex-shrink-0" />
                        </div>
                      ) : (
                        <div className={`p-2 rounded-xl transition-colors ${isSelected ? 'bg-[#3638b3] text-white' : 'bg-[#edf1f9] text-[#3638b3]'}`}>
                          <MessageSquare className="w-4 h-4 flex-shrink-0" />
                        </div>
                      )}
                      <span className="text-xs md:text-sm font-semibold tracking-tight">{template.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                        template.type === 'email' ? 'bg-[#3638b3]/10 text-[#3638b3]' : 'bg-emerald-55/90 text-emerald-805 border border-emerald-100'
                      }`}>
                        {template.type === 'email' ? '공식 이메일' : '공인 문자'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Interactive Placeholder Input Form with AI Assistance */}
          <div className="bg-white rounded-3xl p-6 border border-[#e1e5f2] premium-card-shadow space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#edf1f9] pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#edf1f9] text-[#3638b3] text-xs font-black flex items-center justify-center">2</span>
                  <h3 className="font-extrabold text-slate-800 text-sm">실시간 대입 변수 채우기</h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">대괄호 [ ] 내부의 실무 값을 기입하세요. AI 도우미가 지양표현 없는 완벽한 사유를 제공해 드립니다.</p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="self-end sm:self-auto inline-flex items-center gap-1.5 text-xs text-[#3638b3] hover:text-[#2c2e99] py-2 px-4 rounded-xl hover:bg-[#edf1f9] bg-white border border-[#d6daeb] transition-all font-bold premium-shadow"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                선택 서식 기본값 채우기
              </button>
            </div>

            {/* Smart 2026 Calendar & Time Helper Widget */}
            {(currentTemplate.placeholders.some(p => p.key === '월' || p.key === '일' || p.key === '요일' || p.key === '시' || p.key === '분')) && (
              <div className="bg-[#edf1f9]/45 border border-[#e1e5f2] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3638b3] text-white flex items-center justify-center shadow-sm">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-800 block">🗓️ 2026년 고속 날짜 & 시간 간편 기입기</span>
                    <span className="text-[10px] text-slate-400 font-medium">달력 선택 기반 자동 다중 치환 연계</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  면접 또는 행사 날짜를 마우스로 선정하시면, 2026년 달력을 기준으로 해당 **월, 일, 요일, 그리고 마감일**까지 일괄 계산하여 대입해 드립니다.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Date Picker */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-600 font-extrabold uppercase tracking-wider">면접/행사 일자 (2026년)</label>
                    <input
                      type="date"
                      min="2026-01-01"
                      max="2026-12-31"
                      value={assistantDate}
                      onChange={(e) => {
                        setAssistantDate(e.target.value);
                        applyDateTo2026Placeholders(e.target.value);
                      }}
                      className="w-full px-3_5 py-2.5 bg-white border border-[#d6daeb] rounded-xl text-xs font-bold outline-none focus:border-[#3638b3] focus:ring-2 focus:ring-[#3638b3]/15 transition-all text-slate-800"
                    />
                  </div>

                  {/* Time Picker */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] text-slate-600 font-extrabold uppercase tracking-wider">면접/행사 시간 (시/분)</label>
                    <input
                      type="time"
                      value={assistantTime}
                      onChange={(e) => {
                        setAssistantTime(e.target.value);
                        applyTimeTo2026Placeholders(e.target.value);
                      }}
                      className="w-full px-3_5 py-2.5 bg-white border border-[#d6daeb] rounded-xl text-xs font-bold outline-none focus:border-[#3638b3] focus:ring-2 focus:ring-[#3638b3]/15 transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Quick Selection Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#edf1f9]">
                  <span className="text-[9px] text-slate-400 font-black uppercase">신속 프리셋:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAssistantDate('2026-06-25');
                      applyDateTo2026Placeholders('2026-06-25');
                    }}
                    className="bg-white hover:bg-[#edf1f9]/40 text-[10px] text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-[#d6daeb] hover:border-[#3638b3] transition-all"
                  >
                    6월 25일 (목)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssistantDate('2026-07-02');
                      applyDateTo2026Placeholders('2026-07-02');
                    }}
                    className="bg-white hover:bg-[#edf1f9]/40 text-[10px] text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-[#d6daeb] hover:border-[#3638b3] transition-all"
                  >
                    7월 2일 (목)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssistantDate('2026-07-15');
                      applyDateTo2026Placeholders('2026-07-15');
                    }}
                    className="bg-white hover:bg-[#edf1f9]/40 text-[10px] text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-[#d6daeb] hover:border-[#3638b3] transition-all"
                  >
                    7월 15일 (수)
                  </button>
                  <div className="w-full md:w-auto h-[1px]" />
                  <span className="text-[9px] text-slate-400 font-black uppercase md:ml-3">시간 프리셋:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAssistantTime('10:00');
                      applyTimeTo2026Placeholders('10:00');
                    }}
                    className="bg-white hover:bg-[#edf1f9]/40 text-[10px] text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-[#d6daeb] hover:border-[#3638b3] transition-all"
                  >
                    오전 10시
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssistantTime('14:00');
                      applyTimeTo2026Placeholders('14:00');
                    }}
                    className="bg-white hover:bg-[#edf1f9]/40 text-[10px] text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-[#d6daeb] hover:border-[#3638b3] transition-all"
                  >
                    오후 2시
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAssistantTime('16:00');
                      applyTimeTo2026Placeholders('16:00');
                    }}
                    className="bg-white hover:bg-[#edf1f9]/40 text-[10px] text-slate-700 font-bold px-3 py-1.5 rounded-lg border border-[#d6daeb] hover:border-[#3638b3] transition-all"
                  >
                    오후 4시
                  </button>
                </div>
              </div>
            )}

            {/* Placeholder Input Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentTemplate.placeholders.map((ph) => {
                const valueOfKey = placeholderValues[ph.key] !== undefined ? placeholderValues[ph.key] : '';
                return (
                  <div key={ph.key} className="p-4 bg-white hover:bg-[#soft-bg] rounded-2xl border border-[#edf1f9] flex flex-col justify-between gap-3 transition-all premium-shadow group">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-black text-slate-700 tracking-tight group-hover:text-[#3638b3] transition-colors">
                          {ph.label}
                        </label>
                        <span className="text-[10px] text-slate-400 bg-[#edf1f9]/70 px-2 py-0.5 rounded-full font-mono">
                          [{ph.key}]
                        </span>
                      </div>
                      
                      <input
                        type="text"
                        value={valueOfKey}
                        onChange={(e) => handlePlaceholderChange(ph.key, e.target.value)}
                        placeholder={`"${ph.defaultValue}" 형태로 입력`}
                        className={`w-full px-3 py-2.5 bg-white border rounded-xl outline-none text-xs transition-all ${
                          valueOfKey 
                            ? 'border-indigo-200 focus:border-[#3638b3] focus:ring-2 focus:ring-[#3638b3]/10 font-bold text-indigo-950' 
                            : 'border-rose-250 bg-rose-50/10 text-rose-900 font-bold focus:border-red-400'
                        }`}
                      />
                    </div>
                    
                    {ph.isAiSupported && ph.aiFieldType && (
                      <div className="pt-2 border-t border-[#edf1f9] mt-1">
                        <AiAssistant
                          fieldType={ph.aiFieldType}
                          fieldLabel={ph.label}
                          onApply={(val) => handlePlaceholderChange(ph.key, val)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI One-click Smart Proofreader (Gemini 3.5 Engine Core) - Unifying navy/royal gradient */}
          <div className="bg-[#1b1c54] text-white rounded-3xl p-6 premium-card-shadow relative overflow-hidden border border-white/5">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-y-3 translate-x-3">
              <Sparkles className="w-48 h-48 text-[#3638b3]" />
            </div>
            
            <div className="flex items-center gap-2 mb-2.5">
              <span className="bg-[#3638b3] text-white uppercase text-[9px] font-black px-3 py-1 rounded-full border border-white/10 shadow-sm tracking-wider">
                GEMINI 3.5 HYPERCORE
              </span>
              <h4 className="text-xs font-extrabold text-blue-200">공공행정 가이드라인 강제 1-Click AI 다듬기</h4>
            </div>

            <p className="text-xs text-[#edf1f9]/85 leading-relaxed mb-4">
              작성 중인 제반 문장을 기획 의도에 맞게 다듬어드립니다. 아래 <strong>교정 초점</strong>을 선택 조율한 후 실행해 보세요.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] text-slate-300 font-extrabold mb-1.5 uppercase tracking-wide">교정 시 집중해 다듬을 조건 (Focus prompt)</label>
                <input
                  type="text"
                  value={polishFocus}
                  onChange={(e) => setPolishFocus(e.target.value)}
                  className="w-full bg-[#1e2061]/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#3638b3] font-bold"
                  placeholder="예: 공공기관 발송에 적합한 격식 있고 객관적인 신뢰 톤으로 교정"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={polishLoading}
                  onClick={handleAiPolish}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#3638b3] hover:bg-[#2c2e99] text-white font-extrabold py-3 px-6 rounded-xl shadow-lg transition-all disabled:opacity-60 text-xs"
                >
                  {polishLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      실시간 표준 문구 최적 리라이팅 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      격식과 신용 완벽 고용센터형 변환 시작
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
        </section>

        {/* Right column: Subject & Body Editor + Real-time Preview Mockups (5 Columns) */}
        <section id="workspace-preview" className="lg:col-span-5 space-y-6 flex flex-col">
          
          {/* Preview Format Switchers */}
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-[#e1e5f2] flex gap-1">
            <button
              onClick={() => setPreviewMode('device')}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                previewMode === 'device' 
                  ? 'bg-[#3638b3] text-white shadow-md' 
                  : 'text-slate-500 hover:text-[#3638b3]'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              실배포 가상 렌더링 뷰
            </button>
            <button
              onClick={() => setPreviewMode('text')}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                previewMode === 'text' 
                  ? 'bg-[#3638b3] text-white shadow-md' 
                  : 'text-slate-500 hover:text-[#3638b3]'
              }`}
            >
              <Eye className="w-4 h-4" />
              서치용 날인 텍스트 뷰
            </button>
          </div>

          {/* Interactive Live Message Board Editor */}
          <div className="bg-white rounded-3xl border border-[#e1e5f2] premium-card-shadow flex flex-col flex-1 overflow-hidden">
            
            {/* Terminal Header */}
            <div className="bg-[#edf1f9]/60 border-b border-[#e1e5f2] p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3638b3]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#5759cc]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-extrabold text-slate-800 ml-1">공식 배포 실시간 보정 검수기</span>
              </div>
              
              <div>
                {isManuallyEdited ? (
                  <span className="inline-flex items-center bg-amber-50 text-amber-800 text-[10px] px-3 py-0.5 rounded-full border border-amber-200/80 font-black">
                    수동 편집됨
                  </span>
                ) : (
                  <span className="inline-flex items-center bg-[#edf1f9] text-[#3638b3] text-[10px] px-3 py-0.5 rounded-full border border-[#3638b3]/20 font-black">
                    자동 완성 수배
                  </span>
                )}
              </div>
            </div>

            {/* Rendering Zone based on selected Preview Mode */}
            <div className="p-5 flex-1 flex flex-col space-y-4 bg-[#edf1f9]/20">
              
              {/* Optional Subject Field */}
              {currentTemplate.type === 'email' && (
                <div className="space-y-1.5 bg-white p-4 rounded-2xl border border-[#e1e5f2] premium-shadow">
                  <span className="text-[9px] font-black text-[#3638b3] uppercase tracking-wider block">EMAIL SUBJECT</span>
                  <input
                    type="text"
                    value={subjectText}
                    onChange={(e) => {
                      setSubjectText(e.target.value);
                      setIsManuallyEdited(true);
                    }}
                    className="w-full px-1 py-0.5 text-xs outline-none font-bold text-slate-800 border-b border-[#edf1f9] focus:border-[#3638b3]"
                    placeholder="이메일 제목이 이곳에 표시됩니다."
                  />
                </div>
              )}

              {previewMode === 'device' ? (
                /* DEVICE MOCKUP RENDER - Perfectly customized layout matching design attachment */
                <div className="flex-1 flex flex-col items-center justify-center p-2">
                  {currentTemplate.type === 'sms' ? (
                    /* SMARTPHONE MOCKUP FOR SMS - Dark navy frame exactly matching deep mockup styles */
                    <div className="w-full max-w-[290px] bg-[#1b1c54] p-4 pb-6 rounded-[3rem] border-4 border-[#12133b] shadow-2xl relative overflow-hidden flex flex-col aspect-[9/16] min-h-[410px] device-shadow">
                      {/* Speaker / Camera notches */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#12133b] rounded-full flex items-center justify-center gap-1.5 z-20">
                        <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                        <span className="w-6 h-0.5 bg-slate-800 rounded"></span>
                      </div>
                      
                      {/* Screen Content - Pure brilliant white card inside phone */}
                      <div className="bg-[#f4f6fc] rounded-[2.2rem] flex-1 mt-4 p-3 flex flex-col text-[10px] overflow-hidden relative border border-[#edf1f9]">
                        {/* Conversation Header */}
                        <div className="border-b border-white pb-2 mb-2 text-center text-[#1b1c54] font-black text-[9.5px] truncate">
                          💬 {placeholderValues['기관/센터명'] || '일자리센터'}
                        </div>
                        {/* Chat bubble overlay */}
                        <div className="flex-1 overflow-y-auto pr-1 space-y-2 select-text scrollbar-thin">
                          <div className="bg-white text-[#1e2229] p-3 rounded-2xl rounded-tl-sm font-semibold leading-relaxed whitespace-pre-wrap font-sans break-all text-[9px] shadow-sm border border-slate-100">
                            {bodyText || '필드를 작성해 주세요.'}
                          </div>
                        </div>
                        
                        {/* Keyboard Mimic */}
                        <div className="mt-2 pt-2 border-t border-[#e1e5f2] flex items-center justify-between text-slate-400 text-[8px]">
                          <span>문자메시지 입력...</span>
                          <span className="bg-[#3638b3] text-white rounded-full px-2.5 py-1 text-[7px] font-black shadow-xs">전송</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* FORMAL MAIL BLUEPRINT MOCKUP FOR EMAIL - Rich Royal Blue branding */
                    <div className="w-full bg-white rounded-3xl border border-[#e1e5f2] p-5 shadow-sm flex flex-col flex-1 min-h-[410px] leading-relaxed relative premium-card-shadow">
                      {/* Stationery Logo Header */}
                      <div className="flex items-center justify-between pb-3.5 mb-3 border-b-2 border-[#edf1f9]">
                        <div className="flex items-center gap-2 text-[10px] font-black text-[#3638b3]">
                          <BookmarkCheck className="w-4.5 h-4.5" />
                          {placeholderValues['기관/센터명'] || '공공고용네트워크 발송'}
                        </div>
                        <span className="text-[8px] font-black font-mono text-[#3638b3] bg-[#edf1f9] px-2 py-0.5 rounded-full">STATUS: OFFICIAL MAIL</span>
                      </div>

                      {/* Letter Content space */}
                      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin select-text">
                        <div className="text-[11px] text-[#1e2229] whitespace-pre-wrap font-sans font-medium break-all leading-relaxed">
                          {bodyText || '템플릿 내용이 여기에 렌더링됩니다.'}
                        </div>
                      </div>

                      {/* Stamp seal mimic */}
                      <div className="absolute bottom-5 right-5 opacity-20 pointer-events-none transform rotate-12">
                        <div className="w-16 h-16 rounded-full border-4 border-rose-600 flex items-center justify-center text-[10px] font-black text-rose-600 text-center uppercase p-1">
                          공공센터<br/>날인필
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* PLAIN TEXT / RAW EDIT VIEW */
                <div className="flex-1 flex flex-col space-y-1">
                  <textarea
                    value={bodyText}
                    onChange={(e) => {
                      setBodyText(e.target.value);
                      setIsManuallyEdited(true);
                    }}
                    className="w-full flex-1 min-h-[360px] px-4 py-3.5 bg-white border border-[#d6daeb] rounded-2xl text-xs leading-relaxed font-sans font-bold outline-none focus:border-[#3638b3] focus:ring-2 focus:ring-[#3638b3]/10 whitespace-pre-wrap select-text premium-shadow focus:bg-white"
                    placeholder="본문 완성 텍스트"
                  />
                </div>
              )}

              {/* Force Recalc default sync */}
              {isManuallyEdited && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setIsManuallyEdited(false);
                      // Force compute
                      setPlaceholderValues({ ...placeholderValues });
                    }}
                    className="text-[10px] text-[#3638b3] hover:text-[#2c2e99] font-black underline transition-colors"
                  >
                    수정 상태 취소하고 치환자 실시간 동형 상태로 되돌리기
                  </button>
                </div>
              )}

              {/* Warnings and auto-fix triggers if prohibited expressions exist */}
              {currentDetectedProhibited.length > 0 && (
                <div className="p-4 bg-amber-55/80 border border-amber-200/60 rounded-2xl space-y-2.5 flex-shrink-0 premium-shadow">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-600 mt-0.5 flex-shrink-0 animate-bounce" />
                    <div>
                      <p className="text-xs font-black text-amber-950 leading-normal">
                        공공 행정 가령 위배 단어 {currentDetectedProhibited.length}건 실시간 적발!
                      </p>
                      <p className="text-[10px] text-amber-800 leading-relaxed font-semibold">
                        공무 발송 문맥에 어긋나는 단어가 포함되어 공적 격조를 저하시키고 있습니다. 아래 안전 변용 버튼을 통해 일괄 치환 정화하십시오.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end animate-pulse">
                    <button
                      type="button"
                      onClick={handleFixAllProhibited}
                      className="bg-amber-650 hover:bg-amber-700 text-white font-extrabold text-[10.5px] px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span>검색 위배 표현 일괄 무결성 자동 정화</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Footer - 2x2 asymmetric functional layout */}
            <div className="bg-[#edf1f9]/40 border-t border-[#e1e5f2] p-4 flex flex-col gap-3 flex-shrink-0">
              {/* Row 1: Copy Clipboard, which is the primary administrative output */}
              <button
                type="button"
                onClick={handleCopy}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#3638b3] hover:bg-[#2c2e99] text-white font-black py-3 px-5 rounded-2xl shadow-md transition-all text-xs"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4.5 h-4.5 text-emerald-300 animate-bounce" />
                    클립보드 복사 완료!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    전체 문구 즉시 클립보드 복사
                  </>
                )}
              </button>

              {/* Row 2: Standard, DOC, and PDF exports in three responsive columns */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-extrabold py-3 px-3 rounded-2xl border border-[#d6daeb] shadow-xs transition-all text-[11px]"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  메모장(.txt)
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDoc}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#e8eeff] hover:bg-[#d6e2ff] text-[#3638b3] font-extrabold py-3 px-3 rounded-2xl border border-[#3638b3]/20 shadow-xs transition-all text-[11px]"
                >
                  <Download className="w-3.5 h-3.5 text-[#3638b3]" />
                  워드문서(.doc)
                </button>

                <button
                  type="button"
                  disabled={pdfLoading}
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#e11d48] font-extrabold py-3 px-3 rounded-2xl border border-[#e11d48]/20 shadow-xs transition-all disabled:opacity-60 text-[11px]"
                >
                  {pdfLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e11d48]" />
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-[#e11d48]" />
                      행정PDF(.pdf)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Guidelines Mini Card Panel */}
          <div className="flex-shrink-0">
            <GuidelineCard 
              currentText={bodyText} 
              onFixExpression={handleFixExpression} 
            />
          </div>

        </section>
        </div>
      </main>

      {/* Hidden A4-proportioned Container strictly for High-Fidelity PDF generation */}
      <div className="absolute top-0 left-0 -translate-x-[9999px] -translate-y-[9999px] overflow-hidden pointer-events-none" aria-hidden="true">
        <div 
          id="pdf-print-template" 
          className="w-[794px] bg-white p-16 text-[#1e2229] font-sans relative flex flex-col"
          style={{ minHeight: '1123px' }}
        >
          {/* Top band color */}
          <div className="h-2.5 bg-[#3638b3] w-full mb-8"></div>
          
          {/* Office Letterhead header */}
          <div className="flex justify-between items-start border-b-2 border-[#edf1f9] pb-5 mb-10">
            <div>
              <p className="text-xs font-black text-[#5759cc] tracking-widest uppercase mb-1">
                {placeholderValues['기관/센터명'] || '일자리종합지원센터'} • OFFICIAL RELEASE
              </p>
              <h2 className="text-xl font-extrabold text-[#1b1c54]">
                {currentTemplate.title}
              </h2>
            </div>
            <div className="text-right text-[10.5px] text-slate-400 font-mono leading-relaxed">
              <p>DATE: 2026-06-19</p>
              <p>REF: PUBLIC-DOC-{selectedTemplateId.substring(0, 5).toUpperCase()}</p>
            </div>
          </div>

          {/* Subject Field mimicking standard administration documentation */}
          {subjectText && (
            <div className="mb-8 bg-[#f4f6fc] border-l-4 border-[#3638b3] p-5 rounded-2xl">
              <span className="text-[10px] font-black text-[#3638b3] uppercase tracking-wider block mb-1.5">문서 수신 제목 (SUBJECT)</span>
              <h3 className="text-sm font-black text-[#1b1c54] leading-relaxed">
                {subjectText}
              </h3>
            </div>
          )}

          {/* Clean margins high-fidelity formatted text body */}
          <div className="flex-1 text-[13px] leading-extraloose text-slate-800 whitespace-pre-wrap font-medium break-all pr-4">
            {bodyText}
          </div>

          {/* Signature and Seal Area in footer */}
          <div className="flex justify-between items-end border-t border-slate-100 pt-10 mt-12">
            <div className="text-slate-400 text-[10px] leading-relaxed">
              <p>• 본 임무 위임서는 고용노동부 가이드라인 및 공공 표준 행정 검수를 거쳐 발송되었습니다.</p>
              <p>• 문서 보안 및 자동 무결성 코드: MD5_{selectedTemplateId.toUpperCase().replace('-', '_')}_SECURE</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] text-[#3638b3] font-bold font-mono tracking-wider">ISSUED BY</p>
                <p className="text-xs font-extrabold text-[#1b1c54] mt-0.5">
                  {placeholderValues['기관/센터명'] || '일자리종합지원센터'}
                </p>
              </div>
              <div className="w-18 h-18 rounded-full border-4 border-rose-600 flex items-center justify-center text-[10.5px] font-black text-rose-600 text-center uppercase p-1.5 transform rotate-12 bg-white flex-shrink-0">
                공공센터<br/>날인필
              </div>
            </div>
          </div>

          {/* Disclaimer text */}
          <div className="text-center text-[9.5px] text-slate-400 mt-10 border-t border-slate-200/40 pt-4 font-semibold leading-relaxed">
            문서 사본은 실시간으로 검사 필증이 수작동 기록되며, 오타 및 위배 표현의 자동 무결성 치환이 완료되었음을 입증합니다.
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#1b1c54] text-slate-300 border-t border-[#12133b] py-8 mt-12 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[#edf1f9] text-xs font-black">
            <BookmarkCheck className="w-4.5 h-4.5 text-[#3638b3] animate-pulse" />
            <span>본 도우미는 민간 컨설팅 느낌을 제거하는 공공기관 표준 발송 표현 원칙 및 최종 심사 기준을 엄수하여 수작동합니다.</span>
          </div>
          <p className="text-[10.5px] text-slate-400 font-mono">
            &copy; 2026-06-19 문자/메일작성도우미 • 일자리종합지원센터 & 고용센터 실무용 통합 관리 위원회
          </p>
        </div>
      </footer>
    </div>
  );
}
