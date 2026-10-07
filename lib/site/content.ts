export const SITE_EMAIL = 'mailto:zxtw17985321@gmail.com'
export const CV_URL = 'https://terry90918.github.io/cv/'

export interface ExperienceNote {
  id: 'origins' | 'gj' | 'tpi' | 'nidin' | 'ai-work'
  title: string
  summary: string
  paragraphs: readonly string[]
  workHref?: string
}

export interface WorkCase {
  slug: 'gj' | 'nidin' | 'jurislm'
  title: string
  category: 'product' | 'platform' | 'ai'
  summary: string
  period: string
  role: string
  evidence: readonly string[]
}

// Factual experience notes, not invented memories or claims about motivation.
export const STORY_CHAPTERS: readonly ExperienceNote[] = [
  {
    id: 'origins',
    title: '從書店走進開發',
    summary: '設計與藝術，讓我走進軟體開發。',
    paragraphs: [
      '我走進軟體開發的起點，是書店裡的一本書。',
      '材料工程畢業後，我曾在建築師事務所研究建築材料，後來轉到星巴克當咖啡師。在那段時間，一本介紹前端工程師的書，讓我找到和設計、藝術興趣相連的方向。我到資策會學了大約半年，接著進入第一份開發工作，接觸前後端整合與伺服器。',
    ],
  },
  {
    id: 'gj',
    title: '和團隊一起做 GJ',
    summary: '從產品規劃、架構到全端實作，推出即時工作媒合服務。',
    paragraphs: [
      '後來，我和幹得好科技的團隊一起打造 GJ 即時上工，希望讓打工族與雇主找到彼此，並加入聊天室、打卡等功能。',
      '產品之外，我們也要找到更多使用者與雇主，嘗試 KOL 推廣、參與加速器、接受媒體訪談。GJ 最終沒有持續下去，但這段從開發到尋找市場的經歷，讓我實際看見產品起步時要面對的挑戰。',
    ],
    workHref: '/work/gj',
  },
  {
    id: 'tpi',
    title: '從產品開發到團隊搭建',
    summary: '從產品開發，走向工程團隊與大型專案交付。',
    paragraphs: [
      'GJ 之後，我先在歐克斯科技參與 Ubee 房屋比價服務，接著到 VoiceTube，參與 VClass 從建置到上線，以及 Hero Web 的維護與擴建。',
      '到了昕力資訊，我從資深軟體工程師走向帶領團隊、推進大型專案的角色。擔任主任工程師期間，我搭建工程團隊，帶領 20 人規模的團隊參與國發會檔案管理局專案，將機關需求轉成系統規劃、任務分工與階段性交付。',
      '我主要負責前後台架構與機關資料處理流程，也負責資安弱點檢查與修正，將技術規劃落實到系統交付。',
      '這份責任同時涉及技術與管理：協調政府單位及地方機關、理解正式公文與檔案規範、配合資安審查，也要衡量人力配置、開發時程與各單位的成本。我的工作不再只圍繞個人的技術成果，而是整合不同角色與資源，帶領團隊完成交付。',
    ],
    workHref: '/work#tpi',
  },
  {
    id: 'nidin',
    title: '在 Nidin，持續做系統與帶團隊',
    summary: '在多品牌點餐平台，負責系統設計、產品交付，並直接管理 10 位工程師。',
    paragraphs: [
      '2021 年，我加入雲仲資訊，擔任 Nidin 你訂的技術經理，直接管理 10 位工程師。四年間，我的工作圍繞平台的系統設計、產品交付與團隊管理。像促銷優惠券，我們採分批發送與 API 控流，避免影響持續運作的訂單服務。',
    ],
    workHref: '/work/nidin',
  },
  {
    id: 'ai-work',
    title: '開始自己的 AI 工作',
    summary: '近期與仁大法律及途銳資訊合作，把 AI 放進實際產品流程。',
    paragraphs: [
      '2025 年 6 月，我離開雲仲資訊，開始自己的 AI 工作。與仁大法律合作 JurisLM，參與法律問答、合約審閱與書狀草擬流程；也參與 Channel-T，處理旅行供應商資料同步，以及將文件中的行程整理成可搜尋、可上架頁面的 AI 流程。',
    ],
    workHref: '/work/jurislm',
  },
]

