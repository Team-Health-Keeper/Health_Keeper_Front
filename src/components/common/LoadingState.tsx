import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = "불러오는 중...", className = "" }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center gap-2 text-gray-600 ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin" />
      <span>{message}</span>
    </div>
  )
}
