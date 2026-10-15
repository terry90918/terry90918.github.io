export type TimelineEntry = {
  index: string
  content: React.ReactNode
}

export default function Timeline({ data }: { data: TimelineEntry[] }) {
  return (
    <div className="cv-experience-timeline">
      {data.map((item) => (
        <div key={item.index} className="cv-experience-row">
          <div className="cv-experience-index">{item.index}</div>
          <div className="min-w-0">{item.content}</div>
        </div>
      ))}
    </div>
  )
}
