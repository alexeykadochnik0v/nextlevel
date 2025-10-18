import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, Mail, Calendar, Award, ExternalLink, Edit2, Shield, Briefcase, Plus, Check, X, LogOut, Users as UsersIcon } from 'lucide-react'
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import useEmploymentStore from '../store/employmentStore'
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
import { compressImage, uploadToFirebase } from '../utils/imageCompression'

export default function Profile() {
    const { id } = useParams()
    const { user: currentUser, logout, updateAvatar } = useAuth()
    const navigate = useNavigate()
    const { employmentHistory, addEmployment, deleteEmployment } = useEmploymentStore()
    const [profileUser, setProfileUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [showEmploymentModal, setShowEmploymentModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [userCommunities, setUserCommunities] = useState([])
    const [editForm, setEditForm] = useState({
        displayName: '',
        bio: '',
        location: '',
        birthDate: ''
    })
    const [employmentForm, setEmploymentForm] = useState({
        company: '',
        title: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
    })

    const isOwnProfile = currentUser && currentUser.uid === id
    const [verification, setVerification] = useState({
        student: { status: 'none' },
        employer: { status: 'none' }
    })
    const isStudentVerified = verification.student?.status === 'approved'
    const isEmployerVerified = verification.employer?.status === 'approved'

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
                    
                    // Загружаем статус верификации из профиля пользователя
                    if (data.verification) {
                        setVerification(data.verification)
                    }
                }

                // Загружаем сообщества пользователя
                const communitiesQuery = query(
                    collection(db, 'communities'),
                    where('ownerUid', '==', id)
                )
                const communitiesSnapshot = await getDocs(communitiesQuery)
                const communities = []
                communitiesSnapshot.forEach((doc) => {
                    communities.push({ id: doc.id, ...doc.data() })
                })
                setUserCommunities(communities)
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

    const handleAddEmployment = () => {
        if (!employmentForm.company || !employmentForm.title || !employmentForm.startDate) {
            setToastMessage('Заполните обязательные поля')
            setShowToast(true)
            return
        }

        if (!employmentForm.isCurrent && !employmentForm.endDate) {
            setToastMessage('Укажите дату окончания или отметьте "Работаю сейчас"')
            setShowToast(true)
            return
        }

        addEmployment({
            company: employmentForm.company,
            title: employmentForm.title,
            startDate: employmentForm.startDate,
            endDate: employmentForm.isCurrent ? null : employmentForm.endDate,
            isCurrent: employmentForm.isCurrent,
            description: employmentForm.description
        })

        setToastMessage('Опыт работы добавлен!')
        setShowToast(true)
        setShowEmploymentModal(false)
        setEmploymentForm({
            company: '',
            title: '',
            startDate: '',
            endDate: '',
            isCurrent: false,
            description: ''
        })
    }

    const handleDeleteEmployment = (empId) => {
        deleteEmployment(empId)
        setToastMessage('Опыт работы удален')
        setShowToast(true)
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

    const handleLogout = async () => {
        try {
            await logout()
            setToastMessage('Вы успешно вышли из аккаунта')
            setShowToast(true)
            // Принудительно перенаправляем на главную страницу
            setTimeout(() => {
                navigate('/login')
            }, 1000)
        } catch (error) {
            console.error('Error signing out:', error)
            setToastMessage('Ошибка при выходе из аккаунта')
            setShowToast(true)
        }
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Проверяем тип файла
        if (!file.type.startsWith('image/')) {
            setToastMessage('Пожалуйста, выберите изображение')
            setShowToast(true)
            return
        }

        // Проверяем размер файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setToastMessage('Размер файла не должен превышать 5MB')
            setShowToast(true)
            return
        }

        setUploadingAvatar(true)

        try {
            // Сжимаем изображение
            const compressedFile = await compressImage(file, 400, 400, 0.8)

            // Загружаем на Firebase Storage
            const avatarPath = `avatars/${currentUser.uid}/${Date.now()}.jpg`
            const downloadURL = await uploadToFirebase(compressedFile, avatarPath)

            // Обновляем профиль в Firestore
            await updateDoc(doc(db, 'users', currentUser.uid), {
                photoURL: downloadURL,
                updatedAt: new Date().toISOString()
            })

            // Обновляем аватар в Firebase Auth
            await updateAvatar(downloadURL)

            // Обновляем локальное состояние
            setProfileUser(prev => ({
                ...prev,
                photoURL: downloadURL
            }))

            setToastMessage('Аватар успешно обновлен!')
            setShowToast(true)
        } catch (error) {
            console.error('Error uploading avatar:', error)
            setToastMessage('Ошибка при загрузке аватара')
            setShowToast(true)
        } finally {
            setUploadingAvatar(false)
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
        displayName: profileUser.displayName || currentUser?.displayName || 'Пользователь',
        role: profileUser.role || 'user',
        // Для своего профиля всегда используем email из Firebase Auth
        email: isOwnProfile && currentUser?.email 
            ? currentUser.email 
            : (currentUser?.email || profileUser.email || ''),
        bio: profileUser.bio || '',
        location: profileUser.location || '',
        birthDate: profileUser.birthDate || '',
        joinDate: profileUser.createdAt || new Date().toISOString(),
        level: profileUser.level || 1,
        points: profileUser.points || 0,
        pointsToNextLevel: (profileUser.level || 1) * 1000 - (profileUser.points || 0),
        photoURL: profileUser.photoURL || currentUser?.photoURL || null
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

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return { label: 'Активно', variant: 'success' }
            case 'pending_review':
                return { label: 'На модерации', variant: 'warning' }
            case 'rejected':
                return { label: 'Отклонено', variant: 'danger' }
            default:
                return { label: 'Неизвестно', variant: 'default' }
        }
    }

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
                                <div className="relative inline-block">
                                    <Avatar
                                        src={user.photoURL}
                                        alt={user.displayName}
                                        size="xl"
                                        className="mx-auto mb-4"
                                    />
                                    {isOwnProfile && (
                                        <label className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 cursor-pointer hover:bg-indigo-700 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleAvatarUpload}
                                                className="hidden"
                                                disabled={uploadingAvatar}
                                            />
                                            {uploadingAvatar ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Edit2 className="w-4 h-4" />
                                            )}
                                        </label>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                                    {user.displayName}
                                </h1>
                                <div className="flex flex-wrap justify-center gap-2 mb-4">
                                    <Badge variant="primary">
                                        {roleLabels[user.role]}
                                    </Badge>
                                    {(isStudentVerified || isEmployerVerified) && (
                                        <Badge variant="success" className="flex items-center">
                                            <Shield className="w-3 h-3 mr-1" />
                                            {isEmployerVerified ? 'Верифицированный работодатель' : 'Верифицированный студент'}
                                        </Badge>
                                    )}
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-6">
                                    {user.location && (
                                        <div className="flex items-center justify-center">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            {user.location}
                                        </div>
                                    )}
                                    <div className="flex items-center justify-center">
                                        <Mail className="w-4 h-4 mr-2" />
                                        <span className="text-sm">{user.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        С {new Date(user.joinDate).toLocaleDateString('ru-RU')}
                                    </div>
                                </div>

                                {isOwnProfile && (
                                    <div className="space-y-2">
                                        <Button className="w-full" onClick={() => setIsEditing(true)}>
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Редактировать профиль
                                        </Button>
                                        <Link to="/verification" className="block">
                                            <Button 
                                                variant={(isStudentVerified || isEmployerVerified) ? "success" : "outline"} 
                                                className="w-full"
                                            >
                                                <Shield className="w-4 h-4 mr-2" />
                                                {(isStudentVerified || isEmployerVerified) ? '✓ Верифицирован' : 'Верификация'}
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                                            onClick={handleLogout}
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Выйти
                                        </Button>
                                    </div>
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

                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        {/* Мои сообщества */}
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <UsersIcon className="w-5 h-5 mr-2 text-indigo-600" />
                                    Мои сообщества
                                </h2>
                                {isOwnProfile && (
                                    <Link to="/create/community">
                                        <Button size="sm" variant="outline">
                                            <Plus className="w-4 h-4 mr-1" />
                                            Создать
                                        </Button>
                                    </Link>
                                )}
                            </div>
                            <div className="space-y-3">
                                {userCommunities.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-4">
                                        {isOwnProfile ? 'Вы еще не создали ни одного сообщества' : 'Нет сообществ'}
                                    </p>
                                ) : (
                                    userCommunities.map(community => {
                                        const statusBadge = getStatusBadge(community.status)
                                        return (
                                            <div
                                                key={community.id}
                                                className="p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            {community.logoUrl ? (
                                                                <img
                                                                    src={community.logoUrl}
                                                                    alt={community.title}
                                                                    className="w-8 h-8 rounded object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
                                                                    {community.title.charAt(0)}
                                                                </div>
                                                            )}
                                                            <Link
                                                                to={`/community/${community.id}`}
                                                                className="font-medium text-gray-900 hover:text-indigo-600"
                                                            >
                                                                {community.title}
                                                            </Link>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-2">
                                                            <Badge variant={statusBadge.variant}>
                                                                {statusBadge.label}
                                                            </Badge>
                                                            {community.tags && community.tags.length > 0 && (
                                                                <span className="text-xs text-gray-500">
                                                                    {community.tags.slice(0, 2).join(', ')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {community.status === 'rejected' && community.reason && (
                                                            <p className="text-xs text-red-600 mt-1">
                                                                {community.reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {isOwnProfile && (
                                                        <Link to={`/community/${community.id}/edit`}>
                                                            <Button size="sm" variant="ghost">
                                                                <Edit2 className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </Card>

                        {user.bio && (
                            <Card>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    О себе
                                </h2>
                                <p className="text-gray-600">
                                    {user.bio}
                                </p>
                            </Card>
                        )}

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
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Опыт работы
                                </h2>
                                {isOwnProfile && employmentHistory.length > 0 && (
                                    <Button size="sm" onClick={() => setShowEmploymentModal(true)}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Добавить
                                    </Button>
                                )}
                            </div>
                            {employmentHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {employmentHistory
                                        .sort((a, b) => {
                                            if (a.isCurrent && !b.isCurrent) return -1
                                            if (!a.isCurrent && b.isCurrent) return 1
                                            return new Date(b.startDate) - new Date(a.startDate)
                                        })
                                        .map(emp => (
                                            <div
                                                key={emp.id}
                                                className="border-l-4 border-indigo-600 pl-4 py-2"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h3 className="font-semibold text-gray-900">
                                                                {emp.title}
                                                            </h3>
                                                            {emp.isCurrent && (
                                                                <Badge variant="success" className="text-xs">
                                                                    Текущее место
                                                                </Badge>
                                                            )}
                                                            {emp.status === 'confirmed' && (
                                                                <Badge variant="success" className="text-xs flex items-center">
                                                                    <Check className="w-3 h-3 mr-1" />
                                                                    Подтверждено
                                                                </Badge>
                                                            )}
                                                            {emp.status === 'pending' && (
                                                                <Badge variant="warning" className="text-xs">
                                                                    На проверке
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                                            {emp.company}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            {new Date(emp.startDate).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                                                            {' — '}
                                                            {emp.endDate
                                                                ? new Date(emp.endDate).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
                                                                : 'настоящее время'
                                                            }
                                                        </p>
                                                        {emp.description && (
                                                            <p className="text-sm text-gray-600">
                                                                {emp.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {isOwnProfile && (
                                                        <button
                                                            onClick={() => handleDeleteEmployment(emp.id)}
                                                            className="text-gray-400 hover:text-red-600 transition-colors ml-2"
                                                            title="Удалить"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    {isOwnProfile ? (
                                        <>
                                            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                            <p className="mb-2">Опыт работы не добавлен</p>
                                            <Button size="sm" onClick={() => setShowEmploymentModal(true)}>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Добавить опыт работы
                                            </Button>
                                        </>
                                    ) : (
                                        <p>Опыт работы не указан</p>
                                    )}
                                </div>
                            )}
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
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 flex items-center flex-wrap gap-2">
                                                    <span className="break-words">{project.title}</span>
                                                    {project.link && (
                                                        <a
                                                            href={project.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-indigo-600 hover:text-indigo-700 flex-shrink-0"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </h3>
                                                <p className="text-sm text-gray-600">{project.role}</p>
                                            </div>
                                            <Badge variant={statusLabels[project.status].variant} className="w-fit">
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

            {/* Модальное окно добавления опыта работы */}
            <Modal
                show={showEmploymentModal}
                onClose={() => {
                    setShowEmploymentModal(false)
                    setEmploymentForm({
                        company: '',
                        title: '',
                        startDate: '',
                        endDate: '',
                        isCurrent: false,
                        description: ''
                    })
                }}
                title="Добавить опыт работы"
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Компания"
                        value={employmentForm.company}
                        onChange={(e) => setEmploymentForm(prev => ({ ...prev, company: e.target.value }))}
                        placeholder="ООО «Пример»"
                        required
                    />

                    <Input
                        label="Должность"
                        value={employmentForm.title}
                        onChange={(e) => setEmploymentForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Frontend Developer"
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Дата начала"
                            type="date"
                            value={employmentForm.startDate}
                            onChange={(e) => setEmploymentForm(prev => ({ ...prev, startDate: e.target.value }))}
                            required
                        />
                        <Input
                            label="Дата окончания"
                            type="date"
                            value={employmentForm.endDate}
                            onChange={(e) => setEmploymentForm(prev => ({ ...prev, endDate: e.target.value }))}
                            disabled={employmentForm.isCurrent}
                        />
                    </div>

                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={employmentForm.isCurrent}
                            onChange={(e) => setEmploymentForm(prev => ({
                                ...prev,
                                isCurrent: e.target.checked,
                                endDate: e.target.checked ? '' : prev.endDate
                            }))}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Работаю сейчас</span>
                    </label>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Описание (необязательно)
                        </label>
                        <Textarea
                            value={employmentForm.description}
                            onChange={(e) => setEmploymentForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Краткое описание обязанностей и достижений..."
                            rows={3}
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button
                            onClick={handleAddEmployment}
                            className="flex-1"
                        >
                            Добавить
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowEmploymentModal(false)
                                setEmploymentForm({
                                    company: '',
                                    title: '',
                                    startDate: '',
                                    endDate: '',
                                    isCurrent: false,
                                    description: ''
                                })
                            }}
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
