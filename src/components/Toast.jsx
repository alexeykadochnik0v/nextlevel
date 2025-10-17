import { useEffect } from 'react'
import { Check } from 'lucide-react'

export default function Toast({ message, show, onClose }) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose()
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [show, onClose])

    if (!show) return null

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-3">
                <Check className="w-5 h-5" />
                <span>{message}</span>
            </div>
        </div>
    )
}

