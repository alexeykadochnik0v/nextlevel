import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, FileText, Calendar, Briefcase, Users } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Create() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [selectedType, setSelectedType] = useState(null)
    const [isVerified, setIsVerified] = useState(false)
    const [loading, setLoading] = useState(true)

    // Загружаем актуальные данные о верификации из Firestore
    useEffect(() => {
        const checkVerification = async () => {
            if (!user) {
                setLoading(false)
                return
            }

            // Администраторы всегда верифицированы
            if (user.role === 'admin') {
                setIsVerified(true)
                setLoading(false)
                return
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid))
                if (userDoc.exists()) {
                    const userData = userDoc.data()
                    const studentVerified = userData.verification?.student?.status === 'approved'
                    const employerVerified = userData.verification?.employer?.status === 'approved'
                    setIsVerified(studentVerified || employerVerified)
                }
            } catch (error) {
                console.error('Error checking verification:', error)
            } finally {
                setLoading(false)
            }
        }

        checkVerification()
    }, [user])

    // Определяем доступные опции в зависимости от роли
    const getCreateOptions = () => {
        const options = []

        // Публикация - доступна всем верифицированным с сообществом
        options.push({
            id: 'post',
            title: 'Публикация',
            description: 'Поделиться мыслями, новостями или опытом',
            icon: FileText,
            color: 'bg-blue-500',
            available: isVerified,
            requiresVerification: !isVerified
        })

        // Для студентов - Резюме
        if (user?.role === 'user' || !user?.role) {
            options.push({
                id: 'resume',
                title: 'Резюме',
                description: 'Создать или обновить резюме',
                icon: Briefcase,
                color: 'bg-green-500',
                available: true
            })
        }

        // Для работодателей - Вакансия
        if (user?.role === 'employer' || user?.role === 'admin') {
            options.push({
                id: 'vacancy',
                title: 'Вакансия',
                description: 'Разместить предложение о работе',
                icon: Briefcase,
                color: 'bg-purple-500',
                available: isVerified,
                requiresVerification: !isVerified
            })
        }

        // Сотрудничество - только для верифицированных с сообществом
        options.push({
            id: 'partnership',
            title: 'Сотрудничество',
            description: 'Предложить партнерство',
            icon: Users,
            color: 'bg-indigo-500',
            available: isVerified,
            requiresVerification: !isVerified
        })

        // Мероприятие - скоро
        options.push({
            id: 'event',
            title: 'Мероприятие',
            description: 'Создать событие или встречу',
            icon: Calendar,
            color: 'bg-yellow-500',
            available: false
        })

        // Сообщество - только для верифицированных
        options.push({
            id: 'community',
            title: 'Сообщество',
            description: 'Создать новое сообщество',
            icon: Users,
            color: 'bg-orange-500',
            available: isVerified,
            requiresVerification: !isVerified
        })

        return options
    }

    const createOptions = getCreateOptions()

    const handleCreate = (type) => {
        const option = createOptions.find(opt => opt.id === type)

        if (!option) return

        // Если требуется верификация
        if (option.requiresVerification) {
            navigate('/verification')
            return
        }

        if (!option.available) {
            return
        }

        // Навигация по типам контента
        switch (type) {
            case 'community':
                navigate('/create/community')
                break
            case 'resume':
                navigate('/create/resume')
                break
            case 'vacancy':
                navigate('/create/vacancy')
                break
            case 'partnership':
                navigate('/create/partnership')
                break
            case 'post':
                navigate('/create/post')
                break
            default:
                console.log('Creating:', type)
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Создать контент
                    </h1>
                    <p className="text-gray-600">
                        Выберите тип контента, который хотите создать
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {createOptions.map((option) => {
                        const Icon = option.icon
                        return (
                            <Card
                                key={option.id}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${option.available
                                    ? 'hover:scale-105'
                                    : 'opacity-50 cursor-not-allowed'
                                    } ${selectedType === option.id ? 'ring-2 ring-indigo-500' : ''
                                    }`}
                                onClick={() => option.available && handleCreate(option.id)}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className={`${option.color} p-3 rounded-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {option.title}
                                            {option.requiresVerification && (
                                                <span className="ml-2 text-sm text-orange-600">(Требуется верификация)</span>
                                            )}
                                            {!option.available && !option.requiresVerification && (
                                                <span className="ml-2 text-sm text-gray-500">(Скоро)</span>
                                            )}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {option.description}
                                        </p>
                                        {option.requiresVerification && (
                                            <p className="text-xs text-orange-600 mt-2">
                                                Создание сообществ доступно только верифицированным работодателям или студентам. Пройдите верификацию в профиле.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {(option.available || option.requiresVerification) && (
                                    <div className="mt-4">
                                        <Button
                                            size="sm"
                                            className="w-full"
                                            variant={option.requiresVerification ? "outline" : "default"}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleCreate(option.id)
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            {option.requiresVerification
                                                ? 'Пройти верификацию'
                                                : 'Создать'
                                            }
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>

                <div className="mt-8 p-6 bg-indigo-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-900 mb-2">
                        💡 Совет
                    </h3>
                    <p className="text-indigo-700 text-sm">
                        {user?.role === 'employer'
                            ? 'Вы можете создавать вакансии и предложения о сотрудничестве после верификации.'
                            : 'Вы можете создать резюме и публикации. Для создания сообщества пройдите верификацию.'
                        }
                    </p>
                </div>
            </div>
        </div>
    )
}
