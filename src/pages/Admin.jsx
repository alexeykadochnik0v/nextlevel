import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { BarChart3, Users, TrendingUp, Plus, Shield, Check, X, ExternalLink, Clock, Building, AlertCircle } from 'lucide-react'
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, addDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Tabs from '../components/Tabs'
import Toast from '../components/Toast'
import Modal from '../components/ui/Modal'
import Textarea from '../components/ui/Textarea'

export default function Admin() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('analytics')
    const [verificationRequests, setVerificationRequests] = useState([])
    const [communities, setCommunities] = useState([])
    const [banModal, setBanModal] = useState({ show: false, community: null, action: null })
    const [loading, setLoading] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [reviewModal, setReviewModal] = useState({ show: false, request: null, action: null })
    const [rejectReason, setRejectReason] = useState('')
    const [banReason, setBanReason] = useState('')
    const [adminEmail, setAdminEmail] = useState('')

    // Проверка прав доступа
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />
    }

    const tabs = [
        { id: 'analytics', label: 'Аналитика' },
        { id: 'verification', label: 'Верификация' },
        { id: 'communities', label: 'Сообщества' },
        { id: 'content', label: 'Контент' },
        { id: 'talents', label: 'Поиск талантов' },
        { id: 'administrators', label: 'Администраторы' }
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

    // Загружаем заявки на верификацию
    useEffect(() => {
        if (activeTab === 'verification') {
            loadVerificationRequests()
        }
        if (activeTab === 'communities') {
            loadCommunities()
        }
    }, [activeTab])

    const loadVerificationRequests = async () => {
        setLoading(true)
        try {
            const querySnapshot = await getDocs(collection(db, 'verificationsQueue'))
            const requests = []
            querySnapshot.forEach((doc) => {
                requests.push({ id: doc.id, ...doc.data() })
            })
            setVerificationRequests(requests.filter(r => r.status === 'pending'))
        } catch (error) {
            console.error('Error loading verification requests:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadCommunities = async () => {
        setLoading(true)
        try {
            const querySnapshot = await getDocs(collection(db, 'communities'))
            const communitiesData = []
            querySnapshot.forEach((doc) => {
                communitiesData.push({ id: doc.id, ...doc.data() })
            })
            setCommunities(communitiesData.filter(c => c.status === 'active'))
        } catch (error) {
            console.error('Error loading communities:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (request) => {
        try {
            // Обновляем заявку
            await updateDoc(doc(db, 'verificationsQueue', request.id), {
                status: 'approved',
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'admin' // TODO: use current admin uid
            })

            // Обновляем пользователя
            await updateDoc(doc(db, 'users', request.userId), {
                [`verification.${request.type}`]: {
                    status: 'approved',
                    reviewedAt: new Date().toISOString()
                }
            })

            setToastMessage('Заявка одобрена!')
            setShowToast(true)
            loadVerificationRequests()
        } catch (error) {
            console.error('Error approving verification:', error)
            setToastMessage('Ошибка при одобрении заявки')
            setShowToast(true)
        }
    }

    const handleReject = async () => {
        const request = reviewModal.request
        if (!rejectReason.trim()) {
            setToastMessage('Укажите причину отклонения')
            setShowToast(true)
            return
        }

        try {
            // Обновляем заявку
            await updateDoc(doc(db, 'verificationsQueue', request.id), {
                status: 'rejected',
                reason: rejectReason,
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'admin'
            })

            // Обновляем пользователя
            await updateDoc(doc(db, 'users', request.userId), {
                [`verification.${request.type}`]: {
                    status: 'rejected',
                    reason: rejectReason,
                    reviewedAt: new Date().toISOString()
                }
            })

            setToastMessage('Заявка отклонена')
            setShowToast(true)
            setReviewModal({ show: false, request: null, action: null })
            setRejectReason('')
            loadVerificationRequests()
        } catch (error) {
            console.error('Error rejecting verification:', error)
            setToastMessage('Ошибка при отклонении заявки')
            setShowToast(true)
        }
    }

    const handleAppointAdmin = async () => {
        if (!adminEmail.trim()) {
            setToastMessage('Введите email пользователя')
            setShowToast(true)
            return
        }

        setLoading(true)
        try {
            // Сначала ищем пользователя по email в Firestore
            const usersRef = collection(db, 'users')
            const q = query(usersRef, where('email', '==', adminEmail.trim()))
            const querySnapshot = await getDocs(q)

            if (querySnapshot.empty) {
                // Если не найден в Firestore, попробуем найти по Firebase Auth
                setToastMessage('Пользователь с таким email не найден. Убедитесь, что пользователь зарегистрирован.')
                setShowToast(true)
                return
            }

            const userDoc = querySnapshot.docs[0]
            const userId = userDoc.id
            const userData = userDoc.data()

            // Проверяем, не является ли пользователь уже администратором
            if (userData.role === 'admin') {
                setToastMessage('Пользователь уже является администратором')
                setShowToast(true)
                return
            }

            // Обновляем роль пользователя на admin
            await updateDoc(doc(db, 'users', userId), {
                role: 'admin',
                adminAppointedAt: new Date().toISOString(),
                adminAppointedBy: user.uid
            })

            setToastMessage(`Пользователь ${adminEmail} назначен администратором!`)
            setShowToast(true)
            setAdminEmail('')
        } catch (error) {
            console.error('Error appointing admin:', error)
            setToastMessage('Ошибка при назначении администратора')
            setShowToast(true)
        } finally {
            setLoading(false)
        }
    }

    const handleTogglePublishBan = async (community, enable, reason = '') => {
        try {
            await updateDoc(doc(db, 'communities', community.id), {
                'publishBan.enabled': enable,
                'publishBan.reason': enable ? reason : '',
                'publishBan.updatedAt': new Date().toISOString(),
                'publishBan.updatedBy': user.uid
            })

            // Создаем уведомление владельцу
            await addDoc(collection(db, 'notifications'), {
                type: enable ? 'community_publish_banned' : 'community_publish_unbanned',
                userId: community.ownerUid,
                communityId: community.id,
                title: enable ? 'Публикации запрещены' : 'Публикации разрешены',
                message: enable
                    ? `Публикации в сообществе "${community.title}" запрещены администратором. Причина: ${reason}`
                    : `Публикации в сообществе "${community.title}" снова разрешены`,
                createdAt: new Date().toISOString(),
                read: false
            })

            setToastMessage(enable ? 'Публикации запрещены' : 'Публикации разрешены')
            setShowToast(true)
            loadCommunities()
        } catch (error) {
            console.error('Error toggling publish ban:', error)
            setToastMessage('Ошибка при изменении статуса публикаций')
            setShowToast(true)
        }
    }

    const handleConfirmBan = async () => {
        if (!banReason.trim()) {
            setToastMessage('Укажите причину запрета публикаций')
            setShowToast(true)
            return
        }

        await handleTogglePublishBan(banModal.community, true, banReason)
        setBanModal({ show: false, community: null, action: null })
        setBanReason('')
    }

    const handleRejectCommunity = async () => {
        const community = reviewModal.request
        if (!rejectReason.trim()) {
            setToastMessage('Укажите причину отклонения')
            setShowToast(true)
            return
        }

        try {
            // Обновляем статус сообщества
            await updateDoc(doc(db, 'communities', community.id), {
                status: 'rejected',
                reason: rejectReason,
                reviewedAt: new Date().toISOString(),
                reviewedBy: user.uid
            })

            // Создаем уведомление владельцу
            await addDoc(collection(db, 'notifications'), {
                type: 'community_rejected',
                userId: community.ownerUid,
                communityId: community.id,
                title: 'Сообщество отклонено',
                message: `Ваше сообщество "${community.title}" отклонено. Причина: ${rejectReason}`,
                createdAt: new Date().toISOString(),
                read: false
            })

            setToastMessage('Сообщество отклонено')
            setShowToast(true)
            setReviewModal({ show: false, request: null, action: null })
            setRejectReason('')
            loadCommunities()
        } catch (error) {
            console.error('Error rejecting community:', error)
            setToastMessage('Ошибка при отклонении сообщества')
            setShowToast(true)
        }
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

                {activeTab === 'verification' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Заявки на верификацию</h2>
                                <p className="text-gray-600">Проверьте и одобрите или отклоните заявки</p>
                            </div>
                            <Badge variant="primary" className="text-lg px-4 py-2">
                                {verificationRequests.length} ожидают
                            </Badge>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <Clock className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Загрузка заявок...</p>
                            </div>
                        ) : verificationRequests.length === 0 ? (
                            <Card>
                                <div className="text-center py-12">
                                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-gray-900 mb-2">Нет заявок</p>
                                    <p className="text-gray-600">Все заявки на верификацию обработаны</p>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {verificationRequests.map(request => (
                                    <Card key={request.id}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <Shield className={`w-6 h-6 ${request.type === 'student' ? 'text-blue-600' : 'text-green-600'
                                                        }`} />
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {request.userName || request.userEmail}
                                                        </h3>
                                                        <Badge variant={request.type === 'student' ? 'primary' : 'success'}>
                                                            {request.type === 'student' ? 'Студент' : 'Работодатель'}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center text-gray-600">
                                                        <span className="font-medium w-32">Email:</span>
                                                        <span>{request.userEmail}</span>
                                                    </div>
                                                    {request.type === 'student' && (
                                                        <>
                                                            <div className="flex items-center text-gray-600">
                                                                <span className="font-medium w-32">Учебное заведение:</span>
                                                                <span>{request.university}</span>
                                                            </div>
                                                            {request.studentId && (
                                                                <div className="flex items-center text-gray-600">
                                                                    <span className="font-medium w-32">Студ. билет:</span>
                                                                    <span>{request.studentId}</span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                    {request.type === 'employer' && (
                                                        <>
                                                            <div className="flex items-center text-gray-600">
                                                                <span className="font-medium w-32">Компания:</span>
                                                                <span>{request.companyName}</span>
                                                            </div>
                                                            {request.inn && (
                                                                <div className="flex items-center text-gray-600">
                                                                    <span className="font-medium w-32">ИНН:</span>
                                                                    <span>{request.inn}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center text-gray-600">
                                                                <span className="font-medium w-32">Должность:</span>
                                                                <span>{request.position}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="flex items-center text-gray-600">
                                                        <span className="font-medium w-32">Дата подачи:</span>
                                                        <span>{new Date(request.createdAt).toLocaleDateString('ru-RU')}</span>
                                                    </div>
                                                </div>

                                                {request.docUrl && (
                                                    <a
                                                        href={request.docUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
                                                    >
                                                        <ExternalLink className="w-4 h-4 mr-1" />
                                                        Просмотреть документ
                                                    </a>
                                                )}
                                            </div>

                                            <div className="flex flex-col space-y-2 ml-4">
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => handleApprove(request)}
                                                    className="whitespace-nowrap"
                                                >
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Одобрить
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => setReviewModal({ show: true, request, action: 'reject' })}
                                                    className="whitespace-nowrap"
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Отклонить
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'communities' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Управление сообществами</h2>
                                <p className="text-gray-600">Контроль публикаций в сообществах</p>
                            </div>
                            <Badge variant="primary" className="text-lg px-4 py-2">
                                {communities.length} всего
                            </Badge>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <Clock className="w-12 h-12 text-gray-400 animate-spin mx-auto mb-4" />
                                <p className="text-gray-600">Загрузка сообществ...</p>
                            </div>
                        ) : communities.length === 0 ? (
                            <Card>
                                <div className="text-center py-12">
                                    <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-gray-900 mb-2">Нет сообществ</p>
                                    <p className="text-gray-600">Сообщества появятся после создания</p>
                                </div>
                            </Card>
                        ) : (
                            <div className="grid gap-4">
                                {communities.map(community => (
                                    <Card key={community.id}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-start space-x-4 mb-4">
                                                    {community.logoUrl ? (
                                                        <img
                                                            src={community.logoUrl}
                                                            alt={community.title}
                                                            className="w-16 h-16 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
                                                            {community.title?.charAt(0) || 'C'}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                                                            {community.title}
                                                        </h3>
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <Badge variant={community.category === 'company' ? 'primary' : 'success'}>
                                                                {community.category === 'company' ? 'Компания' : 'Студенческая команда'}
                                                            </Badge>
                                                            {community.verifiedEmployer && (
                                                                <Badge variant="success">Верифицированный работодатель</Badge>
                                                            )}
                                                            {community.publishBan?.enabled && (
                                                                <Badge variant="danger">
                                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                                    Публикации запрещены
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-600 text-sm mb-3">
                                                            {community.description}
                                                        </p>
                                                        {community.publishBan?.enabled && community.publishBan?.reason && (
                                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                                                <p className="text-sm font-medium text-red-900 mb-1">Причина бана:</p>
                                                                <p className="text-sm text-red-700">{community.publishBan.reason}</p>
                                                            </div>
                                                        )}
                                                        {community.tags && community.tags.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                {community.tags.map((tag, i) => (
                                                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="space-y-2 text-sm border-t pt-3">
                                                    <div className="flex items-center text-gray-600">
                                                        <span className="font-medium w-32">Владелец:</span>
                                                        <span>{community.ownerName || community.ownerEmail}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-600">
                                                        <span className="font-medium w-32">Email:</span>
                                                        <span>{community.ownerEmail}</span>
                                                    </div>
                                                    <div className="flex items-center text-gray-600">
                                                        <span className="font-medium w-32">Создано:</span>
                                                        <span>{new Date(community.createdAt).toLocaleDateString('ru-RU')}</span>
                                                    </div>
                                                    {community.publishBan?.enabled && (
                                                        <div className="flex items-center text-gray-600">
                                                            <span className="font-medium w-32">Бан установлен:</span>
                                                            <span>{new Date(community.publishBan.updatedAt).toLocaleDateString('ru-RU')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col space-y-2 ml-4">
                                                {community.publishBan?.enabled ? (
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleTogglePublishBan(community, false)}
                                                        className="whitespace-nowrap"
                                                    >
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Возобновить публикации
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => setBanModal({ show: true, community, action: 'ban' })}
                                                        className="whitespace-nowrap"
                                                    >
                                                        <X className="w-4 h-4 mr-2" />
                                                        Остановить публикации
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Контент</h2>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
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

                {activeTab === 'administrators' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Управление администраторами
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Назначьте администраторов, введя email зарегистрированного пользователя
                            </p>
                        </div>

                        <Card>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email пользователя
                                    </label>
                                    <input
                                        type="email"
                                        value={adminEmail}
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                        placeholder="user@example.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <Button
                                    onClick={handleAppointAdmin}
                                    disabled={loading || !adminEmail.trim()}
                                    className="w-full"
                                >
                                    {loading ? 'Назначение...' : 'Назначить администратором'}
                                </Button>
                            </div>
                        </Card>


                        <Card>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                ⚠️ Важная информация
                            </h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <p>
                                    <strong>• Безопасность:</strong> Назначайте администраторами только доверенных пользователей
                                </p>
                                <p>
                                    <strong>• Права доступа:</strong> Администраторы получают полный доступ к админ панели
                                </p>
                                <p>
                                    <strong>• Управление:</strong> Администраторы могут назначать других администраторов
                                </p>
                                <p>
                                    <strong>• Отзыв прав:</strong> Для отзыва прав администратора обратитесь к разработчику
                                </p>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Модальное окно отклонения */}
            <Modal
                show={reviewModal.show}
                onClose={() => {
                    setReviewModal({ show: false, request: null, action: null })
                    setRejectReason('')
                }}
                title={reviewModal.action === 'reject_community' ? 'Отклонить сообщество' : 'Отклонить заявку'}
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Укажите причину отклонения. Она будет отправлена пользователю.
                    </p>
                    <Textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Например: Предоставленный документ не соответствует требованиям..."
                        rows={4}
                    />
                    <div className="flex space-x-3">
                        <Button
                            variant="danger"
                            onClick={reviewModal.action === 'reject_community' ? handleRejectCommunity : handleReject}
                            disabled={!rejectReason.trim()}
                            className="flex-1"
                        >
                            Отклонить
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setReviewModal({ show: false, request: null, action: null })
                                setRejectReason('')
                            }}
                            className="flex-1"
                        >
                            Отмена
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Модальное окно бана публикаций */}
            <Modal
                show={banModal.show}
                onClose={() => {
                    setBanModal({ show: false, community: null, action: null })
                    setBanReason('')
                }}
                title="Остановить публикации"
                size="md"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-red-900 mb-2">
                            ⚠️ Внимание!
                        </p>
                        <p className="text-sm text-red-700">
                            Владелец и администраторы сообщества не смогут создавать публикации, вакансии и предложения о сотрудничестве.
                            На странице сообщества появится баннер с причиной.
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Причина запрета публикаций *
                        </label>
                        <Textarea
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            placeholder="Например: Нарушение правил публикации контента на платформе..."
                            rows={4}
                        />
                    </div>
                    <div className="flex space-x-3">
                        <Button
                            variant="danger"
                            onClick={handleConfirmBan}
                            disabled={!banReason.trim()}
                            className="flex-1"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Остановить публикации
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setBanModal({ show: false, community: null, action: null })
                                setBanReason('')
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

