import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Tabs from '../components/Tabs'
import CommunityCard from '../components/CommunityCard'
import PostCard from '../components/PostCard'
import { mockPosts } from '../data/mockPosts'
import { fullMockPosts, fullMockPartnerships } from '../data/fullMockData'
import { mockCommunities } from '../data/mockCommunities'
import usePostsStore from '../store/postsStore'
import useCommunitiesStore from '../store/communitiesStore'
import PartnershipCard from '../components/PartnershipCard'

export default function Home() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all')
    const { posts, setPosts } = usePostsStore()
    const { joinedCommunities, joinCommunity, isJoined } = useCommunitiesStore()
    const [allContent, setAllContent] = useState([])

    // Список верифицированных пользователей (моковые данные)
    const verifiedUsers = useMemo(() => new Set(['user1', 'admin1']), [])

    const handleJoinCommunity = (communityId) => {
        if (!user) {
            navigate('/login')
            return
        }

        const success = joinCommunity(communityId)
        if (success) {
            console.log(`Успешно присоединились к сообществу ${communityId}`)
            // TODO: Добавить в Firebase
        } else {
            console.log(`Уже присоединены к сообществу ${communityId}`)
        }
    }

    // Приоритеты типов контента
    const getTypePriority = (type) => {
        const priorities = {
            'partnership': 1,      // Сотрудничество - самый высокий приоритет
            'vacancy': 2,          // Вакансии
            'internship': 2,       // Стажировки (как вакансии)
            'project': 3,          // Проекты
            'event': 4,            // Мероприятия
            'post': 5              // Обычные публикации
        }
        return priorities[type] || 10
    }

    // Сортируем посты: приоритет типа → верифицированные → дата
    const sortedPosts = useMemo(() => {
        const postsToSort = posts.length > 0 ? posts : mockPosts
        return [...postsToSort].sort((a, b) => {
            // 1. Сначала по типу контента (сотрудничество > вакансии > посты)
            const aPriority = getTypePriority(a.type)
            const bPriority = getTypePriority(b.type)
            if (aPriority !== bPriority) return aPriority - bPriority

            // 2. Затем верифицированные авторы
            const aVerified = a.authorVerified || verifiedUsers.has(a.author?.uid)
            const bVerified = b.authorVerified || verifiedUsers.has(b.author?.uid)
            if (aVerified && !bVerified) return -1
            if (!aVerified && bVerified) return 1

            // 3. Если оба верифицированы или оба нет - сортируем по дате
            return new Date(b.createdAt) - new Date(a.createdAt)
        })
    }, [posts, verifiedUsers])

    const tabs = [
        { id: 'all', label: 'Все' },
        { id: 'partnership', label: 'Сотрудничество' },
        { id: 'vacancy', label: 'Вакансии' },
        { id: 'internship', label: 'Стажировки' },
        { id: 'event', label: 'События' },
        { id: 'project', label: 'Проекты' },
        { id: 'post', label: 'Публикации' }
    ]

    useEffect(() => {
        // Объединяем посты и partnerships
        const allPosts = [...mockPosts, ...fullMockPosts]
        const allPartnerships = fullMockPartnerships.map(p => ({ ...p, type: 'partnership' }))
        const combined = [...allPosts, ...allPartnerships]
        
        // Проверяем, изменилось ли количество контента
        if (posts.length !== allPosts.length) {
            setPosts(allPosts)
        }
        
        setAllContent(combined)

        // Даем время Firebase проверить сессию
        const timer = setTimeout(() => {
            setLoading(false)
            if (!user) {
                navigate('/login')
            }
        }, 1000)

        return () => clearTimeout(timer)
    }, [user, navigate, setPosts])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500">Загрузка...</div>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    // Фильтруем контент по активной вкладке
    const filteredContent = activeTab === 'all'
        ? allContent
        : allContent.filter(item => item.type === activeTab)
    
    // Сортируем отфильтрованный контент
    const sortedContent = filteredContent.sort((a, b) => {
        // Для партнёрств: сначала те, у кого кнопка "Откликнуться" (открытые)
        if (a.type === 'partnership' && b.type === 'partnership') {
            const aOpen = a.status === 'open' && (!a.expiryDate || new Date(a.expiryDate) > new Date())
            const bOpen = b.status === 'open' && (!b.expiryDate || new Date(b.expiryDate) > new Date())
            if (aOpen && !bOpen) return -1
            if (!aOpen && bOpen) return 1
        }
        return new Date(b.createdAt) - new Date(a.createdAt)
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Лента</h2>

                        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

                        <div className="space-y-6 mt-6">
                            {sortedContent.length > 0 ? (
                                sortedContent.map(item => (
                                    item.type === 'partnership' ? (
                                        <PartnershipCard key={item.id} partnership={item} />
                                    ) : (
                                        <PostCard key={item.id} post={item} />
                                    )
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Нет публикаций в этой категории</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Мои сообщества
                            </h3>
                            <div className="space-y-4">
                                {joinedCommunities.length > 0 ? (
                                    mockCommunities
                                        .filter(community => isJoined(community.id))
                                        .map(community => (
                                            <CommunityCard
                                                key={community.id}
                                                community={community}
                                                joined
                                            />
                                        ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>Вы пока не присоединились ни к одному сообществу</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Рекомендованные
                            </h3>
                            <div className="space-y-4">
                                {mockCommunities
                                    .filter(community => !isJoined(community.id))
                                    .map(community => (
                                        <CommunityCard
                                            key={community.id}
                                            community={community}
                                            onJoin={handleJoinCommunity}
                                        />
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
