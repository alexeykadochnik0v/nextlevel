import { cn } from '../../lib/utils'

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    disabled,
    ...props
}) {
    const variants = {
        primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
        secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
        outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        ghost: 'hover:bg-gray-100 text-gray-700'
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
    }

    return (
        <button
            className={cn(
                'rounded-lg font-medium transition-all duration-200',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
}

