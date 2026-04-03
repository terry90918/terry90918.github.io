/**
 * 文章遷移腳本：將 mock 文章資料遷移到 Payload CMS
 *
 * 使用方式：
 *   DATABASE_URL=... PAYLOAD_SECRET=... npx tsx scripts/migrate-articles.ts
 *
 * 注意：需要先啟動 PostgreSQL 資料庫，並且已執行過 Payload migration
 */

import { getPayload } from 'payload'
import { JSDOM } from 'jsdom'
import {
  convertHTMLToLexical,
  sanitizeServerEditorConfig,
  defaultEditorConfig,
} from '@payloadcms/richtext-lexical'
import config from '../payload.config'

interface MockArticle {
  slug: string
  title: string
  html: string
  excerpt: string
  publishedAt: string
  tags: { slug: string; name: string }[]
}

// 從原始 mock-articles.ts 提取的文章資料
const articles: MockArticle[] = [
  {
    slug: 'divorce-property-division-guide',
    title: '離婚財產分配完整指南：剩餘財產差額請求權詳解',
    html: `<p>離婚不僅是感情的結束，更涉及複雜的財產分配問題。本文將詳細解析台灣法律中的「剩餘財產差額分配請求權」，協助您了解自身權益。</p><h2>什麼是法定財產制？</h2><p>在台灣，超過九成的夫妻採用「法定財產制」。這意味著除非雙方另有約定，婚姻關係中的財產將按照民法規定處理。</p><p>依據民法第1030條之1規定，法定財產制關係消滅時（包括離婚、配偶死亡等情形），夫妻各自取回其婚前財產，而婚後財產扣除債務後的剩餘部分，剩餘較少的一方可以向較多的一方請求差額的一半。</p><h2>哪些財產需要分配？</h2><p><strong>需要分配的婚後財產包括：</strong></p><ul><li>婚後工作所得</li><li>婚後投資獲利</li><li>婚後購置的不動產</li><li>婚後累積的存款</li></ul><p><strong>不列入分配的財產：</strong></p><ul><li>婚前已擁有的財產</li><li>因繼承取得的財產</li><li>因贈與取得的財產</li><li>慰撫金</li></ul><h2>請求權時效</h2><p>特別提醒，剩餘財產差額分配請求權有時效限制：</p><ul><li>自知有剩餘財產差額時起<strong>2年內</strong>需行使</li><li>自法定財產制關係消滅時起<strong>5年內</strong>為最長期限</li></ul><h2>如何保護自身權益</h2><p>若擔心對方惡意脫產，依法可在5年內追溯移轉出去的財產。建議在協議離婚前先釐清雙方財產狀況，必要時可聲請假扣押保全。</p><blockquote><p>「及早諮詢專業律師，才能在法律程序中充分保障您的權益。」</p></blockquote>`,
    excerpt:
      '離婚時如何計算財產分配？了解剩餘財產差額請求權的計算方式、時效限制與注意事項，保護您應有的權益。',
    publishedAt: '2026-01-15T10:00:00.000Z',
    tags: [
      { slug: 'family-law', name: '婚姻家事' },
      { slug: 'property', name: '財產分配' },
    ],
  },
  {
    slug: 'inheritance-disputes-resolution',
    title: '遺產繼承糾紛處理：當繼承人不配合時怎麼辦？',
    html: `<p>父母離世後，遺產繼承往往成為手足間紛爭的導火線。當部分繼承人不配合辦理遺產事宜時，該如何處理？本文提供實務建議。</p><h2>遺產繼承的法律基礎</h2><p>依據民法第1147條，繼承因被繼承人死亡而開始。繼承人當然承受被繼承人生前財產上的一切權利義務。</p><h3>繼承順位</h3><p>配偶是「當然繼承人」，血親繼承順序為：</p><ol><li>直系血親卑親屬（子女、孫子女）</li><li>父母</li><li>兄弟姊妹</li><li>祖父母</li></ol><h2>繼承人不配合的常見情形</h2><ul><li>拒絕參與遺產協議</li><li>失聯或出國無法連絡</li><li>對遺產分配有異議</li><li>堅持按照口頭約定而非法律規定</li></ul><h2>法律救濟途徑</h2><h3>1. 遺產稅申報</h3><p>即使有繼承人不配合，只要有<strong>一位繼承人</strong>願意申報，遺產稅申報程序仍可進行。逾期未申報將面臨罰款。</p><h3>2. 不動產繼承登記</h3><p>單獨一位繼承人可以申請「公同共有」繼承登記，無需全體同意。但若要分割不動產，則需全體繼承人協議或法院裁判。</p><h3>3. 訴請裁判分割</h3><p>當協議不成時，任一繼承人可向法院提起「遺產分割訴訟」，由法院依法裁判分配。</p><h2>實務建議</h2><ul><li>優先以協商方式解決，必要時請律師協助調解</li><li>保存所有溝通紀錄作為證據</li><li>遺產稅申報有期限，務必依法辦理</li><li>考慮家族和諧，適度讓步也是智慧</li></ul><blockquote><p>「遺產分割訴訟耗時費力，建議先尋求專業律師協助調解，往往能達成雙贏結果。」</p></blockquote>`,
    excerpt:
      '遺產繼承遇到不配合的繼承人？了解法律救濟途徑與實務處理方式，確保您的繼承權益不受影響。',
    publishedAt: '2026-01-08T10:00:00.000Z',
    tags: [
      { slug: 'inheritance', name: '遺產繼承' },
      { slug: 'dispute', name: '法律糾紛' },
    ],
  },
  {
    slug: 'house-leakage-legal-guide',
    title: '買到漏水屋怎麼辦？掌握黃金六個月求償時效',
    html: `<p>購屋是人生大事，但交屋後發現漏水問題，往往讓買方措手不及。本文說明買方的法律權利與求償時效。</p><h2>賣方的瑕疵擔保責任</h2><p>依民法第354條規定，賣方負有「物之瑕疵擔保責任」，這是<strong>無過失責任</strong>，不論賣方是否知道漏水問題，都需負責。</p><h3>賣方可免責的情形</h3><ul><li>買方簽約時已知漏水情形</li><li>買方因重大過失未發現明顯瑕疵</li></ul><p>但若賣方<strong>保證無漏水</strong>或<strong>故意隱瞞</strong>，即使買方有過失，賣方仍須負責。</p><h2>買方可主張的權利</h2><h3>1. 請求減少價金</h3><p>以修復漏水所需費用作為減價標準。例如修復費用20萬元，即可請求減價20萬元。</p><h3>2. 請求損害賠償</h3><p>漏水造成的其他財產損失（如地板、家具損壞）可一併求償。</p><h3>3. 解除契約</h3><p>若漏水嚴重到無法居住，才能主張解除契約。輕微漏水通常僅能請求減價。</p><h2>黃金六個月時效</h2><p>依民法第365條規定，買方須於<strong>發現瑕疵後六個月內</strong>行使權利。這六個月從通知賣方時起算，<strong>不因協商而中斷</strong>。</p><p><strong>建議步驟：</strong></p><ol><li>發現漏水立即拍照存證</li><li>立即寄發存證信函通知賣方</li><li>不要因協商而拖延，必要時提起訴訟</li><li>委請專業單位進行漏水鑑定</li></ol><h2>「依現況交屋」不是免死金牌</h2><p>司法實務認為，「依現況交屋」指的是外觀可見的瑕疵，漏水等隱藏瑕疵不在此限。賣方不能以此條款免除責任。</p><blockquote><p>「時效一過，權利即失。發現漏水請立即諮詢律師，把握黃金救濟期間。」</p></blockquote>`,
    excerpt:
      '交屋後發現房屋漏水，賣方需負瑕疵擔保責任。了解六個月求償時效與法律救濟方式，保障購屋權益。',
    publishedAt: '2025-12-20T10:00:00.000Z',
    tags: [
      { slug: 'real-estate', name: '房地糾紛' },
      { slug: 'consumer', name: '消費者權益' },
    ],
  },
  {
    slug: 'criminal-defense-rights',
    title: '被警察約談怎麼辦？認識您的刑事辯護權利',
    html: `<p>突然接到警察通知要約談，許多人會感到恐慌。了解自己的法律權利，才能在刑事程序中保護自己。</p><h2>被約談時的基本權利</h2><h3>1. 緘默權</h3><p>依刑事訴訟法第95條規定，您有權<strong>保持緘默</strong>，不必回答任何問題。這是憲法保障的權利，行使緘默權不會被認為是心虛。</p><h3>2. 律師在場權</h3><p>您有權要求<strong>律師在場陪同</strong>訊問。若無力聘請律師，可申請法律扶助。偵查階段的律師陪同尤其重要。</p><h3>3. 獲知罪名權</h3><p>警察或檢察官必須告知您被懷疑的<strong>犯罪事實</strong>及<strong>罪名</strong>，您有權知道自己為何被約談。</p><h2>警詢與偵訊的差異</h2><table><tr><th>項目</th><th>警詢（警察局）</th><th>偵訊（地檢署）</th></tr><tr><td>主持者</td><td>司法警察</td><td>檢察官</td></tr><tr><td>法律效力</td><td>較弱</td><td>較強</td></tr><tr><td>筆錄用途</td><td>偵查參考</td><td>起訴依據</td></tr></table><h2>實務建議</h2><h3>約談前</h3><ul><li>確認約談性質：是證人還是被告身分？</li><li>盡快聯絡律師，了解案情</li><li>整理相關事證與記憶</li></ul><h3>約談中</h3><ul><li>仔細聽清楚每個問題再回答</li><li>不確定的事情可以說「不記得」</li><li>筆錄簽名前務必詳閱內容</li><li>發現筆錄與陳述不符，堅持要求更正</li></ul><h3>約談後</h3><ul><li>索取筆錄影本</li><li>記錄約談過程</li><li>與律師討論後續策略</li></ul><blockquote><p>「刑事案件攸關人身自由，切勿輕忽任何一次約談。及早委任律師是保護自己的最佳方式。」</p></blockquote>`,
    excerpt:
      '被警察約談不要慌張，了解緘默權、律師在場權等基本權利，保護自己在刑事程序中的合法權益。',
    publishedAt: '2025-12-10T10:00:00.000Z',
    tags: [
      { slug: 'criminal-law', name: '刑事辯護' },
      { slug: 'rights', name: '法律權益' },
    ],
  },
  {
    slug: 'contract-review-tips',
    title: '簽約前必看：契約審閱的五大重點',
    html: `<p>「契約看過了嗎？」「有啊，大概看過。」這樣的對話常常發生，但草率簽約往往是糾紛的開始。本文分享契約審閱的重要觀念。</p><h2>為什麼需要契約審閱？</h2><p>契約是雙方權利義務的約定，一旦簽署就具有法律拘束力。預防勝於治療，簽約前的審閱遠比事後的訴訟來得重要。</p><h2>契約審閱五大重點</h2><h3>一、當事人資格與身分</h3><ul><li>確認對方是否有權簽約</li><li>公司代表人是否有授權</li><li>統一編號與公司登記是否正確</li></ul><h3>二、契約標的明確性</h3><ul><li>買賣標的規格、數量、品質</li><li>服務內容與範圍</li><li>履行期限與地點</li></ul><p>模糊的約定是日後爭議的根源。</p><h3>三、價金與付款條件</h3><ul><li>總價與單價是否清楚</li><li>付款時程與條件</li><li>是否含稅</li><li>額外費用由誰負擔</li></ul><h3>四、違約責任與救濟</h3><ul><li>違約的定義與認定</li><li>違約金是否過高或過低</li><li>解除或終止契約的條件</li><li>損害賠償的計算方式</li></ul><h3>五、爭議解決機制</h3><ul><li>管轄法院的約定</li><li>是否採用仲裁</li><li>準據法（跨國契約）</li></ul><h2>常見契約陷阱</h2><h3>「不得主張」條款</h3><p>放棄重要法律權利的條款，如「乙方不得以任何理由解除契約」，可能因顯失公平而無效。</p><h3>自動續約條款</h3><p>「未於期滿前30日通知終止，視為續約一年」，稍不注意就會被綁住。</p><h3>連帶保證條款</h3><p>簽署連帶保證意味著債權人可以直接向保證人求償，風險極高。</p><h2>審閱期間的法律保障</h2><p>消費者保護法規定，企業經營者使用定型化契約，應給予消費者<strong>30日以內</strong>的合理審閱期間。未給予審閱期間的條款，消費者可主張不構成契約內容。</p><blockquote><p>「花一小時審閱契約，可能省下一年的訴訟。專業的契約審閱，是最划算的法律投資。」</p></blockquote>`,
    excerpt: '簽約前的契約審閱至關重要。了解契約審閱五大重點與常見陷阱，避免日後產生糾紛。',
    publishedAt: '2025-11-25T10:00:00.000Z',
    tags: [
      { slug: 'contract', name: '契約審閱' },
      { slug: 'prevention', name: '法律預防' },
    ],
  },
]

