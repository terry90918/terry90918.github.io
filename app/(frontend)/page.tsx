import dynamic from 'next/dynamic'
import { Navigation } from '@/components/Navigation'
import { Hero } from '@/components/Hero'
import { ArticlesSection } from '@/components/ArticlesSection'
import { FloatingCTA } from '@/components/FloatingCTA'

// 延遲載入首屏下方的元件，提升初始載入效能
const About = dynamic(() => import('@/components/About').then((mod) => ({ default: mod.About })), {
  loading: () => <div className="min-h-[400px]" />,
})
const PracticeAreas = dynamic(
  () => import('@/components/PracticeAreas').then((mod) => ({ default: mod.PracticeAreas })),
  {
    loading: () => <div className="min-h-[600px]" />,
  }
)
const Testimonial = dynamic(
  () => import('@/components/Testimonial').then((mod) => ({ default: mod.Testimonial })),
  {
    loading: () => <div className="min-h-[300px]" />,
  }
)
const Contact = dynamic(
  () => import('@/components/Contact').then((mod) => ({ default: mod.Contact })),
  {
    loading: () => <div className="min-h-[500px]" />,
  }
)
const Footer = dynamic(
  () => import('@/components/Footer').then((mod) => ({ default: mod.Footer })),
  {
    loading: () => <div className="min-h-[200px]" />,
  }
)

// 靜態生成 - 每小時重新驗證一次
export const revalidate = 3600

export default function Home() {
  return (
    <>
      <Navigation />
      <Hero />
      <main className="bg-background-light dark:bg-background-dark paper-texture relative">
        <About />

        {/* 裝飾性分隔線 */}
        <div className="relative h-32 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="via-accent/30 h-full w-px bg-gradient-to-b from-transparent to-transparent" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="border-accent/50 bg-background-light dark:bg-background-dark h-3 w-3 rotate-45 border" />
          </div>
        </div>

        <PracticeAreas />
        <ArticlesSection />
        <Testimonial />
        <Contact />
      </main>
      <Footer />
      <FloatingCTA />
    </>
  )
}
