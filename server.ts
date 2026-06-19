import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry user-agent
const getGeminiClient = (customApiKey?: string) => {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// 1. AI 문구 최적화 (공공기관 톤앤매너 교정) API
app.post("/api/gemini/optimize", async (req, res) => {
  try {
    const { text, type, focus } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const customKey = req.headers["x-gemini-api-key"] as string | undefined;
    const ai = getGeminiClient(customKey);
    
    const systemInstruction = `
귀하는 공공기관 및 고용센터의 전문 취업지원 담당자입니다.
상황에 맞춰 문자나 메일 작성 시, 제공되는 '작성 시 유의사항' 가이드를 엄격히 준수하여 텍스트를 교정하거나 추천해 주는 역할을 합니다.

[작성 시 유의사항]
1. 표현 원칙:
- 과장된 표현은 절대 사용하지 않습니다.
- 객관적이고 중립적인 표현을 사용합니다.
- 채용조건, 구직자 역량, 면접 일정, 준비사항을 명확히 안내합니다.
- 기업에는 검토 요청 및 회신 기한 설정을 중심으로 작성합니다.
- 구직자에게는 합격 안내, 면접 일정, 명확한 회신 방법 안내 중심으로 작성합니다.

2. 지양할 표현 (민간 헤드헌터 또는 컨설팅사 느낌이 강하므로 절대 사용 금지):
- 완벽히 부합하는 핵심 인재
- 즉각적인 기여를 할 수 있을 것으로 확신합니다
- 치열한 경쟁을 뚫고 합격
- 인사담당자의 시선을 사로잡은 결과
- 최종 합격의 순간까지 함께 집중해 봅시다
- 수석 취업 컨설턴트
- 컨설팅 세션

3. 권장 표현 (공공기관 안내문에 적합하므로 적극 권장):
- 귀사의 채용조건과 구직자의 경력 및 희망직무가 부합한다고 판단되어 추천드립니다.
- 첨부된 지원서류를 검토하신 후 면접 진행 여부를 회신해 주시면 감사하겠습니다.
- 서류전형 합격을 축하드리며, 면접 일정 및 준비사항을 안내드립니다.
- 원활한 면접 진행을 위해 면접 시작 10분 전까지 도착해 주시기 바랍니다.
- 면접 참석 가능 여부를 회신해 주시기 바랍니다.

[수행 임무]
사용자가 입력한 텍스트를 받아, 위 가이드를 엄격히 반영하여 문구를 최적화(다듬기)해 주세요.
- 과장된 표현이나 지양 표현이 들어가 있다면 이를 객관적이고 권장되는 공공기관 톤앤매너 표현으로 수정합니다.
- 공적이고 정중하며 친절한 톤앤매너(하십시오/해요/합니다 계열의 경어체)를 유지해 주세요.
- 결과만 마크다운이 아닌 단순 텍스트 형태로 아주 깔끔하게 출력해야 하며, 설명이나 잡담 없이 교정된 본문 텍스트만 리턴해 주세요.
`;

    const userPrompt = `
수정 대상 텍스트:
"""
${text}
"""

참고 정보 (메시지 유형): ${type || "일반 문자/메일"}
포커스/요청사항: ${focus || "공공기관 톤앤매너 반영, 지양 표현 수정"}

오직 정제되고 교정된 완성형 문구 본문만 최종 출력하세요. 어떤 해설이나 주의점 등 추가적인 언급은 작성하지 마십시오.
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      }
    });

    res.json({ optimizedText: result.text || "" });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    res.status(500).json({ error: error.message || "AI 최적화 중 오류가 발생했습니다." });
  }
});

// 2. AI 추천 사유/역량 자동 생성 API
app.post("/api/gemini/generate-field", async (req, res) => {
  try {
    const { field, job, experience, skills } = req.body;
    if (!field) {
      return res.status(400).json({ error: "Field is required" });
    }

    const customKey = req.headers["x-gemini-api-key"] as string | undefined;
    const ai = getGeminiClient(customKey);

    const systemInstruction = `
귀하는 공공기관 및 고용센터의 전문 취업지원 담당자입니다.
구직 정보(지원직무, 경력사항, 역량기술 등)를 기반으로, 템플릿 내부의 특정 입력칸(예: "추천 사유" 또는 "주요 경력/경험", "보유 역량")을 채울 수 있도록 과장 없고 객관적이고 간결한 공공기관용 맞춤형 문구를 작성해 줍니다.

[작성 시 유의사항]
1. 완벽히 부합하는 핵심 인재, 즉각적인 기여 등 과장된 표현은 지양합니다.
- "해당 직무 수행에 필요한 기본 역량과 관련 경험을 보유하고 있어 검토를 요청드립니다"와 같이 확인된 팩트 위주의 차분하고 객관적인 설명을 작성합니다.
- 공공기관 톤에 맞도록 단문 위주로 명료하게 작성합니다.
`;

    let prompt = "";
    if (field === "recommendationReason") {
      prompt = `
지원직무: ${job || "미정"}
주요 경력: ${experience || "관련 경력 없음 / 신입"}
보유 역량: ${skills || "관련 역량"}

위 정보를 토대로 공공기관 발송용 구직자 추천 메일에 적합한 "추천 사유" 항목 부분을 1~2문장으로 객관적이고 담백하게 작성해 주세요. 
(예시: "해당 분야에 대한 기초 직무 교육을 이수하였으며, 관련 실무 및 고객 소통 경험을 갖추고 있어 직무 수행에 원만히 적응할 수 있을 것으로 판단되어 검토를 요청드립니다.")
설명 없이 즉시 템플릿에 들어갈 결과 텍스트만 출력하세요.
`;
    } else if (field === "experienceSummary") {
      prompt = `
주요 경력: ${experience || "관련 경력 없음"}
지원직무: ${job || "미정"}

위 정보를 토대로 구직자의 "주요 경력/경험" 항목을 이메일 발송용 템플릿에 맞추어 간략한 항목 단어로 정리해 주세요. (예시: "사무행정 업무 2년 근무 / 관련 자격증 보유")
설명 없이 결과 텍스트만 한 줄로 출력하세요.
`;
    } else if (field === "skillsSummary") {
      prompt = `
보유 역량: ${skills || "성실함, 끈기 등"}
지원직무: ${job || "미정"}

위 정보를 토대로 구직자의 "보유 역량" 항목을 이메일 발송용 템플릿에 맞추어 담백하고 간결하게 정리해 주세요. (예시: "고객응대, 사무행정, 데이터 관리")
설명 없이 결과 텍스트만 한 줄로 출력하세요.
`;
    }

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
      }
    });

    res.json({ text: (result.text || "").trim() });
  } catch (error: any) {
    console.error("Gemini AI API Error:", error);
    res.status(500).json({ error: error.message || "AI 생성 중 오류가 발생했습니다." });
  }
});

// 3. API Key Validation API
app.post("/api/gemini/validate", async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ success: false, error: "API 키가 제공되지 않았습니다." });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Make an optimized lightweight verification call - e.g., countTokens or short simple prompt
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Validate API key status: respond only with the text 'OK'.",
      config: {
        maxOutputTokens: 5,
        temperature: 0.1
      }
    });

    if (result && result.text) {
      return res.json({ success: true, message: "검증 성공" });
    } else {
      return res.status(400).json({ success: false, error: "유효하지 않는 API 키입니다." });
    }
  } catch (error: any) {
    console.error("API Key Validation Error on Server:", error);
    return res.status(400).json({ 
      success: false, 
      error: error.message || "유효한 API 키가 아닙니다. 입력값을 다시 확인해 주세요." 
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
