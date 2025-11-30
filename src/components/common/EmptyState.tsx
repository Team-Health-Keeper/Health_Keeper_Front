interface EmptyStateProps {
  message: string
  className?: string
}

export function EmptyState({ message, className = "" }: EmptyStateProps) {
  return (
    <div className={`rounded-2xl border-2 border-dashed border-gray-300 p-10 text-center text-sm text-gray-600 ${className}`}>
      {message}
    </div>
  )
}
