import { cn } from '../lib/utils'

export default function ProgressBar({ value, max = 100, className }) {
    const percentage = (value / max) * 100

    return (
        <div className={cn('w-full bg-gray-200 rounded-full h-2', className)}>
            <div
                className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
            />
        </div>
    )
}

