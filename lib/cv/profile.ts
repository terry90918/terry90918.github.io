import { assetPath, basePath } from './site'
export const locales = ['zh-TW', 'en'] as const
export type Locale = (typeof locales)[number]
export const isLocale = (value: string): value is Locale =>
  locales.some((locale) => locale === value)
export const projectSlugs = [
  'jurislm',
  'nidin',
  'vclass',
  'gj',
  'channel-t',
  'backlight-memory',
] as const
export const contact = {
  email: 'zxtw17985321@gmail.com',
  phone: '+886 931206500',
  phoneHref: 'tel:+886931206500',
  github: 'https://github.com/terry90918',
  linkedin: 'https://www.linkedin.com/in/%E5%A4%A9%E4%B8%80-%E9%99%B3-98812812a/',
  photo: assetPath('/images/profile/tien-yi-chen.webp'),
}
export const profiles = {
  'zh-TW': {
    name: '陳天一',
    role: '應用 AI 工程',
    greeting: '你好，我是',
    location: '台灣・新竹縣竹北市',
    description:
      '將複雜需求整理成可執行的產品與系統。從法律 AI、餐飲點餐到教育平台，參與產品規劃、全端開發、資料流程與團隊交付。',
    about: [
      '我喜歡釐清複雜需求，建立容易使用的網站，以及團隊能理解、維護的系統架構。',
      '好的產品除了完成上線，也需要讓人願意持續使用，讓團隊能有信心地持續改善。從寫程式到帶領團隊，我最在意的是和不同的人找到問題的核心，再用合適的技術解決。',
    ],
    labels: {
      about: '關於我',
      work: '代表專案',
      experience: '工作經歷',
      skills: '專業能力',
      contact: '聯絡我',
      contactDetails: '完整聯絡方式',
      theme: '切換深淺色',
      language: '切換語言',
      viewExperience: '查看經歷',
      aboutTitle: '把需求變成可以使用的產品',
      workTitle: '從問題到交付的實際經驗',
      experienceTitle: '一路累積的產品與工程經驗',
      skillsTitle: '我帶進團隊的能力',
      education: '學歷',
      military: '兵役',
      contactTitle: '從一個值得解決的問題開始',
      contactDescription: '歡迎透過 Email 或 LinkedIn 聯繫，聊聊產品、工程與合作的可能。',
      backHome: '返回首頁',
      otherWork: '其他專案',
      otherWorkTitle: '繼續了解我的工作',
      organisation: '組織',
      responsibility: '負責範圍',
      period: '專案期間',
      tools: '領域與技術',
      readCase: '閱讀案例',
      contents: '文章目錄',
      thanks: '謝謝你的來訪',
      notFound: '找不到這個頁面',
      notFoundDescription: '這個網址目前沒有對應的內容。',
      email: '電子郵件',
      phone: '電話',
      location: '所在地',
    },
    stats: [
      {
        value: '21.35M',
        label: '司法資料流程容量',
      },
      {
        value: '0.957',
        label: '20 次抽樣測試平均召回率',
      },
      {
        value: '8.2M',
        label: 'Nidin 平台會員',
      },
      {
        value: '10',
        label: '直接管理的工程團隊人數',
      },
    ],
    skills: [
      {
        title: '應用 AI 與資料流程',
        description:
          '以法律問答、合約審閱與旅遊商品建檔等需求為起點，整合資料擷取、混合檢索、工具與認證。',
        tags: ['混合搜尋', 'MCP', 'PDF 與圖片處理'],
      },
      {
        title: '平台架構與系統整合',
        description: '整合會員、訂單、行銷與付款流程；設計尖峰流量控管、排程佇列及多品牌產品模組。',
        tags: ['API 整合', 'LINE Mini App', 'POS 與支付'],
      },
      {
        title: '產品開發與交付',
        description: '從需求拆解、架構規劃到網站與行動端交付，讓產品能從構想到實際上線並持續迭代。',
        tags: ['全端開發', '跨端流程', '電商與教育'],
      },
      {
        title: '工程團隊與品質',
        description:
          '帶領工程團隊，建立文件與敏捷協作流程，參與招募、績效考核、無障礙規範與資安工作。',
        tags: ['團隊管理', '敏捷開發', '資安與無障礙'],
      },
    ],
    experiences: [
      {
        company: '獨立合作案',
        role: '自由工作者',
        period: '2025.06–2026.09',
        kind: '合作案',
        team: '',
        bullets: [],
        projects: [
          {
            name: 'JurisLM／仁大法律',
            period: '2025.06.05–2026.09.18',
            bullets: [
              '規劃並建置 JurisLM 台灣法律 AI 平台，提供法律問答、合約審閱與書狀草擬等服務，負責產品規劃、系統開發、資料處理與維運。',
              '建立可處理 2,135 萬筆司法資料的擷取與檢索流程；以混合搜尋改善查詢品質，20 次抽樣測試的平均召回率達 0.957。',
              '設計 22 項工具、3 項資料資源及多層認證機制，確保不同使用者的資料隔離。',
            ],
          },
          {
            name: '逆光記憶／藍穎餐飲',
            period: '2026.04–2026.08',
            bullets: [
              '獨立建置品牌直營電商，整合產品內容、會員、線上訂購及營運後台，協助甜點品牌建立自有數位銷售通路。',
            ],
          },
          {
            name: 'Channel-T／途銳資訊',
            period: '2025.06–2025.10',
            bullets: [
              '建立 Channel-T 旅遊產品平台，透過 API 串接多家旅行社系統，自動同步行程、價格與出團資訊，減少重複建檔。',
              '建立 AI 商品建檔流程，將 PDF 與圖片轉為可搜尋、可發布的行程頁，並提供品牌官網與行程推薦；平台後續公開成果顯示，行程頁建置約 30 秒、行政效率提升逾 80%。',
            ],
          },
        ],
      },
      {
        company: '雲仲資訊／Howsense',
        role: '技術經理',
        period: '2021.05–2025.06',
        kind: '全職',
        team: '直接管理 10 人',
        projects: [],
        bullets: [
          '主導 Nidin 多品牌點餐平台的尖峰流量設計，以排程佇列分批發送活動優惠券，搭配 API 流量控管，避免發券作業影響訂單服務；平台支撐 820 萬會員與每年 1,500 萬筆以上訂單。',
          '建立可依品牌需求設定的產品模組，主導 55 項交付，服務 400 多個餐飲品牌、萬間門市及大型連鎖品牌的海外據點。',
          '主導 BDMS、ECMS、CRM 等內部系統與點餐產品的架構規劃及開發，整合網站、LINE、iOS 與 Android 的訂單、會員及行銷流程。',
          '通過 LINE 技術資格考試與審核，推動公司取得指定技術合作夥伴資格，並帶領團隊推出 LINE Mini App；串接涵蓋逾六成 POS 市場的業者及支付、物流服務。',
          '建立以會員資料為基礎的客戶管理與行銷功能；平台服務品牌的平均回購率達 50% 以上、業績提升 30% 以上。平台支援的 2025 珍奶節觸及逾 100 萬使用者、售出 200 萬杯，參與品牌訂單金額成長 60～100%。',
          '作為資安團隊成員，參與推動 Nidin 通過 ISO／IEC 27001:2022 認證。',
          '直接管理 10 人工程團隊，導入 Slack、Notion 與敏捷開發流程，集中管理產品文件與技術知識，年均參與約 100 場面試。',
        ],
      },
      {
        company: '昕力資訊／TPIsoftware',
        role: '主任工程師',
        period: '2020.02–2021.04',
        kind: '全職',
        team: '管理 20 人',
        projects: [],
        bullets: [
          '主導國家發展委員會檔案管理局「機關檔案管理資訊系統」整合建置與功能增修，帶領 20 人團隊完成新台幣 1,800 萬元專案。',
          '建置可搜尋上億筆檔案目錄的全文檢索服務，並串接民眾線上申請與繳費流程。',
          '串接民眾端 MyEGOV 會員登入，規劃機關後台帳號與角色權限，支援各機關自訂存取範圍及敏感檔案管理。',
          '建立大型檔案分段傳輸與近百張客製化報表的共用架構，支援後續功能擴充。',
          '制定開發與無障礙規範，負責需求拆解、架構決策、團隊分工、績效考核與招募。',
        ],
      },
      {
        company: '紅點子科技／VoiceTube',
        role: '資深軟體工程師',
        period: '2019.05–2020.02',
        kind: '全職',
        team: '',
        projects: [],
        bullets: [
          '核心負責 VClass 從零建置至上線，整合課程預售、講師合作、付款與數位學習交付，讓講師能先驗證需求再推出課程。',
          '所參與建置的平台上線後一年發展逾 10 種學習主題、吸引近 3 萬人購課；後續單一公開課於五天內吸引近 5,000 人報名。',
          '負責 VoiceTube Hero Web 維護與擴建，支撐約 3.5 萬名付費用戶的學習服務，並優化網站效能、搜尋能見度與後續開發效率。',
        ],
      },
      {
        company: '歐克斯科技／Ubee',
        role: '資深軟體工程師',
        period: '2018.06–2019.05',
        kind: '全職',
        team: '',
        projects: [],
        bullets: [
          '參與 Ubee 房屋比價平台開發，整合房仲網站與政府公開資料，讓使用者搜尋及比較數十萬筆待售物件。',
          '參與設計並實作 Ubee 地圖找房功能，整合 Leaflet 與 Google Maps 的混合地圖架構，支援大量物件呈現、跨來源比價與區域行情查詢；優化跨裝置操作與顯示效能，並降低第三方地圖服務成本。',
          '參與建置匿名諮詢與經紀人媒合流程，協助使用者從物件比較進入專業服務。',
        ],
      },
      {
        company: '幹得好科技／GJ',
        role: '軟體工程師・共同創辦人',
        period: '2018.02–2018.06',
        kind: '全職',
        team: '',
        projects: [],
        bullets: [
          '共同創辦幹得好科技，獨立負責「GJ 即時上工」的產品規劃、技術架構與全端開發，完成網站、行動端及雲端服務上線；團隊進駐台大創創中心，產品於 Meet Taipei 展出。',
          '建置連結中小企業與短期工作者的即時媒合服務，提供職缺搜尋、薪資與工作條件公開及智慧推播；同步上線出勤管理、薪資計算與雙向評價，涵蓋招募到工作結算流程。',
        ],
      },
      {
        company: '聖恩全生涯',
        role: '軟體工程師',
        period: '2014.10–2017.11',
        kind: '全職',
        team: '',
        projects: [],
        bullets: [
          '參與「聖恩生活護照」網路商城建置，整合商品、會員權益、回饋金、訂單及配送流程，支援既有實體服務據點的線上交易。',
          '參與聖恩 App 建置，提供購物、優惠、組織與獎金查詢及配送通知，讓會員透過手機使用核心服務。',
          '更新既有電商系統與響應式網站，改善跨裝置操作、效能及維護；導入版本控制與團隊協作流程。',
        ],
      },
    ],
    education: {
      school: '大葉大學',
      field: '材料科學與工程學系',
      period: '2008.06–2012.06',
    },
    military: '2012.09.05–2013.08.06',
  },
  en: {
    name: 'Tien Yi Chen',
    role: 'Applied AI Engineering',
    greeting: 'Hello, I’m',
    location: 'Zhubei, Hsinchu County, Taiwan',
    description:
      'I turn complex requirements into products and systems people can use and teams can maintain. My work spans applied AI, commerce, learning platforms, and engineering leadership.',
    about: [
      'I enjoy bringing clarity to complex requirements, building websites that feel easy to use, and designing architectures that teams can understand and maintain.',
      'A good product should be something people want to use and something the team can keep improving with confidence. From writing code to leading teams, I enjoy working with different people to find the heart of a problem and solve it with the right technology.',
    ],
    labels: {
      about: 'About',
      work: 'Selected work',
      experience: 'Experience',
      skills: 'Capabilities',
      contact: 'Contact me',
      contactDetails: 'Contact details',
      theme: 'Toggle theme',
      language: 'Switch language',
      viewExperience: 'View experience',
      aboutTitle: 'Turning requirements into useful products',
      workTitle: 'Real problems. Real delivery.',
      experienceTitle: 'The products and teams along the way',
      skillsTitle: 'What I bring to a team',
      education: 'Education',
      military: 'Military service',
      contactTitle: 'Start with a problem worth solving',
      contactDescription:
        'Reach out by email or LinkedIn to discuss products, engineering, or collaboration.',
      backHome: 'Back to home',
      otherWork: 'Other projects',
      otherWorkTitle: 'Explore more of my work',
      organisation: 'Organisation',
      responsibility: 'Responsibility',
      period: 'Project period',
      tools: 'Domains & technologies',
      readCase: 'Read case study',
      contents: 'Contents',
      thanks: 'Thank you for visiting',
      notFound: 'Page not found',
      notFoundDescription: 'There is no content at this address.',
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
    },
    stats: [
      {
        value: '21.35M',
        label: 'Judicial records pipeline capacity',
      },
      {
        value: '0.957',
        label: 'Average recall across 20 sampled tests',
      },
      {
        value: '8.2M',
        label: 'Nidin platform members',
      },
      {
        value: '10',
        label: 'Engineers directly managed',
      },
    ],
    skills: [
      {
        title: 'Applied AI & data workflows',
        description:
          'Start with practical needs such as legal assistance and travel product creation, then connect ingestion, hybrid retrieval, tools, and authentication.',
        tags: ['Hybrid search', 'MCP', 'PDF & image processing'],
      },
      {
        title: 'Platform architecture & integration',
        description:
          'Connect memberships, orders, marketing, and payments with peak traffic controls, scheduled queues, and configurable multi-brand modules.',
        tags: ['API integration', 'LINE Mini App', 'POS & payments'],
      },
      {
        title: 'Product development & delivery',
        description:
          'Take requirements through architecture and delivery across web and mobile, from an initial idea to launch and continued iteration.',
        tags: ['Full-stack development', 'Cross-platform workflows', 'Commerce & learning'],
      },
      {
        title: 'Engineering leadership & quality',
        description:
          'Lead engineering teams, establish documentation and agile collaboration, and contribute to recruiting, performance reviews, accessibility, and security.',
        tags: ['Team leadership', 'Agile delivery', 'Security & accessibility'],
      },
    ],
    experiences: [
      {
        company: 'Independent projects',
        role: 'Freelancer',
        period: '2025.06–2026.09',
        kind: 'Contract projects',
        team: '',
        bullets: [],
        projects: [
          {
            name: 'JurisLM / 仁大法律',
            period: '2025.06.05–2026.09.18',
            bullets: [
              'Planned and built JurisLM, a Taiwanese legal AI platform for legal questions, contract review, and legal document drafting. Owned product planning, development, data processing, and operations.',
              'Built ingestion and retrieval workflows capable of handling 21.35 million judicial records. Hybrid search achieved an average recall of 0.957 across 20 sampled tests.',
              'Designed 22 tools, 3 data resources, and multiple authentication layers to isolate data between users.',
            ],
          },
          {
            name: '逆光記憶 / 藍穎餐飲',
            period: '2026.04–2026.08',
            bullets: [
              'Independently built a direct-to-consumer commerce platform for a dessert brand, connecting product content, memberships, online ordering, and an operations dashboard.',
            ],
          },
          {
            name: 'Channel-T / 途銳資訊',
            period: '2025.06–2025.10',
            bullets: [
              'Built a travel product platform that integrates multiple travel agencies through APIs and automatically synchronises itineraries, prices, and departure information.',
              'Built an AI product creation workflow that converts PDFs and images into searchable, publishable itinerary pages, alongside branded websites and recommendations. Later public platform results reported about 30 seconds per itinerary page and over 80% improvement in administrative efficiency.',
            ],
          },
        ],
      },
      {
        company: '雲仲資訊 / Howsense',
        role: 'Technical Manager',
        period: '2021.05–2025.06',
        kind: 'Full-time',
        team: '10 direct reports',
        bullets: [
          'Led peak traffic architecture for Nidin, a multi-brand ordering platform. Batched promotional coupons through scheduled queues and API traffic controls to protect order services. The platform supported 8.2 million members and over 15 million orders annually.',
          'Built configurable product modules and led 55 deliveries, serving over 400 food and beverage brands, 10,000 stores, and overseas locations of major chains.',
          'Led architecture and development for BDMS, ECMS, CRM, and ordering products, connecting orders, memberships, and marketing across web, LINE, iOS, and Android.',
          'Passed LINE technical qualification exams and review, helped the company obtain designated technical partner status, and led the launch of a LINE Mini App. Integrated POS providers covering over 60% of the market, plus payment and logistics services.',
          'Built membership-based CRM and marketing features. Brands served by the platform averaged over 50% repeat purchase rates and over 30% sales growth. The 2025 bubble tea festival supported by the platform reached over 1 million users, sold 2 million cups, and increased participating brands’ order value by 60–100%.',
          'Contributed as a security team member to Nidin’s ISO/IEC 27001:2022 certification.',
          'Directly managed 10 engineers, introduced Slack, Notion, and agile workflows, centralised product documentation and technical knowledge, and participated in about 100 interviews annually.',
        ],
        projects: [],
      },
      {
        company: '昕力資訊 / TPIsoftware',
        role: 'Principal Engineer',
        period: '2020.02–2021.04',
        kind: 'Full-time',
        team: 'Managed 20 engineers',
        bullets: [
          'Led integration and enhancement of the Archives Management Information System for the National Archives Administration, National Development Council. Led a 20-person team to deliver an NT$18 million project.',
          'Built full-text search across over 100 million archival catalogue records and integrated public online applications and payments.',
          'Integrated MyEGOV sign-in for public users and designed back-office accounts and role permissions, supporting agency-specific access scopes and sensitive archive management.',
          'Created a shared architecture for chunked large-file transfers and nearly 100 customised reports to support future enhancements.',
          'Established development and accessibility standards and owned requirements breakdown, architecture decisions, team allocation, performance reviews, and recruitment.',
        ],
        projects: [],
      },
      {
        company: '紅點子科技 / VoiceTube',
        role: 'Senior Software Engineer',
        period: '2019.05–2020.02',
        kind: 'Full-time',
        team: '',
        bullets: [
          'Took a core role in building VClass from zero to launch, integrating course presales, instructor collaboration, payments, and digital learning delivery so instructors could validate demand before launching courses.',
          'Within a year of launch, the platform I helped build grew to over 10 learning topics and nearly 30,000 course buyers. A later public course attracted nearly 5,000 registrations in five days.',
          'Maintained and expanded VoiceTube Hero Web for approximately 35,000 paying users, improving performance, search visibility, and development efficiency.',
        ],
        projects: [],
      },
      {
        company: '歐克斯科技 / Ubee',
        role: 'Senior Software Engineer',
        period: '2018.06–2019.05',
        kind: 'Full-time',
        team: '',
        bullets: [
          'Contributed to Ubee, a housing price comparison platform combining real estate websites and government open data to search and compare hundreds of thousands of listings.',
          'Helped design and implement map-based property search using a hybrid Leaflet and Google Maps architecture. Supported large listing volumes, cross-source comparisons, and regional market queries while improving cross-device performance and reducing third-party map costs.',
          'Helped build anonymous consultation and agent matching workflows connecting property comparison with professional services.',
        ],
        projects: [],
      },
      {
        company: '幹得好科技 / GJ',
        role: 'Software Engineer & Co-founder',
        period: '2018.02–2018.06',
        kind: 'Full-time',
        team: '',
        bullets: [
          'Co-founded 幹得好科技 and independently owned product planning, architecture, and full-stack development for GJ Instant Work, launching web, mobile, and cloud services. The team joined the NTU Entrepreneurship Center and exhibited at Meet Taipei.',
          'Built real-time matching for small businesses and short-term workers, including job search, transparent pay and working conditions, smart notifications, attendance, payroll, and two-way reviews.',
        ],
        projects: [],
      },
      {
        company: '聖恩全生涯',
        role: 'Software Engineer',
        period: '2014.10–2017.11',
        kind: 'Full-time',
        team: '',
        bullets: [
          'Helped build the 聖恩生活護照 online store, connecting products, member benefits, cashback, orders, and delivery to support existing physical service locations.',
          'Helped build the mobile app for shopping, promotions, organisation and bonus queries, and delivery notifications.',
          'Modernised existing commerce systems and responsive websites, improving cross-device usability, performance, and maintenance while introducing version control and team collaboration.',
        ],
        projects: [],
      },
    ],
    education: {
      school: 'Da-Yeh University',
      field: 'Materials Science and Engineering',
      period: '2008.06–2012.06',
    },
    military: '2012.09.05–2013.08.06',
  },
}
export type Profile = typeof profiles.en
export function localeHref(pathname: string, locale: Locale, hash = ''): string {
  const path =
    pathname === basePath
      ? '/'
      : pathname.startsWith(`${basePath}/`)
        ? pathname.slice(basePath.length)
        : pathname
  const localizedPath = path === '/' || path === '' ? '/zh-TW' : path
  const chapters = [
    ['背景與需求', 'context-requirements'],
    ['我的角色', 'my-role'],
    ['實作與交付', 'implementation-delivery'],
    ['成果', 'outcomes'],
  ]
  const fragment = hash.replace(/^#/, '')
  const chapter = chapters.find((pair) =>
    pair.some((value) => value === fragment || encodeURIComponent(value) === fragment)
  )
  const anchor = chapter ? chapter[locale === 'en' ? 1 : 0] : fragment
  return (
    localizedPath.replace(/^\/(zh-TW|en)(?=\/|$)/, `/cv/${locale}`) + (anchor ? `#${anchor}` : '')
  )
}
