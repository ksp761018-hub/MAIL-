export type TemplateCategory = 'employer' | 'jobseeker';
export type TemplateType = 'email' | 'sms';

export interface Template {
  id: string;
  category: TemplateCategory;
  type: TemplateType;
  title: string;
  subjectTemplate?: string;
  bodyTemplate: string;
  placeholders: {
    key: string;
    label: string;
    description?: string;
    defaultValue?: string;
    isAiSupported?: boolean;
    aiFieldType?: 'recommendationReason' | 'experienceSummary' | 'skillsSummary';
  }[];
}

export const TEMPLATES: Template[] = [
  {
    id: 'employer-recommend-candidate',
    category: 'employer',
    type: 'email',
    title: '① 구직자 추천 및 면접 검토 요청',
    subjectTemplate: '[구직자 추천] [지원직무] 분야 구직자 추천 및 면접 검토 요청',
    bodyTemplate: `안녕하세요.  
[기관/센터명] 취업지원팀 [담당자명]입니다.

귀사의 [지원직무] 채용과 관련하여, 채용조건과 구직자의 경력 및 희망직무가 부합한다고 판단되어 아래와 같이 구직자를 추천드립니다.

## [추천 구직자 주요 내용]

- **성명:** [구직자명]
- **지원직무:** [지원직무]
- **주요 경력/경험:** [예: OO업무 2년 / 관련 직무 경험 보유]
- **보유 역량:** [예: 고객응대, 사무행정, 데이터 관리, 현장 업무 경험 등]
- **추천 사유:** [예: 해당 직무 수행에 필요한 기본 역량과 관련 경험을 보유하고 있어 검토를 요청드립니다.]

첨부드린 이력서 및 자기소개서를 검토하신 후, 면접 진행 가능 여부를 **[O월 O일]까지** 회신해 주시면 감사하겠습니다.

면접 일정이 확정되면 구직자에게 안내하고, 원활히 진행될 수 있도록 지원하겠습니다.

감사합니다.

[기관/센터명]  
[담당자명] 드림  
[연락처]`,
    placeholders: [
      { key: '기관/센터명', label: '기관/센터명', defaultValue: 'OO일자리종합지원센터' },
      { key: '담당자명', label: '담당자명', defaultValue: '홍길동' },
      { key: '지원직무', label: '지원직무', defaultValue: '사무행정' },
      { key: '구직자명', label: '구직자명', defaultValue: '김민수' },
      { key: '예: OO업무 2년 / 관련 직무 경험 보유', label: '주요 경력/경험', defaultValue: '행정 실무 2년 및 행정사 자격 보유', isAiSupported: true, aiFieldType: 'experienceSummary' },
      { key: '예: 고객응대, 사무행정, 데이터 관리, 현장 업무 경험 등', label: '보유 역량', defaultValue: '문서 작성, 고객 상담, 데이터 정형화', isAiSupported: true, aiFieldType: 'skillsSummary' },
      { key: '예: 해당 직무 수행에 필요한 기본 역량과 관련 경험을 보유하고 있어 검토를 요청드립니다.', label: '추천 사유', defaultValue: '꼼꼼한 성격과 축적된 경험을 바탕으로 귀사 행정 업무에 안정적으로 기여할 구직자입니다.', isAiSupported: true, aiFieldType: 'recommendationReason' },
      { key: 'O월 O일', label: '회신 기한', defaultValue: '6월 25일' },
      { key: '연락처', label: '담당자 연락처', defaultValue: '02-1234-5678' }
    ]
  },
  {
    id: 'employer-interview-check',
    category: 'employer',
    type: 'email',
    title: '② 면접 가능 여부 확인 요청',
    subjectTemplate: '[면접 검토 요청] [구직자명]님 [지원직무] 지원 관련',
    bodyTemplate: `안녕하세요.  
[기관/센터명] 취업지원팀 [담당자명]입니다.

[기업명]의 [지원직무] 채용과 관련하여 [구직자명]님을 추천드립니다.

구직자의 경력 및 희망직무를 검토한 결과, 귀사의 채용요건과 일정 부분 부합한다고 판단되어 면접 검토를 요청드립니다.

## [구직자 주요 사항]

- **성명:** [구직자명]
- **희망직무:** [지원직무]
- **주요 경력:** [주요 경력 또는 경험]
- **관련 역량:** [직무 관련 역량]

첨부된 지원서류를 확인하신 후, 면접 진행 여부 및 가능 일정을 **[O월 O일]까지** 회신해 주시면 감사하겠습니다.

감사합니다.

[기관/센터명]  
[담당자명] 드림  
[연락처]`,
    placeholders: [
      { key: '기관/센터명', label: '기관/센터명', defaultValue: 'OO고용센터' },
      { key: '담당자명', label: '담당자명', defaultValue: '이영희' },
      { key: '기업명', label: '기업명', defaultValue: '(주)가나다텍' },
      { key: '지원직무', label: '지원직무/희망직무', defaultValue: '고객지원 전문가' },
      { key: '구직자명', label: '구직자명', defaultValue: '박철수' },
      { key: '주요 경력 또는 경험', label: '주요 경력', defaultValue: 'IT 서비스 고객센터 1년 6개월 근무', isAiSupported: true, aiFieldType: 'experienceSummary' },
      { key: '직무 관련 역량', label: '관련 역량', defaultValue: '고객 불만 해결력, 원활한 구동 대화', isAiSupported: true, aiFieldType: 'skillsSummary' },
      { key: 'O월 O일', label: '회신 기한', defaultValue: '6월 24일' },
      { key: '연락처', label: '담당자 연락처', defaultValue: '02-987-6543' }
    ]
  },
  {
    id: 'jobseeker-pass-sms',
    category: 'jobseeker',
    type: 'sms',
    title: '① 서류전형 합격 및 면접 일정 안내',
    bodyTemplate: `[서류전형 합격 및 면접 안내]

안녕하세요. [기관/센터명]입니다.

지원하신 **[기업명] [지원직무]** 서류전형에 합격하여 면접 일정을 안내드립니다.

- **면접일시:** 2026년 [월] [일]([요일]) [시] [분]
- **면접장소:** [면접 장소]
- **준비물:** [신분증, 이력서, 포트폴리오 등]
- **문의:** [담당자 연락처]

원활한 면접 진행을 위해 면접 시작 10분 전까지 도착해 주시기 바랍니다.

※ 면접 참석 가능 여부를 확인하신 후, **[O월 O일]까지** 이 번호(또는 [회신처])로 답장 부탁드립니다.

감사합니다.  
[기관/센터명]`,
    placeholders: [
      { key: '기관/센터명', label: '기관/센터명', defaultValue: 'OO고용센터' },
      { key: '기업명', label: '기업명', defaultValue: '(주)에이비씨상사' },
      { key: '지원직무', label: '지원직무', defaultValue: '물류관리 직무' },
      { key: '월', label: '면접 월', defaultValue: '6' },
      { key: '일', label: '면접 일', defaultValue: '26' },
      { key: '요일', label: '면접 요일', defaultValue: '금' },
      { key: '시', label: '면접 시', defaultValue: '14' },
      { key: '분', label: '면접 분', defaultValue: '00' },
      { key: '면접 장소', label: '면접 장소', defaultValue: '본관 3층 회의실 (서울시 마포구 독막로)' },
      { key: '신분증, 이력서, 포트폴리오 등', label: '준비물', defaultValue: '신분증, 이력서 출력본 1부' },
      { key: '담당자 연락처', label: '담당자 연락처/문의처', defaultValue: '02-123-4567 (내선 102)' },
      { key: 'O월 O일', label: '회신 마감일', defaultValue: '6월 24일' },
      { key: '회신처', label: '회신처명', defaultValue: '본 고용센터 연락망' }
    ]
  },
  {
    id: 'jobseeker-attendance-sms',
    category: 'jobseeker',
    type: 'sms',
    title: '② 면접 참석 여부 확인',
    bodyTemplate: `[면접 참석 여부 확인]

안녕하세요. [기관/센터명]입니다.

[기업명] [지원직무] 면접 참석 여부를 확인하고자 연락드립니다.

- **면접일시:** 2026년 [월] [일]([요일]) [시] [분]
- **면접장소:** [면접 장소]

참석 가능 여부를 **[O월 O일]까지** 아래 형식으로 회신해 주시기 바랍니다.  
(※ 본 문자는 발신전용이므로 회신은 **[수신가능 번호]**로 부탁드립니다.)

**예시: 성함 / 참석 가능**  
또는  
**성함 / 참석 불가**

감사합니다.  
[기관/센터명]`,
    placeholders: [
      { key: '기관/센터명', label: '기관/센터명', defaultValue: 'OO고용지원센터' },
      { key: '기업명', label: '기업명', defaultValue: '대성기업' },
      { key: '지원직무', label: '지원직무', defaultValue: '품질개발팀' },
      { key: '월', label: '면접 월', defaultValue: '6' },
      { key: '일', label: '면접 일', defaultValue: '27' },
      { key: '요일', label: '면접 요일', defaultValue: '토' },
      { key: '시', label: '면접 시', defaultValue: '10' },
      { key: '분', label: '면접 분', defaultValue: '30' },
      { key: '면접 장소', label: '면접 장소', defaultValue: '가산디지털단지 IT타워 5층 대기실' },
      { key: 'O월 O일', label: '회신 마감 기한', defaultValue: '6월 25일' },
      { key: '수신가능 번호', label: '회신 수신 가능 번호', defaultValue: '010-1234-5678' }
    ]
  },
  {
    id: 'jobseeker-pass-email',
    category: 'jobseeker',
    type: 'email',
    title: '③ 서류전형 합격 및 면접 준비 안내',
    subjectTemplate: '[서류전형 합격 안내] [기업명] [지원직무] 면접 일정 안내',
    bodyTemplate: `제목: [서류전형 합격 안내] [기업명] [지원직무] 면접 일정 안내

안녕하세요, [구직자명]님.  
[기관/센터명] 취업지원팀 [담당자명]입니다.

지원하신 **[기업명] [지원직무]** 서류전형에 합격하신 것을 축하드립니다.

아래와 같이 면접 일정 및 준비사항을 안내드립니다.

## 면접 일정

- **기업명:** [기업명]
- **지원직무:** [지원직무]
- **면접일시:** 2026년 [월] [일]([요일]) [시] [분]
- **면접장소:** [면접 장소]
- **준비물:** [신분증, 이력서, 자기소개서, 포트폴리오 등]

면접에서는 지원하신 직무와 관련된 경험, 보유 역량, 근무 가능 여부 등을 중심으로 질문이 진행될 수 있습니다.

지원서에 작성한 주요 경험과 직무 관련 강점을 다시 한번 정리해 보시고 참석해 주시기 바랍니다.

원활한 진행을 위해 면접 참석 가능 여부를 **[O월 O일]까지** 본 메일로 회신해 주시면 감사하겠습니다.

감사합니다.

[기관/센터명]  
[담당자명] 드림  
[연락처]`,
    placeholders: [
      { key: '구직자명', label: '구직자명', defaultValue: '이정우' },
      { key: '기관/센터명', label: '기관/센터명', defaultValue: '서울마포일자리센터' },
      { key: '담당자명', label: '담당자명', defaultValue: '최윤석' },
      { key: '기업명', label: '기업명', defaultValue: '유니콘소프트(주)' },
      { key: '지원직무', label: '지원직무', defaultValue: '웹 프론트엔드 개발' },
      { key: '월', label: '면접 월', defaultValue: '6' },
      { key: '일', label: '면접 일', defaultValue: '29' },
      { key: '요일', label: '면접 요일', defaultValue: '월' },
      { key: '시', label: '면접 시', defaultValue: '15' },
      { key: '분', label: '면접 분', defaultValue: '00' },
      { key: '면접 장소', label: '면접 장소', defaultValue: '서초구 테헤란로 123 본사 소회의실B' },
      { key: '신분증, 이력서, 자기소개서, 포트폴리오 등', label: '준비물', defaultValue: '신분증, 개인 포트폴리오 요약본' },
      { key: 'O월 O일', label: '회신 마감일', defaultValue: '6월 26일' },
      { key: '연락처', label: '담당자 연락처', defaultValue: '02-555-7788' }
    ]
  },
  {
    id: 'jobseeker-pass-celebration-sms',
    category: 'jobseeker',
    type: 'sms',
    title: '④ 서류전형 합격 축하 및 준비사항 안내',
    bodyTemplate: `[서류전형 합격 안내]

안녕하세요. [기관/센터명]입니다.

지원하신 **[기업명] [지원직무]** 서류전형에 합격하셨습니다.

면접 일정은 아래와 같습니다.

- **일시:** 2026년 [월] [일]([요일]) [시] [분]
- **장소:** [면접 장소]
- **준비물:** [준비물]

면접 전 지원서에 작성한 경력, 직무 관련 경험, 지원동기를 다시 한번 확인해 주시기 바랍니다.

※ 참석 가능 여부를 **[O월 O일]까지** 회신 부탁드립니다.

감사합니다.  
[기관/센터명]`,
    placeholders: [
      { key: '기관/센터명', label: '기관/센터명', defaultValue: '경기일자리센터' },
      { key: '기업명', label: '기업명', defaultValue: '(주)하나테크' },
      { key: '지원직무', label: '지원직무', defaultValue: '생산관리관리직' },
      { key: '월', label: '면접 월', defaultValue: '6' },
      { key: '일', label: '면접 일', defaultValue: '28' },
      { key: '요일', label: '면접 요일', defaultValue: '일' },
      { key: '시', label: '면접 시', defaultValue: '13' },
      { key: '분', label: '면접 분', defaultValue: '30' },
      { key: '면접 장소', label: '장소/면접 장소', defaultValue: '성남 제2공장 경영지원센터 1층' },
      { key: '준비물', label: '준비물', defaultValue: '신분증, 자격 및 경력증명서 사본' },
      { key: 'O월 O일', label: '회신 마감일', defaultValue: '6월 25일' }
    ]
  },
  {
    id: 'jobseeker-event-sms',
    category: 'jobseeker',
    type: 'sms',
    title: '⑤ 면접 및 행사 참여 안내',
    bodyTemplate: `[면접 및 행사 참여 안내]

안녕하세요. [기관/센터명]입니다.

지원하신 **[기업명] [지원직무]** 면접 및 취업 행사 참여 일정을 아래와 같이 안내드립니다.

- **행사/면접일시:** 2026년 [월] [일]([요일]) [시] [분]
- **행사/면접장소:** [행사/면접 장소]
- **준비물:** [준비물]
- **문의:** [담당자 연락처]

원활한 행사 및 면접 진행을 위해 행사 시작 10분 전까지 도착해 주시기 바랍니다.

※ 참석 가능 여부를 확인하신 후, **[O월 O일]까지** 회신 부탁드립니다.

감사합니다.  
[기관/센터명]`,
    placeholders: [
      { key: '기관/센터명', label: '기관/센터명', defaultValue: '서울마포일자리종합지원센터' },
      { key: '기업명', label: '관련 기업명', defaultValue: '중소벤처 기술협력사 연합' },
      { key: '지원직무', label: '지원 직무/분야', defaultValue: '기술행정 및 물류총무' },
      { key: '월', label: '일시 월', defaultValue: '6' },
      { key: '일', label: '일시 일', defaultValue: '29' },
      { key: '요일', label: '일시 요일', defaultValue: '월' },
      { key: '시', label: '일시 시', defaultValue: '14' },
      { key: '분', label: '일시 분', defaultValue: '00' },
      { key: '행사/면접 장소', label: '행사/면접 장소', defaultValue: '일자리센터 5층 대강당 대기부스' },
      { key: '준비물', label: '준비물', defaultValue: '단정한 복장, 신분증 지참' },
      { key: '담당자 연락처', label: '담당자 연락처', defaultValue: '02-1234-5678' },
      { key: 'O월 O일', label: '회신 마감일', defaultValue: '6월 26일' }
    ]
  },
  {
    id: 'employer-recommend-2026',
    category: 'employer',
    type: 'email',
    title: '③ [2026 표준] 고용촉진 장려금 연계 인재 추천',
    subjectTemplate: '[2026년 인재매칭] [지원직무] 분야 고용창출 인재 추천서',
    bodyTemplate: `안녕하세요.  
[기관/센터명] 일자리솔루션팀 [담당자명]입니다.

귀사의 발전과 성장을 기원합니다.

우리 센터에서는 **2026년 고용노동부 청년 일자리 도약 장려금 고용촉진 사업**의 일환으로, 귀사에서 구인 중이신 **[지원직무]** 직무에 적합한 우수한 구직자를 아래와 같이 매칭 추천드립니다.

본 추천 대상자는 사전 직무 역량 진단 및 관련 분야 기초 소양을 성실히 이수한 구직자로, 담당 실무자 소견 상 직무 적합도가 뛰어난 인재입니다.

## [2026 인재 매칭 추천서]

- **대상 구직자:** [구직자명] (생년: [출생년도]년)
- **추천 직무분야:** [지원직무]
- **핵심 역량요약:** [핵심 역량 기입]
- **전문가 추천의견:** [추천 의견 기입]

아울러 본 인재 채용 시 **2026년 신규 청년 도약 세액공제 및 고용지원금** 대상 요건 매칭 기회가 주어짐을 안내해 드립니다.

구인기업 면접 진행 여부를 **[O월 O일]까지** 회신하여 주시면, 면접 일정 조율 및 사후 행정 절차를 당 센터에서 신속히 원스톱 지원하겠습니다.

감사합니다.

[기관/센터명]  
[담당자명] 실무관 배상  
[연락처]`,
    placeholders: [
      { key: '기관/센터명', label: '기관/센터명', defaultValue: '서울서부종합고용센터' },
      { key: '담당자명', label: '담당자명', defaultValue: '김유진' },
      { key: '지원직무', label: '지원직무', defaultValue: '친환경 신소재 개발 연구' },
      { key: '구직자명', label: '추천 구직자명', defaultValue: '최동현' },
      { key: '출생년도', label: '구직자 출생년도', defaultValue: '1998' },
      { key: '핵심 역량 기입', label: '구직자 핵심 역량', defaultValue: '배터리 열화 분석 및 화학 기기 운영 자격 보유', isAiSupported: true, aiFieldType: 'skillsSummary' },
      { key: '추천 의견 기입', label: '상세 추천 의견', defaultValue: '연구실 보조 인턴 1년 실무 경험으로 기초 연구 역량이 뛰어납니다.', isAiSupported: true, aiFieldType: 'recommendationReason' },
      { key: 'O월 O일', label: '회신 기한', defaultValue: '6월 30일' },
      { key: '연락처', label: '담당자 대표 전화', defaultValue: '02-765-4321' }
    ]
  },
  {
    id: 'jobseeker-event-2026',
    category: 'jobseeker',
    type: 'sms',
    title: '⑥ [2026 표준] 고용센터 일자리 매칭 박람회 초청',
    bodyTemplate: `[2026 고용진흥 일자리 박람회 가이드]

안녕하세요. [기관/센터명]입니다.

귀하의 성공 취업을 위해 본 고용센터가 주선하는 **2026년 공공-민간 합동 일자리 매칭 박람회** 상세 일정을 안내드립니다.

검증된 다수 우수 강소기업들의 현장 면접 및 이력서 맞춤 첨삭이 제공되오니 참여하시어 좋은 기회 잡으시길 바랍니다.

- **박람회 일시:** 2026년 [월] [일]([요일]) [시] [분]
- **개최 장소:** [박람회 개최지]
- **구인 참여기업:** [협력사 명칭]
- **준비물:** [참가 준비물]
- **문의처:** [담당부서 및 전화]

원활한 현장 대기 배정을 위해, 참가 희망 여부를 **[O월 O일]까지** "[성함]/연락처/참석여부" 형식으로 답장 부탁드립니다.

감사합니다.
[기관/센터명]`,
    placeholders: [
      { key: '기관/센터명', label: '기관/센터명', defaultValue: '인천남동고용복지플러스센터' },
      { key: '월', label: '행사 월', defaultValue: '7' },
      { key: '일', label: '행사 일', defaultValue: '14' },
      { key: '요일', label: '행사 요일', defaultValue: '화' },
      { key: '시', label: '행사 시', defaultValue: '13' },
      { key: '분', label: '행사 분', defaultValue: '00' },
      { key: '박람회 개최지', label: '개체 장소', defaultValue: '인천 송도 컨벤시아 제3전시장 C홀' },
      { key: '협력사 명칭', label: '주요 참가 기업', defaultValue: '삼성바이오 외부협력사 포함 우수 첨단제조 45개사' },
      { key: '참가 준비물', label: '준비 사항', defaultValue: '단정한 비즈니스 캐주얼, 이력서 구비본 (모바일 접수 지원)' },
      { key: '담당부서 및 전화', label: '문의 대표처', defaultValue: '일자리 알선팀 032-888-9900' },
      { key: 'O월 O일', label: '예약 회신 기한', defaultValue: '7월 8일' }
    ]
  }
];

