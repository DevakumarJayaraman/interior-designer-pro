export default function InlineError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200 px-4 py-3 text-sm">
      {message}
    </div>
  )
}
