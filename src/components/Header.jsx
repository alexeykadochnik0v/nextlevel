import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Avatar from './ui/Avatar'
import Button from './ui/Button'
import NotificationDropdown from './NotificationDropdown'

export default function Header() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const menuRef = useRef(null)

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

    // Закрываем меню при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    return (
        <header className={`bg-white shadow-sm sticky top-0 z-50 hidden md:block transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src="/images/logo.svg" alt="NextLevel" className="w-8 h-8" />
                        <span className="text-xl font-bold text-gray-900 hidden sm:inline">NextLevel</span>
                    </Link>

                    {/* Десктоп поиск */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск сообществ, публикаций..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </form>

                    {/* Мобильный поиск - иконка */}
                    <button
                        onClick={() => navigate('/search')}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Поиск"
                    >
                        <Search className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        <Link to="/create">
                            <Button variant="ghost" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Создать
                            </Button>
                        </Link>

                        {user && <NotificationDropdown />}

                        {user ? (
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-1 transition-colors"
                                >
                                    <Avatar src={user.photoURL} alt={user.displayName} size="sm" />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                        <Link
                                            to={`/profile/${user.uid}`}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            Мой профиль
                                        </Link>
                                        <Link
                                            to="/verification"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            Верификация
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link
                                                to="/admin"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-200"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                🛡️ Админ панель
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login">
                                <Button size="sm">
                                    <User className="w-4 h-4 mr-1" />
                                    Войти
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

