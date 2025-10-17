import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Mail, Calendar, Award, ExternalLink, Edit2 } from 'lucide-react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Modal from '../components/ui/Modal'
import Toast from '../components/Toast'
import ProgressBar from '../components/ProgressBar'

export default function Profile() {
    const { id } = useParams()
    const { user: currentUser } = useAuth()
    const [profileUser, setProfileUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [editForm, setEditForm] = useState({
        displayName: '',
        bio: '',
        location: '',
        birthDate: ''
    })

    const isOwnProfile = currentUser && currentUser.uid === id

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'users', id))
                if (userDoc.exists()) {
                    const data = userDoc.data()
                    setProfileUser({ uid: id, ...data })
                    setEditForm({
                        displayName: data.displayName || '',
                        bio: data.bio || '',
                        location: data.location || '',
                        birthDate: data.birthDate || ''
                    })
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [id])

    const handleEditChange = (e) => {
        const { name, value } = e.target
        setEditForm(prev => ({ ...prev, [name]: value }))
    }

    const handleSaveProfile = async () => {
        if (!editForm.displayName.trim()) {
            setToastMessage('ФИО обязательно для заполнения')
            setShowToast(true)
            return
        }

        setSaving(true)
        try {
            await updateDoc(doc(db, 'users', id), {
                displayName: editForm.displayName.trim(),
                bio: editForm.bio.trim(),
                location: editForm.location.trim(),
                birthDate: editForm.birthDate,
                updatedAt: new Date().toISOString()
            })

            setProfileUser(prev => ({
                ...prev,
                ...editForm
            }))

            setIsEditing(false)
            setToastMessage('Профиль успешно обновлен!')
            setShowToast(true)
        } catch (error) {
            console.error('Error updating profile:', error)
            setToastMessage('Ошибка при сохранении профиля')
            setShowToast(true)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500">Загрузка профиля...</div>
                </div>
            </div>
        )
    }

    if (!profileUser) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500">Пользователь не найден</div>
                </div>
            </div>
        )
    }

    const user = {
        id,
        displayName: profileUser.displayName || 'Пользователь',
        role: profileUser.role || 'user',
        email: profileUser.email || '',
        bio: profileUser.bio || '',
        location: profileUser.location || '',
        birthDate: profileUser.birthDate || '',
        joinDate: profileUser.createdAt || new Date().toISOString(),
        level: profileUser.level || 1,
        points: profileUser.points || 0,
        pointsToNextLevel: (profileUser.level || 1) * 1000 - (profileUser.points || 0),
        photoURL: profileUser.photoURL || null
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

                                {isOwnProfile && (
                                    <Button className="w-full" onClick={() => setIsEditing(true)}>
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Редактировать профиль
                                    </Button>
                                )}
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

            {/* Модальное окно редактирования */}
            <Modal
                show={isEditing}
                onClose={() => setIsEditing(false)}
                title="Редактировать профиль"
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="ФИО"
                        name="displayName"
                        value={editForm.displayName}
                        onChange={handleEditChange}
                        required
                    />

                    <Input
                        label="Дата рождения"
                        type="date"
                        name="birthDate"
                        value={editForm.birthDate}
                        onChange={handleEditChange}
                    />

                    <Input
                        label="Местоположение"
                        name="location"
                        value={editForm.location}
                        onChange={handleEditChange}
                        placeholder="Москва, Россия"
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            О себе
                        </label>
                        <Textarea
                            name="bio"
                            value={editForm.bio}
                            onChange={handleEditChange}
                            placeholder="Расскажите о себе, своих интересах и целях..."
                            rows={4}
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button
                            onClick={handleSaveProfile}
                            disabled={saving}
                            className="flex-1"
                        >
                            {saving ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={saving}
                            className="flex-1"
                        >
                            Отмена
                        </Button>
                    </div>
                </div>
            </Modal>

            <Toast
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
            />
        </div>
    )
}
