import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Briefcase, MapPin, Clock, DollarSign, Shield, Building, FileText, Send, CheckCircle, ChevronRight, Home } from 'lucide-react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import useJobApplicationsStore from '../store/jobApplicationsStore'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Textarea from '../components/ui/Textarea'
import Toast from '../components/Toast'

export default function Vacancy() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { submitApplication } = useJobApplicationsStore()
    
    const [vacancy, setVacancy] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showApplicationModal, setShowApplicationModal] = useState(false)
    const [coverLetter, setCoverLetter] = useState('')
    const [portfolioUrl, setPortfolioUrl] = useState('')
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [hasApplied, setHasApplied] = useState(false)

    useEffect(() => {
        const loadVacancy = async () => {
            try {
                const vacancyDoc = await getDoc(doc(db, 'jobs', id))
                if (vacancyDoc.exists()) {
                    setVacancy({ id: vacancyDoc.id, ...vacancyDoc.data() })
                } else {
                    // Моковые данные для демонстрации
                    setVacancy({
                        id,
                        title: 'Frontend разработчик (React)',
                        category: 'Разработка',
                        description: `Мы ищем талантливого Frontend разработчика для работы над амбициозным проектом.

Обязанности:
- Разработка пользовательских интерфейсов на React
- Интеграция с REST API
- Оптимизация производительности приложений
- Код-ревью и менторинг junior разработчиков

Требования:
- Опыт работы с React от 2 лет
- Знание TypeScript
- Опыт работы с Redux или другими state managers
- Понимание принципов адаптивной верстки`,
                        requirements: ['React', 'TypeScript', 'Redux', 'REST API', 'Git'],
                        terms: {
                            format: 'hybrid',
                            salaryFrom: 150000,
                            salaryTo: 250000,
                            currency: 'RUB'
                        },
                        location: 'Москва',
                        employmentType: 'full',
                        communityId: '1',
                        communityName: 'IT & Tech',
                        authorId: 'employer1',
                        authorName: 'ПромТех Групп',
                        authorVerified: true,
                        status: 'published',
                        createdAt: new Date().toISOString()
                    })
                }
            } catch (error) {
                console.error('Error loading vacancy:', error)
            } finally {
                setLoading(false)
            }
        }

        loadVacancy()
    }, [id])

    const handleApply = async () => {
        if (!user) {
            setToastMessage('Войдите в систему для отклика на вакансию')
            setShowToast(true)
            setTimeout(() => navigate('/login'), 2000)
            return
        }

        if (user.role === 'employer') {
            setToastMessage('Работодатели не могут откликаться на вакансии')
            setShowToast(true)
            return
        }

        if (!coverLetter.trim()) {
            setToastMessage('Напишите сопроводительное письмо')
            setShowToast(true)
            return
        }

        setSubmitting(true)
        try {
            // Получаем резюме пользователя
            const userDoc = await getDoc(doc(db, 'users', user.uid))
            const userData = userDoc.data()
            const resume = userData.resume || {}

            await submitApplication({
                jobId: vacancy.id,
                jobTitle: vacancy.title,
                employerId: vacancy.authorId,
                applicantId: user.uid,
                applicantName: user.displayName || user.email,
                applicantEmail: user.email,
                applicantPhotoURL: user.photoURL || null,
                coverLetter: coverLetter.trim(),
                portfolioUrl: portfolioUrl.trim() || null,
                portfolioSnapshot: {
                    skills: resume.skills || [],
                    projects: resume.projects || [],
                    level: userData.level || 1
                }
            })

            setHasApplied(true)
            setShowApplicationModal(false)
            setToastMessage('Отклик успешно отправлен!')
            setShowToast(true)
            setCoverLetter('')
            setPortfolioUrl('')
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

    if (!vacancy) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-gray-600">Вакансия не найдена</p>
                </div>
            </div>
        )
    }

    const formatSalary = () => {
        const { salaryFrom, salaryTo, currency } = vacancy.terms
        const currencySymbol = currency === 'RUB' ? '₽' : currency === 'USD' ? '$' : '€'
        
        if (salaryFrom && salaryTo) {
            return `${salaryFrom.toLocaleString()} - ${salaryTo.toLocaleString()} ${currencySymbol}`
        } else if (salaryFrom) {
            return `от ${salaryFrom.toLocaleString()} ${currencySymbol}`
        }
        return 'Не указана'
    }

    const formatEmploymentType = (type) => {
        const types = {
            full: 'Полная занятость',
            part: 'Частичная занятость',
            internship: 'Стажировка'
        }
        return types[type] || type
    }

    const formatWorkFormat = (format) => {
        const formats = {
            office: 'В офисе',
            remote: 'Удаленно',
            hybrid: 'Гибрид'
        }
        return formats[format] || format
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumbs */}
                <nav className="mb-6 overflow-x-auto">
                    <ol className="flex items-center space-x-2 text-sm whitespace-nowrap">
                        <li>
                            <Link to="/" className="text-gray-500 hover:text-indigo-600 flex items-center">
                                <Home className="w-4 h-4" />
                            </Link>
                        </li>
                        {vacancy.communityId && !vacancy.communityId.startsWith('comm') && (
                            <>
                                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <li>
                                    <Link 
                                        to={`/community/${vacancy.communityId}`}
                                        className="text-gray-500 hover:text-indigo-600"
                                    >
                                        {vacancy.communityName || 'Сообщество'}
                                    </Link>
                                </li>
                            </>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <li className="text-gray-900 font-medium truncate max-w-xs">
                            {vacancy.title}
                        </li>
                    </ol>
                </nav>

                <Card className="mb-6">
                    <div className="mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                    {vacancy.title}
                                </h1>
                                <div className="flex items-center space-x-3 mb-3">
                                    <Link
                                        to={`/community/${vacancy.communityId}`}
                                        className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
                                    >
                                        <Building className="w-4 h-4 mr-1" />
                                        {vacancy.communityName}
                                    </Link>
                                    {vacancy.authorVerified && (
                                        <Badge variant="success" className="flex items-center">
                                            <Shield className="w-3 h-3 mr-1" />
                                            Верифицирован
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <Badge variant="success" className="flex items-center">
                                <Briefcase className="w-4 h-4 mr-1" />
                                Вакансия
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center text-gray-700">
                                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                                <span>{formatSalary()}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                                <span>{vacancy.location}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                                <span>{formatEmploymentType(vacancy.employmentType)}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                                <FileText className="w-5 h-5 mr-2 text-purple-600" />
                                <span>{formatWorkFormat(vacancy.terms.format)}</span>
                            </div>
                        </div>

                        {hasApplied ? (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
                                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                                <div>
                                    <p className="font-medium text-green-900">Отклик отправлен!</p>
                                    <p className="text-sm text-green-700">Работодатель рассмотрит вашу заявку</p>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={() => setShowApplicationModal(true)}
                                className="w-full md:w-auto"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Откликнуться на вакансию
                            </Button>
                        )}
                    </div>
                </Card>

                <Card className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Описание</h2>
                    <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                        {vacancy.description}
                    </div>
                </Card>

                {vacancy.requirements && vacancy.requirements.length > 0 && (
                    <Card className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Требуемые навыки</h2>
                        <div className="flex flex-wrap gap-2">
                            {vacancy.requirements.map((skill, index) => (
                                <Badge key={index} variant="primary">{skill}</Badge>
                            ))}
                        </div>
                    </Card>
                )}

                <Card>
                    <div className="text-sm text-gray-500">
                        <p>Опубликовано: {vacancy.createdAt?.toDate ? vacancy.createdAt.toDate().toLocaleDateString('ru-RU') : new Date(vacancy.createdAt).toLocaleDateString('ru-RU')}</p>
                        {vacancy.validUntil && (
                            <p className="mt-1">
                                Актуально до: {vacancy.validUntil?.toDate ? vacancy.validUntil.toDate().toLocaleDateString('ru-RU') : new Date(vacancy.validUntil).toLocaleDateString('ru-RU')}
                            </p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Модальное окно отклика */}
            <Modal
                show={showApplicationModal}
                onClose={() => setShowApplicationModal(false)}
                title="Откликнуться на вакансию"
                size="lg"
            >
                <div className="space-y-4">
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <p className="text-sm text-indigo-900 font-medium mb-1">
                            Вакансия: {vacancy.title}
                        </p>
                        <p className="text-sm text-indigo-700">
                            Работодатель: {vacancy.authorName}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Сопроводительное письмо *
                        </label>
                        <Textarea
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="Расскажите, почему вы подходите на эту вакансию..."
                            rows={6}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ссылка на портфолио/резюме (необязательно)
                        </label>
                        <input
                            type="url"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            placeholder="https://..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex space-x-3">
                        <Button
                            onClick={handleApply}
                            disabled={submitting || !coverLetter.trim()}
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
