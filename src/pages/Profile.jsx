import { useParams } from 'react-router-dom'
import { MapPin, Mail, Calendar, Award, ExternalLink } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ProgressBar'

export default function Profile() {
    const { id } = useParams()

    // Моковые данные
    const user = {
        id,
        displayName: 'Иван Иванов',
        role: 'user',
        email: 'ivan@example.com',
        bio: 'Frontend разработчик, увлекаюсь React и современными веб-технологиями. Ищу интересные проекты и стажировки.',
        location: 'Москва, Россия',
        joinDate: '2024-01-15',
        level: 7,
        points: 2450,
        pointsToNextLevel: 500
    }

    const skills = [
        'JavaScript',
        'React',
        'TypeScript',
        'Node.js',
        'CSS/Tailwind',
        'Git',
        'REST API',
        'PostgreSQL'
    ]

    const projects = [
        {
            id: '1',
            title: 'E-commerce платформа',
            role: 'Frontend разработчик',
            status: 'completed',
            description: 'Разработка интернет-магазина с корзиной и оплатой',
            link: 'https://github.com/user/project'
        },
        {
            id: '2',
            title: 'Хакатон "Цифровой прорыв"',
            role: 'Full-stack разработчик',
            status: 'winner',
            description: '1 место в региональном этапе',
            link: null
        },
        {
            id: '3',
            title: 'Система управления задачами',
            role: 'Team Lead',
            status: 'in_progress',
            description: 'Командный проект для стартапа',
            link: null
        }
    ]

    const badges = [
        { id: '1', name: 'Первый пост', icon: '📝', color: 'primary' },
        { id: '2', name: 'Активный участник', icon: '🔥', color: 'danger' },
        { id: '3', name: 'Победитель хакатона', icon: '🏆', color: 'warning' },
        { id: '4', name: 'Наставник', icon: '👨‍🏫', color: 'success' },
        { id: '5', name: '100 комментариев', icon: '💬', color: 'purple' }
    ]

    const communities = [
        { id: '1', name: 'IT & Tech' },
        { id: '2', name: 'Дизайн' },
        { id: '3', name: 'Стартапы' }
    ]

    const statusLabels = {
        completed: { label: 'Завершён', variant: 'success' },
        in_progress: { label: 'В процессе', variant: 'warning' },
        winner: { label: 'Победа', variant: 'danger' }
    }

    const roleLabels = {
        user: 'Участник',
        mentor: 'Наставник',
        employer: 'Работодатель'
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <div className="text-center">
                                <Avatar
                                    src={user.photoURL}
                                    alt={user.displayName}
                                    size="xl"
                                    className="mx-auto mb-4"
                                />
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                    {user.displayName}
                                </h1>
                                <Badge variant="primary" className="mb-4">
                                    {roleLabels[user.role]}
                                </Badge>

                                <div className="space-y-2 text-sm text-gray-600 mb-6">
                                    {user.location && (
                                        <div className="flex items-center justify-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            {user.location}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center">
                                        <Mail className="w-4 h-4 mr-2" />
                                        {user.email}
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        С {new Date(user.joinDate).toLocaleDateString('ru-RU')}
                                    </div>
                                </div>

                                <Button className="w-full">
                                    Редактировать профиль
                                </Button>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                <Award className="w-5 h-5 mr-2 text-indigo-600" />
                                Уровень активности
                            </h3>
                            <div className="text-center mb-4">
                                <div className="text-4xl font-bold text-indigo-600 mb-1">
                                    {user.level}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {user.points} / {user.points + user.pointsToNextLevel} баллов
                                </p>
                            </div>
                            <ProgressBar
                                value={user.points}
                                max={user.points + user.pointsToNextLevel}
                            />
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                До {user.level + 1} уровня осталось {user.pointsToNextLevel} баллов
                            </p>
                        </Card>

                        <Card>
                            <h3 className="font-semibold text-gray-900 mb-4">
                                Сообщества
                            </h3>
                            <div className="space-y-2">
                                {communities.map(community => (
                                    <div
                                        key={community.id}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 cursor-pointer"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                            {community.name.charAt(0)}
                                        </div>
                                        <span className="text-sm">{community.name}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                О себе
                            </h2>
                            <p className="text-gray-600">
                                {user.bio}
                            </p>
                        </Card>

                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Навыки
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, i) => (
                                    <Badge key={i} variant="primary" className="text-base px-4 py-2">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Проекты и достижения
                            </h2>
                            <div className="space-y-4">
                                {projects.map(project => (
                                    <div
                                        key={project.id}
                                        className="border-l-4 border-indigo-600 pl-4 py-2"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-900 flex items-center">
                                                    {project.title}
                                                    {project.link && (
                                                        <a
                                                            href={project.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ml-2 text-indigo-600 hover:text-indigo-700"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-gray-600">{project.role}</p>
                                            </div>
                                            <Badge variant={statusLabels[project.status].variant}>
                                                {statusLabels[project.status].label}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {project.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Бейджи
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {badges.map(badge => (
                                    <div
                                        key={badge.id}
                                        className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                    >
                                        <span className="text-4xl mb-2">{badge.icon}</span>
                                        <span className="text-xs text-center font-medium text-gray-700">
                                            {badge.name}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
