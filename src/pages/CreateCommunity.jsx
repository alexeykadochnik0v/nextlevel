import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, ArrowLeft, Users, Building, GraduationCap } from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, setDoc, collection, addDoc, getDoc } from 'firebase/firestore'
import { storage, db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import useVerificationStore from '../store/verificationStore'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Toast from '../components/Toast'

const TAGS_OPTIONS = [
    'AI', 'Robotics', 'Web Development', 'Mobile Development', 'Data Science',
    'Cybersecurity', 'Blockchain', 'Game Development', 'UI/UX Design',
    'Marketing', 'Business', 'Startups', 'IoT', 'Machine Learning',
    'DevOps', 'Cloud Computing', 'AR/VR', 'Fintech', 'EdTech', 'HealthTech'
]

export default function CreateCommunity() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { userVerification, setVerification } = useVerificationStore()

    const [uploading, setUploading] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')

    const defaultCategory = user?.role === 'employer' ? 'company' : 'student_team'

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: defaultCategory,
        tags: [],
        logoFile: null,
        coverFile: null
    })

    // Загружаем верификацию из Firestore
    useEffect(() => {
        if (user) {
            getDoc(doc(db, 'users', user.uid)).then(userDoc => {
                if (userDoc.exists() && userDoc.data().verification) {
                    setVerification(userDoc.data().verification)
                }
            })
        }
    }, [user, setVerification])

    const isVerified = user && (
        (user.role === 'user' && userVerification.student.status === 'approved') ||
        (user.role === 'employer' && userVerification.employer.status === 'approved') ||
        user.role === 'admin'
    )

    useEffect(() => {
        if (user && !isVerified) {
            navigate('/create')
        }
    }, [user, isVerified, navigate])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleFileUpload = async (file, type) => {
        if (!file) return null

        if (file.size > 10 * 1024 * 1024) {
            setToastMessage('Файл не должен превышать 10 МБ')
            setShowToast(true)
            return null
        }

        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
            setToastMessage('Допустимые форматы: JPG, PNG')
            setShowToast(true)
            return null
        }

        try {
            const fileExt = file.name.split('.').pop()
            const filePath = `communities/${user.uid}/${type}.${fileExt}`
            const storageRef = ref(storage, filePath)

            await uploadBytes(storageRef, file)
            return await getDownloadURL(storageRef)
        } catch (error) {
            console.error('Error uploading file:', error)
            setToastMessage('Ошибка при загрузке файла')
            setShowToast(true)
            return null
        }
    }

    const handleLogoChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData(prev => ({ ...prev, logoFile: file }))
        }
    }

    const handleCoverChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFormData(prev => ({ ...prev, coverFile: file }))
        }
    }

    const handleTagToggle = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag].slice(0, 5) // Максимум 5 тегов
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.title.trim() || !formData.description.trim()) {
            setToastMessage('Заполните все обязательные поля')
            setShowToast(true)
            return
        }

        setUploading(true)
        try {
            // Загружаем файлы
            const logoUrl = await handleFileUpload(formData.logoFile, 'logo')
            const coverUrl = await handleFileUpload(formData.coverFile, 'cover')

            // Все сообщества создаются сразу активными
            const status = 'active'

            // Создаем документ сообщества
            const communityData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                logoUrl: logoUrl || '',
                coverUrl: coverUrl || '',
                tags: formData.tags,
                category: formData.category,
                ownerUid: user.uid,
                ownerEmail: user.email,
                ownerName: user.displayName || user.email,
                verifiedEmployer: userVerification.employer.status === 'approved',
                status,
                membersCount: 1,
                publishBan: {
                    enabled: false,
                    reason: '',
                    updatedAt: null,
                    updatedBy: null
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            const docRef = await addDoc(collection(db, 'communities'), communityData)

            setToastMessage('Сообщество создано успешно!')
            setShowToast(true)

            // Перенаправляем на страницу сообщества
            setTimeout(() => {
                navigate(`/community/${docRef.id}`)
            }, 1500)

        } catch (error) {
            console.error('Error creating community:', error)
            setToastMessage('Ошибка при создании сообщества')
            setShowToast(true)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <button
                    onClick={() => navigate('/create')}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад к созданию
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Создать сообщество
                    </h1>
                    <p className="text-gray-600">
                        Создайте новое сообщество для объединения единомышленников
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <div className="space-y-6">
                            {/* Название */}
                            <Input
                                label="Название сообщества *"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Например: IT-сообщество Москвы"
                                required
                            />

                            {/* Описание */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Краткое описание *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Опишите цели и тематику сообщества..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                    required
                                />
                            </div>

                            {/* Категория - определяется автоматически по роли */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Тип сообщества
                                </label>
                                <div className="p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50">
                                    <div className="flex items-center space-x-3">
                                        {formData.category === 'company' ? (
                                            <>
                                                <Building className="w-6 h-6 text-indigo-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900">Компания/организация</p>
                                                    <p className="text-sm text-gray-600">Корпоративное сообщество</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <GraduationCap className="w-6 h-6 text-green-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900">Студенческая команда/проект</p>
                                                    <p className="text-sm text-gray-600">Учебное сообщество</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Тип сообщества определяется автоматически на основе вашей роли
                                    </p>
                                </div>
                            </div>

                            {/* Теги */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Направления (до 5 тегов)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {TAGS_OPTIONS.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => handleTagToggle(tag)}
                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${formData.tags.includes(tag)
                                                ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-200'
                                                : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                                                }`}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                                {formData.tags.length > 0 && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Выбрано: {formData.tags.length}/5
                                    </p>
                                )}
                            </div>

                            {/* Логотип */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Логотип (необязательно)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                        id="logo-file"
                                    />
                                    <label htmlFor="logo-file" className="cursor-pointer">
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600 mb-1">
                                            {formData.logoFile ? formData.logoFile.name : 'Загрузить логотип'}
                                        </p>
                                        <p className="text-xs text-gray-500">JPG или PNG (макс. 10 МБ)</p>
                                    </label>
                                </div>
                            </div>

                            {/* Обложка */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Обложка (необязательно)
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleCoverChange}
                                        className="hidden"
                                        id="cover-file"
                                    />
                                    <label htmlFor="cover-file" className="cursor-pointer">
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-600 mb-1">
                                            {formData.coverFile ? formData.coverFile.name : 'Загрузить обложку'}
                                        </p>
                                        <p className="text-xs text-gray-500">JPG или PNG (макс. 10 МБ)</p>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/create')}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading}
                        >
                            {uploading ? 'Создание...' : 'Создать сообщество'}
                        </Button>
                    </div>
                </form>

            </div>

            <Toast
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
            />
        </div>
    )
}