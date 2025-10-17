import { cn } from '../../lib/utils'

export default function Avatar({ src, alt, size = 'md', className }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
        xl: 'w-24 h-24'
    }

    return (
        <div
            className={cn(
                'rounded-full bg-gradient-to-br from-indigo-500 to-purple-600',
                'flex items-center justify-center text-white font-semibold',
                'overflow-hidden',
                sizes[size],
                className
            )}
        >
            {src ? (
                <img src={src} alt={alt} className="w-full h-full object-cover" />
            ) : (
                <span className="text-sm uppercase">
                    {alt?.charAt(0) || '?'}
                </span>
            )}
        </div>
    )
}

