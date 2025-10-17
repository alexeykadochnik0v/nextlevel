import { cn } from '../../lib/utils'

export default function Card({ children, className, ...props }) {
    return (
        <div
            className={cn(
                'bg-white rounded-xl shadow-md p-6',
                'transition-shadow duration-200',
                'hover:shadow-lg',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

