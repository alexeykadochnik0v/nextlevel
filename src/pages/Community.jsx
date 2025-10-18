import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Users, Plus, Briefcase, Shield, Heart, Check, X, AlertCircle, Handshake, FileText } from 'lucide-react'
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import useEmploymentStore from '../store/employmentStore'
import useFriendshipsStore from '../store/friendshipsStore'
import useCommunitiesStore from '../store/communitiesStore'
import Header from '../components/Header'
import Tabs from '../components/Tabs'
import PostCard from '../components/PostCard'
import PartnershipCard from '../components/PartnershipCard'
import ChatListItem from '../components/ChatListItem'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Avatar from '../components/ui/Avatar'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Toast from '../components/Toast'
import { mockPosts } from '../data/mockPosts'
import { fullMockPosts, fullMockPartnerships, mockCommunities } from '../data/fullMockData'

export default function Community() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('')
    const { isJoined, joinCommunity, leaveCommunity } = useCommunitiesStore()
    const [showEmployeeModal, setShowEmployeeModal] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [employeeForm, setEmployeeForm] = useState({
        title: '',
        startDate: ''
    })
    const [communityData, setCommunityData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [realPosts, setRealPosts] = useState([])
    const [partnerships, setPartnerships] = useState([])
    const [jobs, setJobs] = useState([])
    const [newTabName, setNewTabName] = useState('')
    const [showAddTab, setShowAddTab] = useState(false)

    const employmentStore = useEmploymentStore()
    const { requestEmployeeConfirmation } = employmentStore
    const friendshipsStore = useFriendshipsStore()
    const {
        acceptFriendshipRequest,
        rejectFriendshipRequest
    } = friendshipsStore

    // Моковые данные всех сообществ
    const allCommunities = [
        {
            id: '1',
            name: 'IT & Tech',
            description: 'Сообщество разработчиков',
            membersCount: 1234,
            logo: null
        },
        {
            id: '2',
            name: 'Машиностроение',
            description: 'Инженеры и технологи',
            membersCount: 856,
            logo: null
        },
        {
            id: '3',
            name: 'Дизайн',
            description: 'UI/UX дизайнеры',
            membersCount: 645,
            logo: null
        },
        {
            id: '4',
            name: 'Маркетинг и PR',
            description: 'Специалисты по маркетингу',
            membersCount: 523,
            logo: null
        }
    ]

    const friendCommunityIds = friendshipsStore.friendships[id] || []
    const friendCommunities = allCommunities.filter(c => friendCommunityIds.includes(c.id))
    const incomingRequestIds = friendshipsStore.incomingRequests[id] || []
    const incomingRequestCommunities = allCommunities.filter(c => incomingRequestIds.includes(c.id))

    const handleAcceptFriendship = (friendCommunityId) => {
        acceptFriendshipRequest(id, friendCommunityId)
        setToastMessage('Заявка на дружбу принята!')
        setShowToast(true)
    }

    const handleRejectFriendship = (friendCommunityId) => {
        rejectFriendshipRequest(id, friendCommunityId)
        setToastMessage('Заявка на дружбу отклонена')
        setShowToast(true)
    }

    // Загружаем данные сообщества и посты
    useEffect(() => {
        const loadCommunity = async () => {
            try {
                const communityDoc = await getDoc(doc(db, 'communities', id))
                let communityTitle = ''
                
                if (communityDoc.exists()) {
                    const data = communityDoc.data()
                    communityTitle = data.title?.toLowerCase() || ''
                    // Если membersCount отсутствует или 0, устанавливаем минимум 1 (создатель)
                    setCommunityData({ 
                        id: communityDoc.id, 
                        ...data,
                        membersCount: data.membersCount || 1
                    })
                } else {
                    // Моковые данные из mockCommunities
                    const mockCommunity = mockCommunities.find(c => c.id === id)
                    if (mockCommunity) {
                        communityTitle = mockCommunity.title?.toLowerCase() || ''
                        setCommunityData({
                            ...mockCommunity,
                            name: mockCommunity.title
                        })
                    }
                }

                // Загружаем посты этого сообщества
                const postsQuery = query(
                    collection(db, 'posts'),
                    where('communityId', '==', id),
                    where('type', '==', 'post')
                )
                const postsSnapshot = await getDocs(postsQuery)
                const posts = []
                postsSnapshot.forEach((doc) => {
                    posts.push({ id: doc.id, ...doc.data() })
                })
                
                // Добавляем моковые посты для этого сообщества
                const mockPostsForCommunity = fullMockPosts.filter(p => 
                    p.communityId === id && p.type === 'post'
                )
                posts.push(...mockPostsForCommunity)
                
                posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                setRealPosts(posts)

                // Загружаем partnerships
                const partnershipsQuery = query(
                    collection(db, 'partnerships'),
                    where('communityId', '==', id)
                )
                const partnershipsSnapshot = await getDocs(partnershipsQuery)
                const partnershipsList = []
                partnershipsSnapshot.forEach((doc) => {
                    partnershipsList.push({ id: doc.id, ...doc.data() })
                })
                
                // Добавляем моковые partnerships для этого сообщества
                const mockPartnershipsForCommunity = fullMockPartnerships.filter(p => 
                    p.communityId === id
                )
                partnershipsList.push(...mockPartnershipsForCommunity)
                
                partnershipsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                setPartnerships(partnershipsList)

                // Загружаем вакансии из коллекции jobs
                const jobsQuery = query(
                    collection(db, 'jobs'),
                    where('communityId', '==', id)
                )
                const jobsSnapshot = await getDocs(jobsQuery)
                const jobsList = []
                jobsSnapshot.forEach((doc) => {
                    jobsList.push({ id: doc.id, type: 'vacancy', ...doc.data() })
                })
                
                // Также загружаем вакансии из posts (для совместимости)
                const postsJobsQuery = query(
                    collection(db, 'posts'),
                    where('communityId', '==', id),
                    where('type', 'in', ['vacancy', 'internship', 'project'])
                )
                const postsJobsSnapshot = await getDocs(postsJobsQuery)
                postsJobsSnapshot.forEach((doc) => {
                    jobsList.push({ id: doc.id, ...doc.data() })
                })
                
                // Добавляем моковые вакансии для этого сообщества
                const mockJobsForCommunity = fullMockPosts.filter(p => 
                    p.communityId === id && ['vacancy', 'internship', 'project'].includes(p.type)
                )
                jobsList.push(...mockJobsForCommunity)
                
                jobsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                setJobs(jobsList)
            } catch (error) {
                console.error('Error loading community:', error)
            } finally {
                setLoading(false)
            }
        }
        loadCommunity()
    }, [id, user])

    if (loading || !communityData) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-gray-600">Загрузка...</p>
                </div>
            </div>
        )
    }

    const community = communityData
    const isOwner = user && community.ownerUid === user.uid
    const isPublishBanned = community.publishBan?.enabled

    // Определяем вкладки динамически
    const tabs = []
    const hasPartnerships = partnerships.length > 0

    if (hasPartnerships) {
        tabs.push({ id: 'partnerships', label: 'Сотрудничество' })
        tabs.push({ id: 'jobs', label: 'Вакансии' })
        tabs.push({ id: 'posts', label: 'Публикации' })
    } else {
        tabs.push({ id: 'posts', label: 'Публикации' })
        tabs.push({ id: 'jobs', label: 'Вакансии' })
        tabs.push({ id: 'partnerships', label: 'Сотрудничество' })
    }

    // Добавляем кастомные табы
    if (community.customTabs) {
        community.customTabs.forEach(tab => {
            tabs.push({ id: tab.id, label: tab.label, custom: true })
        })
    }

    tabs.push({ id: 'employees', label: 'Сотрудники' })

    if (!activeTab && tabs.length > 0) {
        setActiveTab(tabs[0].id)
    }

    const handleAddTab = async () => {
        if (!newTabName.trim() || !isOwner) return
        
        try {
            const customTabs = community.customTabs || []
            const newTab = {
                id: `custom_${Date.now()}`,
                label: newTabName.trim()
            }
            customTabs.push(newTab)
            
            await updateDoc(doc(db, 'communities', id), { customTabs })
            setCommunityData({ ...community, customTabs })
            setNewTabName('')
            setShowAddTab(false)
            setToastMessage('Вкладка добавлена')
            setShowToast(true)
        } catch (error) {
            console.error('Error adding tab:', error)
        }
    }

    // Используем realPosts напрямую - они уже отфильтрованы по communityId
    const communityPosts = realPosts

    // Функция для правильного склонения "участников"
    const getMembersLabel = (count) => {
        if (count % 10 === 1 && count % 100 !== 11) return `${count} участник`
        if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return `${count} участника`
        return `${count} участников`
    }

    // Моковые сотрудники
    const mockEmployees = [
        {
            id: '1',
            userId: 'user1',
            userName: 'Алексей Петров',
            photoURL: null,
            title: 'Senior Frontend Developer',
            startDate: '2023-01-15',
            isCurrent: true,
            status: 'confirmed'
        },
        {
            id: '2',
            userId: 'user2',
            userName: 'Мария Иванова',
            photoURL: null,
            title: 'UI/UX Designer',
            startDate: '2023-06-01',
            isCurrent: true,
            status: 'confirmed'
        },
        {
            id: '3',
            userId: 'user3',
            userName: 'Дмитрий Козлов',
            photoURL: null,
            title: 'Backend Developer',
            startDate: '2022-09-01',
            endDate: '2024-01-31',
            isCurrent: false,
            status: 'confirmed'
        }
    ]

    const communityEmployees = employmentStore.communityEmployees[id] || []
    const allEmployees = [...mockEmployees, ...communityEmployees]
    const currentEmployees = allEmployees.filter(emp => emp.isCurrent)

    const handleEmployeeRequest = () => {
        if (!user) {
            setToastMessage('Войдите чтобы отправить запрос')
            setShowToast(true)
            return
        }

        if (!employeeForm.title || !employeeForm.startDate) {
            setToastMessage('Заполните все поля')
            setShowToast(true)
            return
        }

        requestEmployeeConfirmation(id, {
            userId: user.uid,
            userName: user.displayName || user.email,
            photoURL: user.photoURL,
            title: employeeForm.title,
            startDate: employeeForm.startDate,
            isCurrent: true
        })

        setToastMessage('Запрос отправлен на подтверждение!')
        setShowToast(true)
        setShowEmployeeModal(false)
        setEmployeeForm({ title: '', startDate: '' })
    }

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
        if (!user) {
            setToastMessage('Войдите чтобы присоединиться к сообществу')
            setShowToast(true)
            return
        }

        if (isJoined(id)) {
            leaveCommunity(id)
            setToastMessage('Вы покинули сообщество')
        } else {
            joinCommunity(id)
            setToastMessage('Вы присоединились к сообществу')
        }
        setShowToast(true)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
                <Card className="mb-4 sm:mb-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                            {community.logoUrl ? (
                                <img
                                    src={community.logoUrl}
                                    alt={community.title || community.name}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl flex-shrink-0">
                                    {(community.title || community.name || 'C').charAt(0)}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2 line-clamp-2">
                                    {community.title || community.name}
                                </h1>
                                <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-3">
                                    {community.description}
                                </p>
                                <div className="flex items-center text-gray-500 mb-3 text-sm sm:text-base">
                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                                    <span>{getMembersLabel(community.membersCount || 0)}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(community.tags || []).map((tag, i) => (
                                        <Badge key={i} variant="primary">{tag}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {!isOwner && (
                            <Button
                                variant={isJoined(id) ? 'outline' : 'primary'}
                                onClick={handleJoin}
                            >
                                {isJoined(id) ? 'Покинуть' : 'Присоединиться'}
                            </Button>
                        )}
                    </div>
                </Card>

                {/* Баннер о бане публикаций */}
                {isPublishBanned && (
                    <Card className="mb-6 bg-red-50 border-red-200">
                        <div className="flex items-start">
                            <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-red-900 mb-1">
                                    Публикации запрещены администратором
                                </h3>
                                <p className="text-sm text-red-700">
                                    <strong>Причина:</strong> {community.publishBan.reason}
                                </p>
                                {community.publishBan.updatedAt && (
                                    <p className="text-xs text-red-600 mt-2">
                                        Дата блокировки: {new Date(community.publishBan.updatedAt).toLocaleDateString('ru-RU')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Заявки на дружбу (для админов) */}
                {user && incomingRequestCommunities.length > 0 && (
                    <Card className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Heart className="w-5 h-5 mr-2 text-pink-600" />
                                Заявки на дружбу
                            </h3>
                            <Badge variant="primary">{incomingRequestCommunities.length}</Badge>
                        </div>
                        <div className="space-y-3">
                            {incomingRequestCommunities.map(friendCommunity => (
                                <div key={friendCommunity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                            {friendCommunity.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                to={`/community/${friendCommunity.id}`}
                                                className="font-medium text-gray-900 hover:text-indigo-600 block truncate"
                                            >
                                                {friendCommunity.name}
                                            </Link>
                                            <p className="text-xs text-gray-500">{friendCommunity.membersCount} участников</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-2">
                                        <button
                                            onClick={() => handleAcceptFriendship(friendCommunity.id)}
                                            className="p-1.5 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                                            title="Принять"
                                        >
                                            <Check className="w-4 h-4 text-green-600" />
                                        </button>
                                        <button
                                            onClick={() => handleRejectFriendship(friendCommunity.id)}
                                            className="p-1.5 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                                            title="Отклонить"
                                        >
                                            <X className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Дружественные сообщества */}
                {friendCommunities.length > 0 && (
                    <Card className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Heart className="w-5 h-5 mr-2 text-pink-600" />
                            Дружественные сообщества
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {friendCommunities.map(friendCommunity => (
                                <Link
                                    key={friendCommunity.id}
                                    to={`/community/${friendCommunity.id}`}
                                    className="flex flex-col items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-2">
                                        {friendCommunity.name.charAt(0)}
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 text-center truncate w-full">
                                        {friendCommunity.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{friendCommunity.membersCount}</p>
                                </Link>
                            ))}
                        </div>
                    </Card>
                )}

                <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

                {isOwner && showAddTab && (
                    <Card className="mt-4">
                        <div className="flex gap-2">
                            <Input
                                value={newTabName}
                                onChange={(e) => setNewTabName(e.target.value)}
                                placeholder="Название вкладки"
                                onKeyPress={(e) => e.key === 'Enter' && handleAddTab()}
                            />
                            <Button onClick={handleAddTab} size="sm">
                                Добавить
                            </Button>
                            <Button onClick={() => setShowAddTab(false)} variant="outline" size="sm">
                                Отмена
                            </Button>
                        </div>
                    </Card>
                )}

                {isOwner && !showAddTab && (
                    <div className="flex justify-end mt-4 px-4">
                        <Button onClick={() => setShowAddTab(true)} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Добавить вкладку
                        </Button>
                    </div>
                )}

                <div className="px-4 sm:px-6 lg:px-8">
                {activeTab === 'posts' && (
                    <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">Публикации</h2>
                            {isOwner && !isPublishBanned && (
                                <Link to="/create/post" className="w-full sm:w-auto">
                                    <Button size="sm" className="w-full sm:w-auto">
                                        <Plus className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">Создать публикацию</span>
                                        <span className="sm:hidden">Создать</span>
                                    </Button>
                                </Link>
                            )}
                        </div>
                        {communityPosts.length > 0 ? (
                            communityPosts.map(post => (
                                <PostCard key={post.id} post={post} communityOwnerId={community.ownerUid} />
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

                {activeTab === 'partnerships' && (
                    <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">Сотрудничество</h2>
                            {isOwner && !isPublishBanned && (
                                <Link to="/create/partnership" className="w-full sm:w-auto">
                                    <Button size="sm" className="w-full sm:w-auto">
                                        <Handshake className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">Создать предложение</span>
                                        <span className="sm:hidden">Создать</span>
                                    </Button>
                                </Link>
                            )}
                        </div>
                        {partnerships.length > 0 ? (
                            <div className="space-y-4">
                                {partnerships.map(partnership => (
                                    <PartnershipCard key={partnership.id} partnership={partnership} communityOwnerId={community.ownerUid} />
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">
                                        Предложения о сотрудничестве появятся здесь
                                    </p>
                                    {isOwner && !isPublishBanned && (
                                        <Link to="/create/partnership">
                                            <Button size="sm">
                                                <Handshake className="w-4 h-4 mr-2" />
                                                Создать предложение
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {activeTab === 'jobs' && (
                    <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">Вакансии</h2>
                            {isOwner && !isPublishBanned && (
                                <Link to="/create/vacancy" className="w-full sm:w-auto">
                                    <Button size="sm" className="w-full sm:w-auto">
                                        <Briefcase className="w-4 h-4 mr-2" />
                                        <span className="hidden sm:inline">Создать вакансию</span>
                                        <span className="sm:hidden">Создать</span>
                                    </Button>
                                </Link>
                            )}
                        </div>
                        {jobs.length > 0 ? (
                            jobs.map(job => (
                                <PostCard key={job.id} post={job} communityOwnerId={community.ownerUid} />
                            ))
                        ) : (
                            <Card>
                                <p className="text-gray-500 text-center py-8">
                                    Пока нет вакансий
                                </p>
                            </Card>
                        )}
                    </div>
                )}

                {activeTab === 'employees' && (
                    <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Сотрудники</h2>
                            <p className="text-gray-600 mt-1 mb-4">
                                {currentEmployees.length} сотрудников работают в компании
                            </p>
                            {isJoined(id) && user && (
                                <Button size="sm" onClick={() => setShowEmployeeModal(true)} className="w-full sm:w-auto">
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    Запросить подтверждение
                                </Button>
                            )}
                        </div>

                        {currentEmployees.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentEmployees.map(employee => (
                                    <Card key={employee.id}>
                                        <div className="flex items-start space-x-4">
                                            <Avatar
                                                src={employee.photoURL}
                                                alt={employee.userName}
                                                size="lg"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    to={`/profile/${employee.userId}`}
                                                    className="font-semibold text-gray-900 hover:text-indigo-600 block truncate"
                                                >
                                                    {employee.userName}
                                                </Link>
                                                <p className="text-sm text-gray-600 mb-2 truncate">
                                                    {employee.title}
                                                </p>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                    <Badge variant="success" className="text-xs">
                                                        <Shield className="w-3 h-3 mr-1" />
                                                        Подтверждено
                                                    </Badge>
                                                    <span>
                                                        с {new Date(employee.startDate).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card>
                                <div className="text-center py-12">
                                    <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-lg font-medium text-gray-900 mb-2">
                                        Нет подтвержденных сотрудников
                                    </p>
                                    <p className="text-gray-600 mb-4">
                                        Работаете в этой компании? Запросите подтверждение
                                    </p>
                                    {isJoined(id) && user && (
                                        <Button onClick={() => setShowEmployeeModal(true)}>
                                            <Briefcase className="w-4 h-4 mr-2" />
                                            Запросить подтверждение
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* История бывших сотрудников */}
                        {allEmployees.filter(emp => !emp.isCurrent).length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Ранее работали
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {allEmployees.filter(emp => !emp.isCurrent).map(employee => (
                                        <Card key={employee.id} className="opacity-75">
                                            <div className="flex items-start space-x-4">
                                                <Avatar
                                                    src={employee.photoURL}
                                                    alt={employee.userName}
                                                    size="lg"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        to={`/profile/${employee.userId}`}
                                                        className="font-semibold text-gray-900 hover:text-indigo-600 block truncate"
                                                    >
                                                        {employee.userName}
                                                    </Link>
                                                    <p className="text-sm text-gray-600 mb-2 truncate">
                                                        {employee.title}
                                                    </p>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(employee.startDate).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}
                                                        {' — '}
                                                        {employee.endDate && new Date(employee.endDate).toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'chats' && (
                    <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Чаты</h2>
                            {isJoined(id) && (
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-2" />
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

                {tabs.find(t => t.custom && t.id === activeTab) && (
                    <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <Card>
                            <p className="text-gray-500 text-center py-8">
                                Пользовательская вкладка. Здесь вы можете добавить свой контент.
                            </p>
                        </Card>
                    </div>
                )}
                </div>
            </div>

            {/* Модальное окно запроса подтверждения */}
            <Modal
                show={showEmployeeModal}
                onClose={() => {
                    setShowEmployeeModal(false)
                    setEmployeeForm({ title: '', startDate: '' })
                }}
                title="Запрос на подтверждение сотрудника"
                size="md"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Отправьте запрос администратору сообщества для подтверждения вашего места работы
                    </p>
                    <Input
                        label="Должность"
                        value={employeeForm.title}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Frontend Developer"
                        required
                    />
                    <Input
                        label="Дата начала работы"
                        type="date"
                        value={employeeForm.startDate}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                    />
                    <div className="flex space-x-3 pt-4">
                        <Button
                            onClick={handleEmployeeRequest}
                            className="flex-1"
                        >
                            Отправить запрос
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowEmployeeModal(false)
                                setEmployeeForm({ title: '', startDate: '' })
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
