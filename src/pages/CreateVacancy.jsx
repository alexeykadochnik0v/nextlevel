import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { db, storage } from '../lib/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Toast from '../components/Toast'
import { ArrowLeft, Upload, X, Briefcase, MapPin, DollarSign } from 'lucide-react'

const CATEGORIES = [
    'Разработка', 'Дизайн', 'Маркетинг', 'Продажи', 'HR', 'Финансы',
    'Управление', 'Аналитика', 'Поддержка', 'Производство', 'Другое'
]

const SKILLS_OPTIONS = [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++', 'Go',
    'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
    'Machine Learning', 'Data Science', 'UI/UX Design', 'Figma', 'Photoshop',
    'Project Management', 'Agile', 'Scrum', 'Marketing', 'SEO', 'Content Writing'
]

export default function CreateVacancy() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [uploading, setUploading] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [userCommunities, setUserCommunities] = useState([])
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({
        communityId: '',
        title: '',
        category: '',
        description: '',
        requirements: [],
        workFormat: 'hybrid',
        employmentType: 'full',
        location: '',
        salaryFrom: '',
        salaryTo: '',
        currency: 'RUB',
        validUntil: '',
        attachments: []
    })

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }

        if (user.role !== 'employer' && user.role !== 'admin') {
            navigate('/create')
            return
        }

        loadUserCommunities()
    }, [user, navigate])

    const loadUserCommunities = async () => {
        try {
            const q = query(
                collection(db, 'communities'),
                where('ownerUid', '==', user.uid),
                where('status', '==', 'active')
            )
            const snapshot = await getDocs(q)
            const communities = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setUserCommunities(communities)

            if (communities.length === 1) {
                handleInputChange('communityId', communities[0].id)
            }
        } catch (error) {
            console.error('Error loading communities:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSkillToggle = (skill) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.includes(skill)
                ? prev.requirements.filter(s => s !== skill)
                : [...prev.requirements, skill]
        }))
    }

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files)
        if (!files.length) return

        // Проверка количества
        if (formData.attachments.length + files.length > 5) {
            setToastMessage('Максимум 5 файлов')
            setShowToast(true)
            return
        }

        // Проверка размера
        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                setToastMessage('Файл слишком большой. Максимум 10 МБ')
                setShowToast(true)
                return
            }
        }

        handleInputChange('attachments', [...formData.attachments, ...files])
    }

    const removeFile = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e, isDraft = false) => {
        e.preventDefault()

        if (!formData.communityId) {
            setToastMessage('Выберите сообщество')
            setShowToast(true)
            return
        }

        if (!formData.title || !formData.category || !formData.description) {
            setToastMessage('Заполните все обязательные поля')
            setShowToast(true)
            return
        }

        setUploading(true)

        try {
            // Загрузка файлов
            const uploadedAttachments = []
            for (const file of formData.attachments) {
                const fileRef = ref(storage, `vacancies/${user.uid}/${Date.now()}_${file.name}`)
                await uploadBytes(fileRef, file)
                const url = await getDownloadURL(fileRef)
                uploadedAttachments.push({
                    type: file.type.includes('pdf') ? 'pdf' : 'image',
                    url,
                    name: file.name
                })
            }

            // Создание вакансии
            const vacancyData = {
                communityId: formData.communityId,
                authorId: user.uid,
                title: formData.title,
                category: formData.category,
                description: formData.description,
                requirements: formData.requirements,
                terms: {
                    format: formData.workFormat,
                    salaryFrom: formData.salaryFrom ? parseInt(formData.salaryFrom) : null,
                    salaryTo: formData.salaryTo ? parseInt(formData.salaryTo) : null,
                    currency: formData.currency
                },
                location: formData.location,
                employmentType: formData.employmentType,
                validUntil: formData.validUntil || null,
                attachments: uploadedAttachments,
                status: isDraft ? 'draft' : 'published',
                applicationsCount: 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }

            await addDoc(collection(db, 'jobs'), vacancyData)

            setToastMessage(isDraft ? 'Вакансия сохранена как черновик' : 'Вакансия успешно опубликована!')
            setShowToast(true)

            setTimeout(() => {
                navigate(`/community/${formData.communityId}`)
            }, 1500)

        } catch (error) {
            console.error('Error creating vacancy:', error)
            setToastMessage('Ошибка при создании вакансии')
            setShowToast(true)
        } finally {
            setUploading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <p className="text-gray-600">Загрузка...</p>
                </div>
            </div>
        )
    }

    if (userCommunities.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Card className="text-center py-12">
                        <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Нет активных сообществ
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Для создания вакансии необходимо иметь активное сообщество компании
                        </p>
                        <Button onClick={() => navigate('/create/community')}>
                            Создать сообщество
                        </Button>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Создать вакансию</h1>
                    <p className="text-gray-600">
                        Разместите предложение о работе для привлечения талантов
                    </p>
                </div>

                <form onSubmit={(e) => handleSubmit(e, false)}>
                    <Card className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Основная информация</h2>

                        <div className="space-y-6">
                            {/* Сообщество */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Сообщество *
                                </label>
                                <select
                                    value={formData.communityId}
                                    onChange={(e) => handleInputChange('communityId', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Выберите сообщество</option>
                                    {userCommunities.map(community => (
                                        <option key={community.id} value={community.id}>
                                            {community.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Название вакансии */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Название вакансии *
                                </label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Например: Senior Frontend Developer"
                                    required
                                />
                            </div>

                            {/* Категория */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Категория *
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Выберите категорию</option>
                                    {CATEGORIES.map(category => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Описание */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Описание вакансии *
                                </label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Опишите обязанности, задачи и требования к кандидату..."
                                    rows={6}
                                    required
                                />
                            </div>

                            {/* Требования/Навыки */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Требуемые навыки
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SKILLS_OPTIONS.map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => handleSkillToggle(skill)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.requirements.includes(skill)
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Условия работы</h2>

                        <div className="space-y-6">
                            {/* Формат работы */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Формат работы
                                </label>
                                <div className="flex gap-4">
                                    {[
                                        { value: 'office', label: 'Офис' },
                                        { value: 'remote', label: 'Удаленно' },
                                        { value: 'hybrid', label: 'Гибрид' }
                                    ].map(option => (
                                        <label key={option.value} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="workFormat"
                                                value={option.value}
                                                checked={formData.workFormat === option.value}
                                                onChange={(e) => handleInputChange('workFormat', e.target.value)}
                                                className="mr-2"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Тип занятости */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Тип занятости
                                </label>
                                <div className="flex gap-4">
                                    {[
                                        { value: 'full', label: 'Полная' },
                                        { value: 'part', label: 'Частичная' },
                                        { value: 'intern', label: 'Стажировка' }
                                    ].map(option => (
                                        <label key={option.value} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="employmentType"
                                                value={option.value}
                                                checked={formData.employmentType === option.value}
                                                onChange={(e) => handleInputChange('employmentType', e.target.value)}
                                                className="mr-2"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Локация */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Локация
                                </label>
                                <Input
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                    placeholder="Город, страна"
                                />
                            </div>

                            {/* Зарплата */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-1" />
                                    Зарплата
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input
                                        type="number"
                                        value={formData.salaryFrom}
                                        onChange={(e) => handleInputChange('salaryFrom', e.target.value)}
                                        placeholder="От"
                                    />
                                    <Input
                                        type="number"
                                        value={formData.salaryTo}
                                        onChange={(e) => handleInputChange('salaryTo', e.target.value)}
                                        placeholder="До"
                                    />
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => handleInputChange('currency', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="RUB">₽ RUB</option>
                                        <option value="USD">$ USD</option>
                                        <option value="EUR">€ EUR</option>
                                    </select>
                                </div>
                            </div>

                            {/* Срок актуальности */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Срок актуальности (необязательно)
                                </label>
                                <Input
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Файлы */}
                    <Card className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Дополнительные материалы</h2>

                        {formData.attachments.length > 0 && (
                            <div className="mb-4 space-y-2">
                                {formData.attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-700">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <label className="cursor-pointer">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <p className="text-sm text-gray-600 mb-2">
                                    Загрузите файлы (PDF, JPG, PNG)
                                </p>
                                <p className="text-xs text-gray-500">Максимум 5 файлов по 10 МБ</p>
                            </div>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </Card>

                    {/* Кнопки */}
                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={uploading}
                            className="flex-1"
                        >
                            {uploading ? 'Публикация...' : 'Опубликовать вакансию'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => handleSubmit(e, true)}
                            disabled={uploading}
                        >
                            Сохранить черновик
                        </Button>
                    </div>
                </form>
            </div>

            {showToast && (
                <Toast
                    message={toastMessage}
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    )
}

