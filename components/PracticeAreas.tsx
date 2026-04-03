import { PracticeAreaCard } from './PracticeAreaCard'

const practiceAreas = [
  {
    title: '民事訴訟',
    subtitle: '維護您的合法權益。',
    description:
      '處理各類民事糾紛，包含債務清償、損害賠償、侵權行為等案件，以專業法律知識為您爭取最佳結果。',
  },
  {
    title: '刑事辯護',
    subtitle: '在法律程序中捍衛您的權利。',
    description: '提供刑事案件辯護與告訴代理，從偵查階段到審判程序，全程陪伴您面對司法挑戰。',
  },
  {
    title: '婚姻家事',
    subtitle: '以同理心陪伴人生轉折。',
    description:
      '專精離婚協議、調解與訴訟，處理夫妻財產分配、贍養費等議題，以細膩方式守護您的權益。',
  },
  {
    title: '遺產繼承',
    subtitle: '妥善規劃世代傳承。',
    description: '協助遺產規劃、遺囑撰擬、繼承登記及遺產分割，確保您的心意能完整傳達給摯愛的家人。',
  },
  {
    title: '房地糾紛',
    subtitle: '守護安居樂業的根基。',
    description:
      '處理土地糾紛、房屋買賣爭議、租賃問題及產權確認，從預防到訴訟全方位保障您的不動產權益。',
  },
  {
    title: '契約審閱',
    subtitle: '預防勝於治療的法律防線。',
    description: '提供各類契約的審閱、修改與撰擬服務，協助您在交易前釐清權利義務，降低法律風險。',
  },
  {
    title: '法人顧問',
    subtitle: '企業經營的法律後盾。',
    description: '為企業提供常年法律顧問服務，涵蓋公司治理、勞資關係、商業談判等，助您穩健經營。',
  },
]

export function PracticeAreas() {
  return (
    <section id="practice-areas" className="relative px-8 py-32 md:px-16 lg:px-24">
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="via-accent/10 absolute top-0 left-1/4 h-full w-px bg-gradient-to-b from-transparent to-transparent" />
        <div className="via-primary/10 absolute top-0 right-1/4 h-full w-px bg-gradient-to-b from-transparent to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            {/* Section label */}
            <div className="mb-6 flex items-center gap-4">
              <span className="text-accent text-xs font-medium tracking-[0.3em] uppercase">02</span>
              <div className="bg-accent h-px w-16" />
              <span className="text-text-dark/50 dark:text-text-light/50 text-xs tracking-[0.2em] uppercase">
                執業領域
              </span>
            </div>

            <h2 className="text-text-dark text-5xl font-light md:text-6xl dark:text-white">
              專業<span className="text-accent italic">服務</span>
            </h2>
          </div>

          <p className="text-text-dark dark:text-text-light font-body max-w-md text-base leading-relaxed opacity-80">
            多年深耕各項法律領域，以專業知識與同理心，為每位委託人提供量身訂製的法律解決方案。
          </p>
        </div>

        {/* Practice Area Cards */}
        <div>
          {practiceAreas.map((area, index) => (
            <PracticeAreaCard
              key={area.title}
              title={area.title}
              subtitle={area.subtitle}
              description={area.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
