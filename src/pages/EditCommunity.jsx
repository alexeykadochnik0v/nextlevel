import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, ArrowLeft, Building, GraduationCap } from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { storage, db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
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

export default function EditCommunity() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [community, setCommunity] = useState(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'company',
        tags: [],
        logoFile: null,
        coverFile: null,
        logoUrl: '',
        coverUrl: ''
    })

    useEffect(() => {
        loadCommunity()
    }, [id])

    const loadCommunity = async () => {
        try {
            const docRef = doc(db, 'communities', id)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()

                // Проверяем права доступа
                if (data.ownerUid !== user?.uid && user?.role !== 'admin') {
                    setToastMessage('У вас нет прав на редактирование этого сообщества')
                    setShowToast(true)
                    navigate('/')
                    return
                }

                setCommunity({ id: docSnap.id, ...data })
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    category: data.category || 'company',
                    tags: data.tags || [],
                    logoFile: null,
                    coverFile: null,
                    logoUrl: data.logoUrl || '',
                    coverUrl: data.coverUrl || ''
                })
            } else {
                setToastMessage('Сообщество не найдено')
                setShowToast(true)
                navigate('/')
            }
        } catch (error) {
            console.error('Error loading community:', error)
            setToastMessage('Ошибка при загрузке сообщества')
            setShowToast(true)
        } finally {
            setLoading(false)
        }
    }

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
            const filePath = `communities/${user.uid}/${type}-${Date.now()}.${fileExt}`
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
                : [...prev.tags, tag].slice(0, 5)
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
            // Загружаем новые файлы, если они были выбраны
            let logoUrl = formData.logoUrl
            let coverUrl = formData.coverUrl

            if (formData.logoFile) {
                const newLogoUrl = await handleFileUpload(formData.logoFile, 'logo')
                if (newLogoUrl) logoUrl = newLogoUrl
            }

            if (formData.coverFile) {
                const newCoverUrl = await handleFileUpload(formData.coverFile, 'cover')
                if (newCoverUrl) coverUrl = newCoverUrl
            }

            // Обновляем документ сообщества
            const updateData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                logoUrl,
                coverUrl,
                tags: formData.tags,
                updatedAt: new Date().toISOString()
            }

            await updateDoc(doc(db, 'communities', id), updateData)

            setToastMessage('Сообщество успешно обновлено!')
            setShowToast(true)

            setTimeout(() => {
                navigate(`/profile/${user.uid}`)
            }, 2000)

        } catch (error) {
            console.error('Error updating community:', error)
            setToastMessage('Ошибка при обновлении сообщества')
            setShowToast(true)
        } finally {
            setUploading(false)
        }
    }

    const handleResubmit = async () => {
        try {
            await updateDoc(doc(db, 'communities', id), {
                status: 'pending_review',
                updatedAt: new Date().toISOString()
            })

            setToastMessage('Сообщество отправлено на повторную модерацию')
            setShowToast(true)

            setTimeout(() => {
                navigate(`/profile/${user.uid}`)
            }, 2000)
        } catch (error) {
            console.error('Error resubmitting community:', error)
            setToastMessage('Ошибка при отправке на модерацию')
            setShowToast(true)
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
                <button
                    onClick={() => navigate(`/profile/${user.uid}`)}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад к профилю
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Редактировать сообщество
                    </h1>
                    <p className="text-gray-600">
                        Внесите изменения в информацию о сообществе
                    </p>
                </div>

                {/* Статус сообщества */}
                {community?.status === 'pending_review' && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 font-medium">
                            ⏳ Сообщество на модерации
                        </p>
                        <p className="text-yellow-700 text-sm mt-1">
                            Ваше сообщество находится на проверке. Публикации и вакансии будут доступны после одобрения.
                        </p>
                    </div>
                )}

                {community?.status === 'rejected' && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-medium">
                            ❌ Сообщество отклонено
                        </p>
                        {community.reason && (
                            <p className="text-red-700 text-sm mt-1">
                                Причина: {community.reason}
                            </p>
                        )}
                        <p className="text-red-700 text-sm mt-2">
                            Внесите необходимые изменения и отправьте на повторную модерацию.
                        </p>
                    </div>
                )}

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

                            {/* Категория (только для отображения) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Тип сообщества (нельзя изменить)
                                </label>
                                <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
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
                                    Логотип
                                </label>
                                {formData.logoUrl && !formData.logoFile && (
                                    <div className="mb-3">
                                        <img src={formData.logoUrl} alt="Current logo" className="w-24 h-24 rounded-lg object-cover" />
                                        <p className="text-sm text-gray-500 mt-1">Текущий логотип</p>
                                    </div>
                                )}
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
                                            {formData.logoFile ? formData.logoFile.name : 'Загрузить новый логотип'}
                                        </p>
                                        <p className="text-xs text-gray-500">JPG или PNG (макс. 10 МБ)</p>
                                    </label>
                                </div>
                            </div>

                            {/* Обложка */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Обложка
                                </label>
                                {formData.coverUrl && !formData.coverFile && (
                                    <div className="mb-3">
                                        <img src={formData.coverUrl} alt="Current cover" className="w-full h-32 rounded-lg object-cover" />
                                        <p className="text-sm text-gray-500 mt-1">Текущая обложка</p>
                                    </div>
                                )}
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
                                            {formData.coverFile ? formData.coverFile.name : 'Загрузить новую обложку'}
                                        </p>
                                        <p className="text-xs text-gray-500">JPG или PNG (макс. 10 МБ)</p>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(`/profile/${user.uid}`)}
                        >
                            Отмена
                        </Button>

                        <div className="flex space-x-4">
                            {community?.status === 'rejected' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleResubmit}
                                >
                                    Отправить на модерацию
                                </Button>
                            )}
                            <Button
                                type="submit"
                                disabled={uploading}
                            >
                                {uploading ? 'Сохранение...' : 'Сохранить изменения'}
                            </Button>
                        </div>
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

