import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import CommunityCard from '../components/CommunityCard'
import PostCard from '../components/PostCard'
import { mockPosts } from '../data/mockPosts'
import usePostsStore from '../store/postsStore'

export default function Home() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const { posts, setPosts } = usePostsStore()

    // Моковые данные для демонстрации
    const mockCommunities = [
        {
            id: '1',
            name: 'IT & Tech',
            description: 'Сообщество разработчиков и IT-специалистов. Обсуждаем новые технологии, делимся опытом.',
            membersCount: 1234,
            tags: ['JavaScript', 'React', 'Python']
        },
        {
            id: '2',
            name: 'Машиностроение',
            description: 'Инженеры и технологи промышленных предприятий Москвы',
            membersCount: 856,
            tags: ['CAD', 'SolidWorks', 'Проектирование']
        },
        {
            id: '3',
            name: 'Дизайн',
            description: 'UI/UX дизайнеры и креативные специалисты',
            membersCount: 645,
            tags: ['Figma', 'UI/UX', 'Design']
        }
    ]

    useEffect(() => {
        // Загружаем посты только если они еще не загружены
        if (posts.length === 0) {
            setPosts(mockPosts)
        }

        // Даем время Firebase проверить сессию
        const timer = setTimeout(() => {
            setLoading(false)
            if (!user) {
                navigate('/login')
            }
        }, 1000)

        return () => clearTimeout(timer)
    }, [user, navigate, posts.length, setPosts])

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

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Лента</h2>

                        {(posts.length > 0 ? posts : mockPosts).map(post => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Мои сообщества
                            </h3>
                            <div className="space-y-4">
                                {mockCommunities.slice(0, 2).map(community => (
                                    <CommunityCard
                                        key={community.id}
                                        community={community}
                                        joined
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Рекомендованные
                            </h3>
                            <div className="space-y-4">
                                {mockCommunities.slice(2).map(community => (
                                    <CommunityCard
                                        key={community.id}
                                        community={community}
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
