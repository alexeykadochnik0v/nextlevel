import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Plus, User, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useLocation } from 'react-router-dom'
import Avatar from './ui/Avatar'

export default function MobileHeader() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showMenu, setShowMenu] = useState(false)
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
                setShowMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])


    const getPageTitle = () => {
        const path = location.pathname
        if (path === '/') return 'NextLevel'
        if (path === '/search') return 'Поиск'
        if (path === '/create') return 'Создать'
        if (path.startsWith('/profile/')) return 'Профиль'
        if (path.startsWith('/community/')) return 'Сообщество'
        if (path.startsWith('/chat/')) return 'Чат'
        if (path.startsWith('/post/')) return 'Публикация'
        if (path === '/admin') return 'Админ панель'
        if (path === '/verification') return 'Верификация'
        return 'NextLevel'
    }

    const canGoBack = () => {
        const path = location.pathname
        return path !== '/' && !path.startsWith('/profile/') && path !== '/search'
    }

    const handleBack = () => {
        navigate(-1)
    }

    return (
        <>
            <header className={`bg-white shadow-sm sticky top-0 z-50 md:hidden transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
                }`}>
                <div className="flex items-center justify-between h-16 px-4">
                    <div className="flex items-center space-x-3">
                        {canGoBack() ? (
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                        ) : (
                            <Link to="/" className="flex items-center space-x-2">
                                <img src="/images/logo.svg" alt="NextLevel" className="w-8 h-8" />
                            </Link>
                        )}
                        <h1 className="text-lg font-bold text-gray-900">
                            {getPageTitle()}
                        </h1>
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {showMenu ? (
                                <X className="w-5 h-5 text-gray-600" />
                            ) : (
                                <Menu className="w-5 h-5 text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Мобильное меню */}
            {showMenu && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black bg-opacity-50" />
                    <div
                        ref={menuRef}
                        className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl"
                    >
                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-6">
                                {user ? (
                                    <>
                                        <Avatar src={user.photoURL} alt={user.displayName} size="md" />
                                        <div>
                                            <p className="font-semibold text-gray-900">{user.displayName}</p>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                            </div>

                            <nav className="space-y-2">
                                <Link
                                    to="/"
                                    className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                                    </div>
                                    <span>Главная</span>
                                </Link>

                                <Link
                                    to="/create"
                                    className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                                    onClick={() => setShowMenu(false)}
                                >
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Plus className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span>Создать</span>
                                </Link>

                                {user && (
                                    <>
                                        <Link
                                            to={`/profile/${user.uid}`}
                                            className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                                            onClick={() => setShowMenu(false)}
                                        >
                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <User className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <span>Мой профиль</span>
                                        </Link>

                                        <Link
                                            to="/verification"
                                            className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                                            onClick={() => setShowMenu(false)}
                                        >
                                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                                <div className="w-4 h-4 text-yellow-600">🛡️</div>
                                            </div>
                                            <span>Верификация</span>
                                        </Link>

                                        {user.role === 'admin' && (
                                            <Link
                                                to="/admin"
                                                className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors border-t border-gray-200 mt-4 pt-4"
                                                onClick={() => setShowMenu(false)}
                                            >
                                                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                                    <div className="w-4 h-4 text-red-600">🛡️</div>
                                                </div>
                                                <span>Админ панель</span>
                                            </Link>
                                        )}
                                    </>
                                )}

                                {!user && (
                                    <Link
                                        to="/login"
                                        className="flex items-center space-x-3 p-3 hover:bg-gray-100 rounded-lg transition-colors border-t border-gray-200 mt-4 pt-4"
                                        onClick={() => setShowMenu(false)}
                                    >
                                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <User className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <span>Войти</span>
                                    </Link>
                                )}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
