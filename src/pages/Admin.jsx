import { useState } from 'react'
import { BarChart3, Users, TrendingUp, Plus } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Tabs from '../components/Tabs'

export default function Admin() {
    const [activeTab, setActiveTab] = useState('analytics')

    const tabs = [
        { id: 'analytics', label: 'Аналитика' },
        { id: 'communities', label: 'Сообщества' },
        { id: 'content', label: 'Контент' },
        { id: 'talents', label: 'Поиск талантов' }
    ]

    // Моковые данные
    const analytics = {
        totalMembers: 1234,
        newMembers: 89,
        activeUsers: 456,
        postsCount: 234,
        commentsCount: 1567,
        messagesCount: 8901
    }

    const communities = [
        {
            id: '1',
            name: 'IT & Tech',
            membersCount: 1234,
            status: 'active'
        },
        {
            id: '2',
            name: 'Дизайн',
            membersCount: 856,
            status: 'active'
        }
    ]

    const content = [
        {
            id: '1',
            title: 'Хакатон "Цифровой прорыв 2025"',
            type: 'event',
            status: 'published',
            views: 456,
            engagement: 89
        },
        {
            id: '2',
            title: 'Frontend разработчик (React)',
            type: 'vacancy',
            status: 'published',
            views: 234,
            engagement: 45
        }
    ]

    const talents = [
        {
            id: '1',
            name: 'Иван Иванов',
            skills: ['JavaScript', 'React', 'Node.js'],
            level: 7,
            projectsCount: 5,
            activity: 'high'
        },
        {
            id: '2',
            name: 'Мария Петрова',
            skills: ['UI/UX', 'Figma', 'Design'],
            level: 6,
            projectsCount: 3,
            activity: 'medium'
        }
    ]

    const activityLabels = {
        high: { label: 'Высокая', variant: 'success' },
        medium: { label: 'Средняя', variant: 'warning' },
        low: { label: 'Низкая', variant: 'default' }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Админ-панель
                    </h1>
                    <p className="text-gray-600">
                        Управление сообществами и контентом
                    </p>
                </div>

                <div className="mb-6">
                    <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
                </div>

                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Всего участников</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {analytics.totalMembers}
                                        </p>
                                        <p className="text-sm text-green-600 mt-1">
                                            +{analytics.newMembers} за месяц
                                        </p>
                                    </div>
                                    <Users className="w-12 h-12 text-indigo-600" />
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Активные пользователи</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {analytics.activeUsers}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            За последние 7 дней
                                        </p>
                                    </div>
                                    <TrendingUp className="w-12 h-12 text-green-600" />
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Активность</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            {analytics.postsCount}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Публикаций
                                        </p>
                                    </div>
                                    <BarChart3 className="w-12 h-12 text-purple-600" />
                                </div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Вовлечённость
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Комментарии</span>
                                        <span className="font-semibold">{analytics.commentsCount}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Сообщения</span>
                                        <span className="font-semibold">{analytics.messagesCount}</span>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Популярные сообщества
                                </h3>
                                <div className="space-y-3">
                                    {communities.slice(0, 3).map(community => (
                                        <div key={community.id} className="flex justify-between items-center">
                                            <span className="text-gray-900">{community.name}</span>
                                            <Badge variant="primary">{community.membersCount}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'communities' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Мои сообщества</h2>
                            <Button>
                                <Plus className="w-4 h-4 mr-1" />
                                Создать сообщество
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {communities.map(community => (
                                <Card key={community.id}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                                                {community.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {community.name}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {community.membersCount} участников
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="success">{community.status}</Badge>
                                            <Button variant="outline" size="sm">
                                                Редактировать
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Контент</h2>
                            <Button>
                                <Plus className="w-4 h-4 mr-1" />
                                Создать публикацию
                            </Button>
                        </div>

                        <div className="grid gap-4">
                            {content.map(item => (
                                <Card key={item.id}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {item.title}
                                                </h3>
                                                <Badge variant={item.type === 'event' ? 'purple' : 'success'}>
                                                    {item.type === 'event' ? 'Событие' : 'Вакансия'}
                                                </Badge>
                                                <Badge variant="success">{item.status}</Badge>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <span>Просмотры: {item.views}</span>
                                                <span>Вовлечённость: {item.engagement}%</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button variant="outline" size="sm">
                                                Редактировать
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                Удалить
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'talents' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Поиск талантов
                            </h2>
                            <div className="flex space-x-2 mb-6">
                                <input
                                    type="text"
                                    placeholder="Поиск по навыкам..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                                <Button>Найти</Button>
                            </div>
                        </div>

                        <div className="grid gap-4">
                            {talents.map(talent => (
                                <Card key={talent.id}>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                {talent.name}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {talent.skills.map((skill, i) => (
                                                    <Badge key={i} variant="primary">{skill}</Badge>
                                                ))}
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span>Уровень: {talent.level}</span>
                                                <span>Проектов: {talent.projectsCount}</span>
                                                <Badge variant={activityLabels[talent.activity].variant}>
                                                    {activityLabels[talent.activity].label} активность
                                                </Badge>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            Подробнее
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