async function migrate() {
  console.log('=== 開始文章遷移 ===\n')

  // 初始化 Payload
  const payload = await getPayload({ config })
  console.log('Payload 初始化完成\n')

  // 取得 editor config（用於 HTML → Lexical 轉換）
  const editorConfig = await sanitizeServerEditorConfig(defaultEditorConfig, payload.config, false)

  // 1. 建立標籤
  console.log('--- 建立標籤 ---')
  const allTags = new Map<string, string | number>()

  for (const article of articles) {
    for (const tag of article.tags) {
      if (allTags.has(tag.slug)) continue

      // 檢查是否已存在
      const { docs: existing } = await payload.find({
        collection: 'tags',
        where: { slug: { equals: tag.slug } },
        limit: 1,
      })

      if (existing.length > 0) {
        allTags.set(tag.slug, existing[0].id)
        console.log(`  標籤已存在: ${tag.name} (${tag.slug})`)
        continue
      }

      const created = await payload.create({
        collection: 'tags',
        data: {
          name: tag.name,
          slug: tag.slug,
        },
      })
      allTags.set(tag.slug, created.id)
      console.log(`  建立標籤: ${tag.name} (${tag.slug}) → ID: ${created.id}`)
    }
  }
  console.log(`\n共 ${allTags.size} 個標籤\n`)

  // 2. 建立文章
  console.log('--- 建立文章 ---')
  let created = 0
  let skipped = 0

  for (const article of articles) {
    // 檢查是否已存在
    const { docs: existing } = await payload.find({
      collection: 'articles',
      where: { slug: { equals: article.slug } },
      limit: 1,
    })

    if (existing.length > 0) {
      console.log(`  跳過已存在: ${article.title}`)
      skipped++
      continue
    }

    // 轉換 HTML → Lexical JSON
    const lexicalContent = convertHTMLToLexical({
      editorConfig,
      html: article.html,
      JSDOM,
    })

    // 取得標籤 ID
    const tagIds = article.tags
      .map((t) => allTags.get(t.slug))
      .filter((id): id is string | number => id !== undefined)

    await payload.create({
      collection: 'articles',
      data: {
        title: article.title,
        slug: article.slug,
        content: lexicalContent,
        excerpt: article.excerpt,
        tags: tagIds,
        status: 'published',
        publishedAt: article.publishedAt,
      },
    })

    console.log(`  建立文章: ${article.title}`)
    created++
  }

  console.log(`\n=== 遷移完成 ===`)
  console.log(`建立: ${created} 篇, 跳過: ${skipped} 篇`)

  process.exit(0)
}

migrate().catch((err) => {
  console.error('遷移失敗:', err)
  process.exit(1)
})
