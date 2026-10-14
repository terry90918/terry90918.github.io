import { cn } from '@/lib/cv/utils'
type EyebrowProps = {
  children: string
  className?: string
}
const Eyebrow = ({ children, className }: EyebrowProps) => {
  return (
    <p
      className={cn('text-accent-ink text-sm font-medium tracking-wide', className)}
    >{`// ${children}`}</p>
  )
}
export default Eyebrow
