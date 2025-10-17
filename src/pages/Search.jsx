import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import Header from '../components/Header'
import Tabs from '../components/Tabs'
import CommunityCard from '../components/CommunityCard'
import PostCard from '../components/PostCard'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

export default function SearchPage() {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''
    const [activeTab, setActiveTab] = useState('all')
    const [searchText, setSearchText] = useState(query)
    const searchInputRef = useRef(null)

    // Автофокус на поиске при загрузке страницы
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [])

    const tabs = [
        { id: 'all', label: 'Всё' },
        { id: 'communities', label: 'Сообщества' },
        { id: 'posts', label: 'Публикации' },
        { id: 'users', label: 'Пользователи' }
    ]

    // Моковые данные результатов
    const mockCommunities = [
        {
            id: '1',
            name: 'IT & Tech',
            description: 'Сообщество разработчиков и IT-специалистов',
            membersCount: 1234,
            tags: ['JavaScript', 'React', 'Node.js']
        }
    ]

    const mockPosts = [
        {
            id: '1',
            type: 'event',
            title: 'Хакатон "Цифровой прорыв 2025"',
            content: 'Приглашаем всех желающих принять участие...',
            author: { displayName: 'Алексей Петров' },
            community: { name: 'IT & Tech' },
            createdAt: new Date().toISOString(),
            likesCount: 45,
            commentsCount: 12
        }
    ]

    const mockUsers = [
        {
            id: '1',
            displayName: 'Иван Иванов',
            role: 'Frontend разработчик',
            skills: ['JavaScript', 'React', 'TypeScript'],
            level: 7
        },
        {
            id: '2',
            displayName: 'Мария Петрова',
            role: 'UI/UX дизайнер',
            skills: ['Figma', 'Design', 'Prototyping'],
            level: 6
        }
    ]

    const handleSearch = () => {
        if (searchText.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchText)}`
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Поиск{query && `: "${query}"`}
                    </h1>

                    <div className="flex space-x-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Поиск сообществ, публикаций, пользователей..."
                                className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                        <Button onClick={handleSearch}>Найти</Button>
                    </div>
                </div>

                <div className="mb-6">
                    <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
                </div>

                {(activeTab === 'all' || activeTab === 'communities') && mockCommunities.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Сообщества
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {mockCommunities.map(community => (
                                <CommunityCard key={community.id} community={community} />
                            ))}
                        </div>
                    </div>
                )}

                {(activeTab === 'all' || activeTab === 'posts') && mockPosts.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Публикации
                        </h2>
                        <div className="space-y-4">
                            {mockPosts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    </div>
                )}

                {(activeTab === 'all' || activeTab === 'users') && mockUsers.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Пользователи
                        </h2>
                        <div className="grid gap-4">
                            {mockUsers.map(user => (
                                <Card key={user.id}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <Avatar
                                                src={null}
                                                alt={user.displayName}
                                                size="lg"
                                            />
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {user.displayName}
                                                </h3>
                                                <p className="text-gray-600 mb-2">{user.role}</p>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {user.skills.map((skill, i) => (
                                                        <Badge key={i} variant="primary">{skill}</Badge>
                                                    ))}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Уровень: {user.level}
                                                </p>
                                            </div>
                                        </div>
                                        <Link to={`/profile/${user.id}`}>
                                            <Button variant="outline" size="sm">
                                                Просмотреть профиль
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab !== 'all' &&
                    ((activeTab === 'communities' && mockCommunities.length === 0) ||
                        (activeTab === 'posts' && mockPosts.length === 0) ||
                        (activeTab === 'users' && mockUsers.length === 0)) && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">
                                Ничего не найдено
                            </p>
                        </div>
                    )}
            </div>
        </div>
    )
}

