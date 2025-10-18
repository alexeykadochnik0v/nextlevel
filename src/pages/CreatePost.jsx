import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { storage, db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Button from '../components/ui/Button'
import Toast from '../components/Toast'
import Badge from '../components/ui/Badge'

const TAGS_OPTIONS = [
    'Новости', 'Обучение', 'Проект', 'Мероприятие', 'Достижение',
    'Технологии', 'Карьера', 'Сотрудничество', 'Волонтерство', 'Спорт'
]

export default function CreatePost() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [userCommunities, setUserCommunities] = useState([])
    const [isVerified, setIsVerified] = useState(false)
    const [formData, setFormData] = useState({
        communityId: '',
        title: '',
        content: '',
        tags: [],
        images: []
    })

    useEffect(() => {
        const checkAccess = async () => {
            if (!user) {
                navigate('/login')
                return
            }

            // Проверяем верификацию
            const userDoc = await getDoc(doc(db, 'users', user.uid))
            if (userDoc.exists()) {
                const userData = userDoc.data()
                const studentVerified = userData.verification?.student?.status === 'approved'
                const employerVerified = userData.verification?.employer?.status === 'approved'
                const isAdmin = userData.role === 'admin'

                setIsVerified(studentVerified || employerVerified || isAdmin)

                if (!studentVerified && !employerVerified && !isAdmin) {
                    setToastMessage('Требуется верификация для создания публикаций')
                    setShowToast(true)
                    setTimeout(() => navigate('/verification'), 2000)
                    return
                }
            }

            // Загружаем сообщества пользователя
            const communitiesQuery = query(
                collection(db, 'communities'),
                where('ownerUid', '==', user.uid),
                where('status', '==', 'active')
            )
            const communitiesSnapshot = await getDocs(communitiesQuery)
            const communities = []
            communitiesSnapshot.forEach((doc) => {
                const communityData = doc.data()
                // Проверяем, что публикации не запрещены
                if (!communityData.publishBan?.enabled) {
                    communities.push({ id: doc.id, ...communityData })
                }
            })

            setUserCommunities(communities)

            if (communities.length === 0) {
                setToastMessage('У вас нет активных сообществ для публикации')
                setShowToast(true)
                setTimeout(() => navigate('/create'), 2000)
                return
            }

            // Если только одно сообщество, выбираем его автоматически
            if (communities.length === 1) {
                setFormData(prev => ({ ...prev, communityId: communities[0].id }))
            }

            setLoading(false)
        }

        checkAccess()
    }, [user, navigate])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleTagToggle = (tag) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag].slice(0, 5) // Максимум 5 тегов
        }))
    }

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length + formData.images.length > 5) {
            setToastMessage('Максимум 5 изображений')
            setShowToast(true)
            return
        }

        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                setToastMessage('Размер изображения не должен превышать 10 МБ')
                setShowToast(true)
                continue
            }

            if (!file.type.startsWith('image/')) {
                setToastMessage('Можно загружать только изображения')
                setShowToast(true)
                continue
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, file]
            }))
        }
    }

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }))
    }

    const uploadImages = async () => {
        const imageUrls = []
        for (const image of formData.images) {
            try {
                const fileExt = image.name.split('.').pop()
                const filePath = `posts/${user.uid}/${Date.now()}.${fileExt}`
                const storageRef = ref(storage, filePath)
                await uploadBytes(storageRef, image)
                const url = await getDownloadURL(storageRef)
                imageUrls.push(url)
            } catch (error) {
                console.error('Error uploading image:', error)
            }
        }
        return imageUrls
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.communityId || !formData.title.trim() || !formData.content.trim()) {
            setToastMessage('Заполните все обязательные поля')
            setShowToast(true)
            return
        }

        setUploading(true)
        try {
            // Загружаем изображения
            const imageUrls = await uploadImages()

            // Получаем данные сообщества
            const communityDoc = await getDoc(doc(db, 'communities', formData.communityId))
            const communityData = communityDoc.data()

            // Проверяем бан публикаций
            if (communityData.publishBan?.enabled) {
                setToastMessage('Публикации в этом сообществе запрещены администратором')
                setShowToast(true)
                setUploading(false)
                return
            }

            // Создаем публикацию
            const postData = {
                type: 'post',
                title: formData.title.trim(),
                content: formData.content.trim(),
                tags: formData.tags,
                images: imageUrls,
                author: {
                    uid: user.uid,
                    displayName: user.displayName || user.email,
                    photoURL: user.photoURL || null
                },
                authorId: user.uid,
                authorName: user.displayName || user.email,
                authorEmail: user.email,
                authorPhotoURL: user.photoURL || null,
                authorVerified: isVerified,
                community: {
                    id: formData.communityId,
                    name: communityData.title
                },
                communityId: formData.communityId,
                communityName: communityData.title,
                likesCount: 0,
                commentsCount: 0,
                sharesCount: 0,
                viewsCount: 0,
                status: 'published',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            await addDoc(collection(db, 'posts'), postData)

            setToastMessage('Публикация создана успешно!')
            setShowToast(true)

            setTimeout(() => {
                navigate(`/community/${formData.communityId}`)
            }, 1500)

        } catch (error) {
            console.error('Error creating post:', error)
            setToastMessage('Ошибка при создании публикации')
            setShowToast(true)
        } finally {
            setUploading(false)
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
                    onClick={() => navigate('/create')}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад к созданию
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Создать публикацию
                    </h1>
                    <p className="text-gray-600">
                        Поделитесь новостями, идеями или достижениями с вашим сообществом
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <div className="space-y-6">
                            {/* Выбор сообщества */}
                            {userCommunities.length > 1 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        В какое сообщество публикуем? *
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
                            )}

                            {userCommunities.length === 1 && (
                                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                                    <p className="text-sm font-medium text-indigo-900 mb-1">
                                        Публикация в сообщество:
                                    </p>
                                    <p className="text-sm text-indigo-700">{userCommunities[0].title}</p>
                                </div>
                            )}

                            {/* Заголовок */}
                            <Input
                                label="Заголовок публикации *"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                placeholder="Например: Новый проект нашей команды"
                                maxLength={200}
                                required
                            />

                            {/* Содержание */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Текст публикации *
                                </label>
                                <Textarea
                                    value={formData.content}
                                    onChange={(e) => handleInputChange('content', e.target.value)}
                                    placeholder="Расскажите подробнее..."
                                    rows={8}
                                    required
                                />
                            </div>

                            {/* Теги */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Теги (до 5)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {TAGS_OPTIONS.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => handleTagToggle(tag)}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                                                formData.tags.includes(tag)
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                            disabled={!formData.tags.includes(tag) && formData.tags.length >= 5}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Изображения */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Изображения (до 5, необязательно)
                                </label>
                                
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="relative">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index + 1}`}
                                                className="w-32 h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {formData.images.length < 5 && (
                                    <div>
                                        <input
                                            type="file"
                                            id="images"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="images"
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Загрузить изображения
                                        </label>
                                        <p className="text-xs text-gray-500 mt-2">
                                            JPG, PNG до 10 МБ каждое
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Кнопки */}
                    <div className="flex space-x-3">
                        <Button
                            type="submit"
                            disabled={uploading}
                            className="flex-1"
                        >
                            {uploading ? 'Публикация...' : 'Опубликовать'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/create')}
                            className="flex-1"
                        >
                            Отмена
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