export interface GuidelinePrinciple {
  title: string;
  items: string[];
}

export const EXPRESSION_PRINCIPLES: GuidelinePrinciple = {
  title: '① 표현 원칙',
  items: [
    '과장된 표현은 절대 사용하지 않습니다.',
    '객관적이고 중립적인 표현을 사용합니다.',
    '채용조건, 구직자 역량, 면접 일정, 준비사항을 명확히 안내합니다.',
    '기업에는 검토 요청 및 회신 기한 설정을 중심으로 작성합니다.',
    '구직자에게는 합격 안내, 면접 일정, 명확한 회신 방법 안내 중심으로 작성합니다.'
  ]
};

export const PROHIBITED_EXPRESSIONS: string[] = [
  '완벽히 부합하는 핵심 인재',
  '즉각적인 기여를 할 수 있을 것으로 확신합니다',
  '치열한 경쟁을 뚫고 합격',
  '인사담당자의 시선을 사로잡은 결과',
  '최종 합격의 순간까지 함께 집중해 봅시다',
  '수석 취업 컨설턴트',
  '컨설팅 세션'
];

export const RECOMMENDED_EXPRESSIONS: string[] = [
  '귀사의 채용조건과 구직자의 경력 및 희망직무가 부합한다고 판단되어 추천드립니다.',
  '첨부된 지원서류를 검토하신 후 면접 진행 여부를 회신해 주시면 감사하겠습니다.',
  '서류전형 합격을 축하드리며, 면접 일정 및 준비사항을 안내드립니다.',
  '원활한 면접 진행을 위해 면접 시작 10분 전까지 도착해 주시기 바랍니다.',
  '면접 참석 가능 여부를 회신해 주시기 바랍니다.'
];
