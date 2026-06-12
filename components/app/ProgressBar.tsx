export function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className="j-prog">
      <span style={{ width: `${clamped}%` }} />
    </div>
  )
}