// The homepage offers three concise entry points; Story keeps its chronological order.
export const EXPERIENCE_NOTES = ['nidin', 'gj', 'ai-work'].map(
  (id) => STORY_CHAPTERS.find((chapter) => chapter.id === id)!
)

export const WORK_CATEGORY_LABELS: Record<WorkCase['category'], string> = {
  product: '從規劃到上線的產品',
  platform: '持續運作的平台',
  ai: 'AI 工作流程',
}

export const WORK_CASES: readonly WorkCase[] = [
  {
    slug: 'nidin',
    title: 'Nidin 你訂',
    category: 'platform',
    summary: '多品牌點餐平台的系統設計、產品交付與團隊管理。',
    period: '2021.05 — 2025.06',
    role: '雲仲資訊技術經理；直接管理 10 位工程師',
    evidence: [
      '促銷優惠券採排程分批發送，搭配 API 流量控管，避免發送作業影響訂單服務。',
      '當時平台支援 820 萬會員與每年 1,500 萬筆以上訂單。',
      '直接管理 10 位工程師。',
    ],
  },
  {
    slug: 'gj',
    title: 'GJ 即時上工',
    category: 'product',
    summary:
      '共同創辦即時工作媒合服務，負責產品規劃、架構與全端實作，完成網站、手機端與雲端服務上線。',
    period: '2018.02 — 2018.06',
    role: '共同創辦；產品規劃、系統架構與全端實作',
    evidence: [
      '負責產品規劃、架構與全端實作，完成網站、手機端與雲端服務。',
      '服務包含即時工作媒合，團隊在台大創創中心，曾於 Meet Taipei 展示。',
    ],
  },
  {
    slug: 'jurislm',
    title: 'JurisLM',
    category: 'ai',
    summary:
      '與仁大法律合作，參與法律問答、合約審閱與書狀草擬的產品規劃、系統開發、資料處理與維運。',
    period: '2025.06 — 2026.09',
    role: '產品規劃、系統開發、資料處理與維運',
    evidence: [
      '建立司法資料擷取與檢索流程，處理 2,135 萬筆司法資料。',
      '20 次抽樣測試的平均召回率為 0.957。這是該組樣本的檢索召回率，不是整體 AI 準確率。',
      '平台支援法律問答、合約審閱、書狀草擬，整合 22 項工具與 3 項資料資源。',
    ],
  },
]

export interface SupportingWork {
  id: string
  title: string
  category: WorkCase['category']
  summary: string
  paragraphs?: readonly string[]
  responsibilities?: readonly string[]
  afterword?: string
}

export const SUPPORTING_WORK: readonly SupportingWork[] = [
  {
    id: 'tpi',
    title: '昕力資訊｜大型專案與工程團隊',
    category: 'platform',
    summary: '擔任主任工程師，搭建工程團隊並帶領 20 人規模的團隊參與國發會檔案管理局專案。',
    paragraphs: [
      '後台支援不同機關登入、上傳與彙整檔案；資料經解析、清洗及規格檢核後，再供前台呈現。',
    ],
    responsibilities: [
      '前後台架構、登入與機關權限設計',
      '機關檔案上傳、分析解析、資料清洗，以及格式與規範符合性驗證',
      '資安弱點掃描，並依結果修正程式碼與架構中的問題',
    ],
    afterword:
      '同時協調政府單位及地方機關，配合正式公文、檔案規範與資安審查，並衡量人力配置、開發時程及各單位成本。',
  },
  {
    id: 'voicetube',
    title: 'VoiceTube｜VClass 與 Hero Web',
    category: 'product',
    summary: '擔任資深軟體工程師，核心負責 VClass 從建置到上線，並參與 Hero Web 的維護與擴建。',
  },
  {
    id: 'channel-t',
    title: 'Channel-T',
    category: 'ai',
    summary: '串接旅行供應商 API，並將 PDF、圖片中的行程整理成可搜尋、可上架的頁面。',
  },
]
