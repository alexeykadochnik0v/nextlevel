import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Search, Plus, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Avatar from './ui/Avatar'

export default function MobileBottomNav() {
    const location = useLocation()
    const { user } = useAuth()
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    // Скрытие/показ при скролле
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            if (currentScrollY < 10) {
                // Всегда показываем в самом верху
                setIsVisible(true)
            } else if (currentScrollY > lastScrollY) {
                // Скролл вниз - скрываем
                setIsVisible(false)
            } else {
                // Скролл вверх - показываем
                setIsVisible(true)
            }

            setLastScrollY(currentScrollY)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScrollY])

    const navItems = [
        {
            id: 'home',
            label: 'Главная',
            icon: Home,
            path: '/'
        },
        {
            id: 'search',
            label: 'Поиск',
            icon: Search,
            path: '/search'
        },
        {
            id: 'create',
            label: 'Создать',
            icon: Plus,
            path: '/create'
        },
        {
            id: 'profile',
            label: 'Профиль',
            icon: User,
            path: user ? `/profile/${user.uid}` : '/login'
        }
    ]

    return (
        <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'
            }`}>
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path ||
                        (item.id === 'profile' && location.pathname.startsWith('/profile/'))

                    return (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${isActive
                                ? 'text-indigo-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {item.id === 'profile' && user ? (
                                <Avatar
                                    src={user.photoURL}
                                    alt={user.displayName}
                                    size="sm"
                                    className={`mb-1 ${isActive ? 'ring-2 ring-indigo-600' : ''}`}
                                />
                            ) : (
                                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-indigo-600' : ''}`} />
                            )}
                            <span className={`text-xs font-medium ${isActive ? 'text-indigo-600' : ''}`}>
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}

