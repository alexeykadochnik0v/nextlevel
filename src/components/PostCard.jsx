import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageCircle, Heart, Share2, Shield, Send, Trash2, Edit } from 'lucide-react'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import Card from './ui/Card'
import Avatar from './ui/Avatar'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Toast from './Toast'
import { useAuth } from '../hooks/useAuth'
import usePostsStore from '../store/postsStore'
import useCommentsStore from '../store/commentsStore'

export default function PostCard({ post, communityOwnerId }) {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { toggleLike, likedPosts, posts } = usePostsStore()
    const { comments } = useCommentsStore()
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const isLiked = likedPosts[post.id] || false
    
    // Проверяем является ли пользователь автором или владельцем сообщества
    const canManage = user && (user.uid === post.authorId || user.uid === communityOwnerId)

    // Получаем актуальные данные поста из store (для синхронизации лайков)
    const actualPost = posts.find(p => p.id === post.id) || post
    
    // Получаем количество комментариев: приоритет у данных из поста, затем из store
    const commentsCount = actualPost.commentsCount || comments[post.id]?.length || 0

    const typeColors = {
        post: 'default',
        event: 'purple',
        vacancy: 'success',
        internship: 'primary',
        project: 'warning'
    }

    const typeLabels = {
        post: 'Публикация',
        event: 'Событие',
        vacancy: 'Вакансия',
        internship: 'Стажировка',
        project: 'Проект'
    }

    const handleLike = (e) => {
        e.stopPropagation()
        toggleLike(post.id)
    }

    const handleShare = async (e) => {
        e.stopPropagation()
        const url = `${window.location.origin}/post/${post.id}`
        
        // Проверяем поддержку Web Share API
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title,
                    text: post.content?.substring(0, 100) + '...',
                    url: url
                })
            } catch (err) {
                // Пользователь отменил или ошибка
                if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err)
                    // Fallback к копированию
                    await navigator.clipboard.writeText(url)
                    setToastMessage('Ссылка скопирована!')
                    setShowToast(true)
                }
            }
        } else {
            // Fallback для браузеров без Web Share API
            try {
                await navigator.clipboard.writeText(url)
                setToastMessage('Ссылка скопирована!')
                setShowToast(true)
            } catch (err) {
                console.error('Failed to copy:', err)
            }
        }
    }

    const handleCardClick = () => {
        // Для реальных вакансий (из коллекции jobs) идем на /vacancy
        // Проверяем наличие специфичных полей вакансии
        if ((post.type === 'vacancy' || post.type === 'internship') && 
            (post.terms || post.employmentType || post.validUntil !== undefined)) {
            navigate(`/vacancy/${post.id}`)
        } else {
            navigate(`/post/${post.id}`)
        }
    }

    const handleDelete = async (e) => {
        e.stopPropagation()
        if (!window.confirm('Вы уверены, что хотите удалить это?')) return
        
        try {
            // Определяем коллекцию
            const collection = (post.type === 'vacancy' || post.type === 'internship') ? 'jobs' : 'posts'
            await deleteDoc(doc(db, collection, post.id))
            setToastMessage('Успешно удалено')
            setShowToast(true)
            setTimeout(() => window.location.reload(), 1000)
        } catch (error) {
            console.error('Error deleting:', error)
            setToastMessage('Ошибка при удалении')
            setShowToast(true)
        }
    }

    return (
        <>
            <Card 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleCardClick}
            >
                <div className="flex items-start space-x-3 mb-3">
                    {post.community?.logoUrl ? (
                        <img 
                            src={post.community.logoUrl} 
                            alt={post.community.name}
                            loading="lazy"
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                    ) : (
                        <Avatar
                            src={post.author?.photoURL}
                            alt={post.author?.displayName}
                            size="sm"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        {/* Имя + щит верификации */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-medium text-gray-900 truncate">{post.author?.displayName}</p>
                            {post.authorVerified && (
                                <Badge variant="success" className="flex items-center flex-shrink-0 px-1.5 sm:px-2">
                                    <Shield className="w-3 h-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Верифицирован</span>
                                </Badge>
                            )}
                        </div>
                        
                        {/* Сообщество */}
                        <div className="text-sm text-gray-500 mb-2">
                            {post.community?.id ? (
                                <div className="flex items-center flex-wrap gap-1">
                                    <span>Сообщество:</span>
                                    <Link
                                        to={`/community/${post.community.id}`}
                                        className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {post.community.name}
                                    </Link>
                                </div>
                            ) : post.community?.name ? (
                                <span>Сообщество: {post.community.name}</span>
                            ) : null}
                        </div>

                        {/* Badge типа + Время */}
                        <div className="flex items-center justify-between gap-2">
                            <Badge variant={typeColors[post.type]} className="w-fit">
                                {typeLabels[post.type]}
                            </Badge>
                            <span className="text-sm text-gray-500">
                                {post.createdAt?.toDate 
                                    ? post.createdAt.toDate().toLocaleDateString('ru-RU')
                                    : new Date(post.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                        </div>
                    </div>
                </div>

                <Link to={`/post/${post.id}`}>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 hover:text-indigo-600 line-clamp-2">
                        {post.title}
                    </h3>
                </Link>

                <p className="text-gray-600 mb-4 line-clamp-3">
                    {(post.type === 'vacancy' || post.type === 'internship') && post.description 
                        ? post.description.substring(0, 150) + (post.description.length > 150 ? '...' : '')
                        : post.content}
                </p>

                {(post.image || post.imageUrl) && (
                    <img
                        src={post.image || post.imageUrl}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                )}

                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4 sm:gap-6 text-gray-500">
                        <button
                            onClick={handleLike}
                            className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            <span className="text-sm">{actualPost.likesCount || 0}</span>
                        </button>
                        <div className="flex items-center space-x-2 text-gray-500">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-sm">{commentsCount}</span>
                        </div>
                        <button
                            onClick={handleShare}
                            className="flex items-center space-x-2 hover:text-indigo-600 transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {canManage && (
                            <Button 
                                variant="danger" 
                                size="sm"
                                onClick={handleDelete}
                                className="flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Удалить</span>
                            </Button>
                        )}
                        
                        {post.type === 'vacancy' && !canManage && (
                            <Button 
                                variant="primary" 
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    navigate(`/vacancy/${post.id}`)
                                }}
                                className="flex items-center gap-2"
                            >
                                <Send className="w-4 h-4" />
                                Откликнуться
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            <Toast
                message={toastMessage || "Ссылка скопирована! Можешь отправлять"}
                show={showToast}
                onClose={() => setShowToast(false)}
            />
        </>
    )
}

