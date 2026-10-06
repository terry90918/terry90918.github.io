export const SITE_EMAIL = 'mailto:zxtw17985321@gmail.com'
export const CV_URL = 'https://terry90918.github.io/cv/'

export interface ExperienceNote {
  id: 'gj' | 'nidin' | 'ai-work'
  title: string
  summary: string
  paragraphs: readonly string[]
  workHref: string
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
export const EXPERIENCE_NOTES: readonly ExperienceNote[] = [
  {
    id: 'gj',
    title: '共同創辦 GJ 的那段時間',
    summary: '從產品規劃、架構到全端實作，推出即時工作媒合服務。',
    paragraphs: [
      '2018 年，我共同創辦 GJ，負責產品規劃、系統架構與全端實作。這項即時工作媒合服務包含網站、手機端與雲端服務，並完成上線。',
      '團隊在台大創創中心，曾於 Meet Taipei 展示。這段經歷中，我的工作跨過產品規劃與實際交付。',
    ],
    workHref: '/work/gj',
  },
  {
    id: 'nidin',
    title: '在 Nidin，做系統，也帶團隊',
    summary: '在多品牌點餐平台，工作包含尖峰流量、產品交付與工程團隊。',
    paragraphs: [
      '2021 年到 2025 年，我在雲仲資訊擔任技術經理，負責 Nidin 多品牌點餐平台相關工作。工作包含尖峰流量設計、產品交付與工程團隊管理。',
      '促銷場景採分批發送與 API 控流。作品頁補充我的職責與系統做法，完整職涯可在 CV 查看。',
    ],
    workHref: '/work/nidin',
  },
  {
    id: 'ai-work',
    title: '從點餐平台到法律與旅遊 AI',
    summary: '近期與仁大法律及途銳資訊合作，把 AI 放進實際產品流程。',
    paragraphs: [
      '2025 年起，我與仁大法律合作 JurisLM，工作包含法律問答、合約審閱、書狀草擬的產品規劃、系統開發、資料處理與維運。',
      '同一時期的 Channel-T 合作，則處理旅行供應商 API 同步，以及把 PDF、圖片中的行程整理成可搜尋、可上架頁面的 AI 流程。',
    ],
    workHref: '/work/jurislm',
  },
]

export const WORK_CATEGORY_LABELS: Record<WorkCase['category'], string> = {
  product: '從規劃到上線的產品',
  platform: '持續運作的平台',
  ai: 'AI 工作流程',
}

export const WORK_CASES: readonly WorkCase[] = [
  {
    slug: 'gj',
    title: 'GJ',
    category: 'product',
    summary: '即時工作媒合服務，從產品規劃到網站、手機端與雲端服務上線。',
    period: '2018.02 — 2018.06',
    role: '共同創辦；產品規劃、系統架構與全端實作',
    evidence: [
      '負責產品規劃、架構與全端實作，完成網站、手機端與雲端服務。',
      '服務包含即時工作媒合，團隊在台大創創中心，曾於 Meet Taipei 展示。',
    ],
  },
  {
    slug: 'nidin',
    title: 'Nidin 你訂',
    category: 'platform',
    summary: '多品牌點餐平台的系統設計、產品交付與工程團隊管理。',
    period: '2021.05 — 2025.06',
    role: '雲仲資訊技術經理；直接管理 10 位工程師',
    evidence: [
      '促銷優惠券採排程分批發送，搭配 API 流量控管，避免發送作業影響訂單服務。',
      '任職期間主導 55 項產品交付；當時平台支援 820 萬會員與每年 1,500 萬筆以上訂單。',
      '直接管理 10 位工程師。',
    ],
  },
  {
    slug: 'jurislm',
    title: 'JurisLM',
    category: 'ai',
    summary: '與仁大法律合作，開發法律問答、合約審閱與書狀草擬工作流程。',
    period: '2025.06 — 2026.09',
    role: '產品規劃、系統開發、資料處理與維運',
    evidence: [
      '建立司法資料擷取與檢索流程，處理 2,135 萬筆司法資料。',
      '20 次抽樣測試的平均召回率為 0.957。這是該組樣本的檢索召回率，不是整體 AI 準確率。',
      '平台支援法律問答、合約審閱、書狀草擬，整合 22 項工具與 3 項資料資源。',
    ],
  },
]

export const SUPPORTING_WORK = [
  {
    title: 'VClass',
    category: 'product',
    summary: '核心負責從零建置並推出線上課程平台，包含課程預售、講師、付款與數位課程交付。',
  },
  {
    title: 'Channel-T',
    category: 'ai',
    summary:
      '旅行產品平台：供應商 API 同步，以及把 PDF、圖片中的行程整理成可搜尋、可上架頁面的 AI 流程。',
  },
] as const
