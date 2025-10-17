import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Plus, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import Avatar from './ui/Avatar'
import Button from './ui/Button'

export default function Header() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg" />
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
                        <Button variant="ghost" size="sm">
                            <Plus className="w-5 h-5 mr-1" />
                            Создать
                        </Button>

                        {user ? (
                            <Link to={`/profile/${user.uid}`}>
                                <Avatar src={user.photoURL} alt={user.displayName} size="sm" />
                            </Link>
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

