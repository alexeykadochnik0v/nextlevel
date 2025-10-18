import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Handshake, Shield, Building, Send, CheckCircle, Users, Calendar, ChevronRight, FileText } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import usePartnershipStore from '../store/partnershipStore'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Textarea from '../components/ui/Textarea'
import Toast from '../components/Toast'

export default function Partnership() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { submitApplication } = usePartnershipStore()
    
    const [partnership, setPartnership] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showApplicationModal, setShowApplicationModal] = useState(false)
    const [message, setMessage] = useState('')
    const [contactInfo, setContactInfo] = useState('')
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [hasApplied, setHasApplied] = useState(false)
    const [userCommunities, setUserCommunities] = useState([])
    const [selectedCommunityId, setSelectedCommunityId] = useState('')

    useEffect(() => {
        const loadPartnership = async () => {
            try {
                const partnershipDoc = await getDoc(doc(db, 'partnerships', id))
                if (partnershipDoc.exists()) {
                    setPartnership({ id: partnershipDoc.id, ...partnershipDoc.data() })
                } else {
                    // Моковые данные
                    setPartnership({
                        id,
                        title: 'Поиск технологического партнера для разработки AI решений',
                        partnerType: 'integrator',
                        description: `Мы ищем технологического партнера для совместной разработки AI-powered решений в области автоматизации бизнес-процессов.

Что мы предлагаем:
- Доступ к нашей клиентской базе (500+ компаний)
- Совместный маркетинг и продвижение
- Разделение прибыли 50/50
- Техническую поддержку и инфраструктуру

Что мы ищем:
- Опыт в разработке ML/AI решений
- Команда от 5 человек
- Портфолио успешных проектов
- Готовность к долгосрочному партнерству`,
                        terms: 'Совместная разработка, разделение прибыли',
                        communityId: '1',
                        communityName: 'IT & Tech',
                        authorId: 'employer1',
                        authorName: 'ПромТех Групп',
                        authorVerified: true,
                        status: 'active',
                        createdAt: new Date().toISOString()
                    })
                }

                // Загружаем сообщества пользователя
                if (user) {
                    const { collection: firestoreCollection, query, where, getDocs } = await import('firebase/firestore')
                    const communitiesQuery = query(
                        firestoreCollection(db, 'communities'),
                        where('ownerUid', '==', user.uid),
                        where('status', '==', 'active')
                    )
                    const communitiesSnapshot = await getDocs(communitiesQuery)
                    const communities = []
                    communitiesSnapshot.forEach((doc) => {
                        const communityData = doc.data()
                        if (!communityData.publishBan?.enabled) {
                            communities.push({ id: doc.id, ...communityData })
                        }
                    })
                    setUserCommunities(communities)
                    if (communities.length === 1) {
                        setSelectedCommunityId(communities[0].id)
                    }
                }
            } catch (error) {
                console.error('Error loading partnership:', error)
            } finally {
                setLoading(false)
            }
        }

        loadPartnership()
    }, [id, user])

    const handleApply = async () => {
        if (!user) {
            setToastMessage('Войдите в систему для отклика на предложение')
            setShowToast(true)
            setTimeout(() => navigate('/login'), 2000)
            return
        }

        if (userCommunities.length === 0) {
            setToastMessage('У вас нет активных сообществ для отклика')
            setShowToast(true)
            return
        }

        if (!selectedCommunityId) {
            setToastMessage('Выберите сообщество от имени которого откликаетесь')
            setShowToast(true)
            return
        }

        if (!message.trim()) {
            setToastMessage('Напишите сообщение')
            setShowToast(true)
            return
        }

        setSubmitting(true)
        try {
            const selectedCommunity = userCommunities.find(c => c.id === selectedCommunityId)

            await submitApplication({
                offerId: partnership.id,
                offerTitle: partnership.title,
                offerAuthorId: partnership.authorId,
                applicantCommunityId: selectedCommunityId,
                applicantCommunityName: selectedCommunity.title,
                applicantUserId: user.uid,
                applicantUserName: user.displayName || user.email,
                message: message.trim(),
                contactInfo: contactInfo.trim() || null
            })

            setHasApplied(true)
            setShowApplicationModal(false)
            setToastMessage('Отклик успешно отправлен!')
            setShowToast(true)
            setMessage('')
            setContactInfo('')
        } catch (error) {
            console.error('Error submitting application:', error)
            setToastMessage('Ошибка при отправке отклика')
            setShowToast(true)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-gray-600">Загрузка...</p>
                </div>
            </div>
        )
    }

    if (!partnership) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-gray-600">Предложение не найдено</p>
                </div>
            </div>
        )
    }

    const partnerTypeLabels = {
        supplier: 'Поставщик',
        contractor: 'Подрядчик',
        integrator: 'Интегратор',
        investor: 'Инвестор',
        other: 'Другое'
    }

    const partnerTypeLabel = partnerTypeLabels[partnership.partnerType] || partnership.partnerType
    const formatDate = (dateString) => {
        if (!dateString) return null
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const isExpired = partnership.expiryDate && new Date(partnership.expiryDate) < new Date()
    const isClosed = partnership.status === 'closed' || isExpired

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Хлебные крошки */}
                <nav className="mb-6 flex items-center space-x-2 text-sm text-gray-500">
                    <Link to="/" className="hover:text-indigo-600">Главная</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link to={`/community/${partnership.communityId}`} className="hover:text-indigo-600">
                        {partnership.communityName}
                    </Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900 font-medium">{partnership.title}</span>
                </nav>

                {/* Двухколоночный лейаут */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Левая колонка - Контент */}
                    <div className="lg:col-span-2 space-y-6">
                                <Card>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                {partnership.title}
                            </h1>
                            
                            {/* Бейджи */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <Badge variant="primary" className="flex items-center">
                                    <Handshake className="w-3 h-3 mr-1" />
                                    Сотрудничество
                                </Badge>
                                {partnership.authorVerified && (
                                    <Badge variant="success" className="flex items-center">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Верифицирован
                                    </Badge>
                                )}
                                {isClosed && (
                                    <Badge variant="danger">
                                        Закрыто {isExpired ? '(Срок истек)' : ''}
                                    </Badge>
                                )}
                            </div>

                            {/* Описание */}
                            <h2 className="text-xl font-bold text-gray-900 mb-3">Описание и условия</h2>
                            <div className="prose max-w-none text-gray-700 whitespace-pre-line mb-6">
                                {partnership.description}
                            </div>

                            {partnership.terms && (
                                <div className="border-t pt-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Условия</h3>
                                    <div className="text-gray-700 whitespace-pre-line">
                                        {partnership.terms}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Правая колонка - Инфо-панель */}
                    <div className="lg:col-span-1">
                        {/* Карточка сообщества */}
                        <Card className="mb-6 sticky top-20">
                            <Link to={`/community/${partnership.communityId}`} className="block mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                        {partnership.communityName?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 hover:text-indigo-600">
                                            {partnership.communityName}
                                        </p>
                                        <p className="text-xs text-gray-500">Сообщество</p>
                                    </div>
                                </div>
                            </Link>

                            {/* Метаданные */}
                            <div className="space-y-3 text-sm mb-6">
                                <div>
                                    <p className="text-gray-500 mb-1">Тип партнера:</p>
                                    <p className="font-medium text-gray-900">{partnerTypeLabel}</p>
                                </div>
                                {partnership.expiryDate && (
                                    <div>
                                        <p className="text-gray-500 mb-1">Срок актуальности:</p>
                                        <p className="font-medium text-gray-900">{formatDate(partnership.expiryDate)}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-gray-500 mb-1">Дата публикации:</p>
                                    <p className="font-medium text-gray-900">{formatDate(partnership.createdAt)}</p>
                                </div>
                            </div>

                            {/* CTA */}
                            {!isClosed && (
                                hasApplied ? (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                            <div>
                                                <p className="font-medium text-green-900 text-sm">Отклик отправлен!</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            if (!user) {
                                                setToastMessage('Войдите в систему')
                                                setShowToast(true)
                                                return
                                            }
                                            if (userCommunities.length === 0) {
                                                setToastMessage('У вас нет активных сообществ')
                                                setShowToast(true)
                                                return
                                            }
                                            setShowApplicationModal(true)
                                        }}
                                        className="w-full"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        Откликнуться
                                    </Button>
                                )
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* Модальное окно отклика */}
            <Modal
                show={showApplicationModal}
                onClose={() => setShowApplicationModal(false)}
                title="Откликнуться на предложение о сотрудничестве"
                size="lg"
            >
                <div className="space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-purple-900 font-medium mb-1">
                            Предложение: {partnership.title}
                        </p>
                        <p className="text-sm text-purple-700">
                            От сообщества: {partnership.communityName}
                        </p>
                    </div>

                    {userCommunities.length > 1 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                От имени сообщества *
                            </label>
                            <select
                                value={selectedCommunityId}
                                onChange={(e) => setSelectedCommunityId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">Выберите сообщество</option>
                                {userCommunities.map(community => (
                                    <option key={community.id} value={community.id}>
                                        {community.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {userCommunities.length === 1 && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <Users className="w-5 h-5 text-indigo-600 mr-2" />
                                <div>
                                    <p className="text-sm font-medium text-indigo-900">
                                        От имени сообщества:
                                    </p>
                                    <p className="text-sm text-indigo-700">{userCommunities[0].title}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Сообщение *
                        </label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Расскажите о вашем сообществе и почему вы заинтересованы в сотрудничестве..."
                            rows={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Контактная информация (необязательно)
                        </label>
                        <input
                            type="text"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            placeholder="Email, телефон или ссылка"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex space-x-3">
                        <Button
                            onClick={handleApply}
                            disabled={submitting || !message.trim() || !selectedCommunityId}
                            className="flex-1"
                        >
                            {submitting ? 'Отправка...' : 'Отправить отклик'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowApplicationModal(false)}
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
