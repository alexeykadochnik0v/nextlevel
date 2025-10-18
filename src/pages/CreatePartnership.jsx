import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import useVerificationStore from '../store/verificationStore'
import { db, storage } from '../lib/firebase'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Toast from '../components/Toast'
import { ArrowLeft, Upload, X, Handshake } from 'lucide-react'

const PARTNER_TYPES = [
    { value: 'supplier', label: 'Поставщик' },
    { value: 'contractor', label: 'Подрядчик' },
    { value: 'integrator', label: 'Интегратор' },
    { value: 'investor', label: 'Инвестор' },
    { value: 'distributor', label: 'Дистрибьютор' },
    { value: 'reseller', label: 'Реселлер' },
    { value: 'other', label: 'Другое' }
]

export default function CreatePartnership() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { userVerification } = useVerificationStore()

    const [uploading, setUploading] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [userCommunities, setUserCommunities] = useState([])
    const [loading, setLoading] = useState(true)

    const [formData, setFormData] = useState({
        communityId: '',
        title: '',
        partnerType: '',
        description: '',
        terms: '',
        validUntil: '',
        attachments: []
    })

    useEffect(() => {
        if (!user) {
            navigate('/login')
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

        if (!formData.title || !formData.partnerType || !formData.description) {
            setToastMessage('Заполните все обязательные поля')
            setShowToast(true)
            return
        }

        setUploading(true)

        try {
            // Загрузка файлов
            const uploadedAttachments = []
            for (const file of formData.attachments) {
                const fileRef = ref(storage, `partnerships/${user.uid}/${Date.now()}_${file.name}`)
                await uploadBytes(fileRef, file)
                const url = await getDownloadURL(fileRef)
                uploadedAttachments.push({
                    type: file.type.includes('pdf') ? 'pdf' : 'image',
                    url,
                    name: file.name
                })
            }

            // Получаем данные выбранного сообщества
            const selectedCommunity = userCommunities.find(c => c.id === formData.communityId)

            // Создание предложения о сотрудничестве
            const partnershipData = {
                communityId: formData.communityId,
                communityName: selectedCommunity?.title || '',
                authorId: user.uid,
                authorName: user.displayName || user.email,
                authorVerified: userVerification?.employer?.status === 'approved' || userVerification?.student?.status === 'approved',
                title: formData.title,
                partnerType: formData.partnerType,
                description: formData.description,
                expiryDate: formData.validUntil || null,
                terms: formData.terms || '',
                attachments: uploadedAttachments,
                status: isDraft ? 'draft' : 'open',
                applicationsCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            await addDoc(collection(db, 'partnerships'), partnershipData)

            setToastMessage(isDraft ? 'Предложение сохранено как черновик' : 'Предложение успешно опубликовано!')
            setShowToast(true)

            setTimeout(() => {
                navigate(`/community/${formData.communityId}`)
            }, 1500)

        } catch (error) {
            console.error('Error creating partnership:', error)
            setToastMessage('Ошибка при создании предложения')
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
                        <Handshake className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Нет активных сообществ
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Для создания предложения о сотрудничестве необходимо иметь активное сообщество
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Создать предложение о сотрудничестве</h1>
                    <p className="text-gray-600">
                        Найдите партнеров для развития вашего бизнеса
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

                            {/* Заголовок */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Заголовок предложения *
                                </label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="Например: Ищем поставщика комплектующих"
                                    required
                                />
                            </div>

                            {/* Тип партнера */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Тип партнера *
                                </label>
                                <select
                                    value={formData.partnerType}
                                    onChange={(e) => handleInputChange('partnerType', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Выберите тип партнера</option>
                                    {PARTNER_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Описание */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Описание и условия *
                                </label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Опишите, какого партнера вы ищете, какие условия предлагаете..."
                                    rows={6}
                                    required
                                />
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
                            {uploading ? 'Публикация...' : 'Опубликовать предложение'}
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

