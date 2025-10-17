import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Users, Plus } from 'lucide-react'
import Header from '../components/Header'
import Tabs from '../components/Tabs'
import PostCard from '../components/PostCard'
import ChatListItem from '../components/ChatListItem'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { mockPosts } from '../data/mockPosts'

export default function Community() {
    const { id } = useParams()
    const [activeTab, setActiveTab] = useState('posts')
    const [joined, setJoined] = useState(false)

    const tabs = [
        { id: 'posts', label: 'Публикации' },
        { id: 'jobs', label: 'Работа/Вакансии' },
        { id: 'chats', label: 'Чаты' }
    ]

    // Моковые данные
    const community = {
        id,
        name: id === '1' ? 'IT & Tech' : id === '2' ? 'Машиностроение' : 'Дизайн',
        description: id === '1'
            ? 'Сообщество разработчиков и IT-специалистов. Здесь мы делимся опытом, обсуждаем новые технологии и находим единомышленников.'
            : id === '2'
                ? 'Инженеры и технологи промышленных предприятий Москвы. Обсуждаем проектирование, производство и инновации.'
                : 'UI/UX дизайнеры и креативные специалисты. Делимся работами и обсуждаем тренды.',
        membersCount: id === '1' ? 1234 : id === '2' ? 856 : 645,
        tags: id === '1'
            ? ['JavaScript', 'React', 'Node.js', 'Python', 'DevOps']
            : id === '2'
                ? ['CAD', 'SolidWorks', 'Проектирование', 'Технологии']
                : ['Figma', 'UI/UX', 'Design', 'Prototyping']
    }

    // Фильтруем посты по community
    const communityPosts = mockPosts.filter(post =>
        post.type === 'post' && post.community.name === community.name
    )

    const communityJobs = mockPosts.filter(post =>
        (post.type === 'vacancy' || post.type === 'internship' || post.type === 'project') &&
        (post.community.name === community.name || id === '1')
    )

    const mockChats = [
        {
            id: '1',
            name: 'Общий чат',
            type: 'public',
            lastMessage: 'Привет всем! Кто-нибудь работал с...',
            membersCount: 234
        },
        {
            id: '2',
            name: 'React разработчики',
            type: 'public',
            lastMessage: 'Обсуждаем новые хуки',
            membersCount: 89
        },
        {
            id: '3',
            name: 'Проектная группа',
            type: 'private',
            lastMessage: 'Встречаемся завтра в 15:00',
            membersCount: 5
        }
    ]

    const handleJoin = () => {
        setJoined(!joined)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-3xl">
                                {community.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {community.name}
                                </h1>
                                <p className="text-gray-600 mb-3">
                                    {community.description}
                                </p>
                                <div className="flex items-center text-gray-500 mb-3">
                                    <Users className="w-5 h-5 mr-2" />
                                    <span>{community.membersCount} участников</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {community.tags.map((tag, i) => (
                                        <Badge key={i} variant="primary">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Button
                            variant={joined ? 'outline' : 'primary'}
                            onClick={handleJoin}
                        >
                            {joined ? 'Покинуть' : 'Присоединиться'}
                        </Button>
                    </div>
                </Card>

                <div className="mb-6">
                    <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
                </div>

                {activeTab === 'posts' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Публикации</h2>
                            {joined && (
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Создать публикацию
                                </Button>
                            )}
                        </div>
                        {communityPosts.length > 0 ? (
                            communityPosts.map(post => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <Card>
                                <p className="text-gray-500 text-center py-8">
                                    Пока нет публикаций в этом сообществе
                                </p>
                            </Card>
                        )}
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Работа и проекты
                        </h2>
                        {communityJobs.length > 0 ? (
                            communityJobs.map(job => (
                                <PostCard key={job.id} post={job} />
                            ))
                        ) : (
                            <Card>
                                <p className="text-gray-500 text-center py-8">
                                    Пока нет вакансий и проектов
                                </p>
                            </Card>
                        )}
                    </div>
                )}

                {activeTab === 'chats' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Чаты</h2>
                            {joined && (
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Создать чат
                                </Button>
                            )}
                        </div>
                        <div className="grid gap-4">
                            {mockChats.map(chat => (
                                <ChatListItem key={chat.id} chat={chat} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
