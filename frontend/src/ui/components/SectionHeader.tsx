export default function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <div className="text-xl font-semibold">{title}</div>
      {subtitle && <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</div>}
    </div>
  )
}
