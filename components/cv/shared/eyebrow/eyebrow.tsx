import { cn } from '@/lib/cv/utils'
type EyebrowProps = {
  children: string
  className?: string
}
const Eyebrow = ({ children, className }: EyebrowProps) => {
  return (
    <p
      className={cn('text-accent-ink text-[22px] font-medium italic', className)}
    >{`// ${children}`}</p>
  )
}
export default Eyebrow
