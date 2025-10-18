import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, MessageCircle, Share2, ArrowLeft, Trash2, Shield } from 'lucide-react'
import { doc, getDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Textarea from '../components/ui/Textarea'
import Comment from '../components/Comment'
import Toast from '../components/Toast'
import { mockPosts } from '../data/mockPosts'
import usePostsStore from '../store/postsStore'
import useCommentsStore from '../store/commentsStore'
import { useAuth } from '../hooks/useAuth'

export default function Post() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [commentText, setCommentText] = useState('')
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [addingComment, setAddingComment] = useState(false)
    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)
    const { posts, toggleLike, likedPosts } = usePostsStore()
    const {
        comments,
        loading: commentsLoading,
        loadComments,
        addComment,
        deleteComment
    } = useCommentsStore()
    const { user } = useAuth()
    
    const isLiked = post ? (likedPosts[post.id] || false) : false
    const isOwner = user && post && (post.authorId === user.uid || post.author?.uid === user.uid)

    // Получаем комментарии для этого поста
    const postComments = comments[id] || []

    // Загружаем пост и комментарии
    useEffect(() => {
        const loadPost = async () => {
            try {
                // Пытаемся загрузить из Firebase
                const postDoc = await getDoc(doc(db, 'posts', id))
                if (postDoc.exists()) {
                    setPost({ id: postDoc.id, ...postDoc.data() })
                } else {
                    // Fallback на mockPosts
                    const allPosts = posts.length > 0 ? posts : mockPosts
                    const mockPost = allPosts.find(p => p.id === id)
                    if (mockPost) {
                        setPost(mockPost)
                    }
                }
            } catch (error) {
                console.error('Error loading post:', error)
                // Fallback на mockPosts
                const allPosts = posts.length > 0 ? posts : mockPosts
                const mockPost = allPosts.find(p => p.id === id)
                if (mockPost) {
                    setPost(mockPost)
                }
            } finally {
                setLoading(false)
            }
        }

        loadPost()
        loadComments(id)
    }, [id, loadComments, posts])

    const handleLike = () => {
        toggleLike(post.id)
    }

    const handleShare = async () => {
        const url = `${window.location.origin}/post/${post.id}`
        try {
            await navigator.clipboard.writeText(url)
            setShowToast(true)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

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

    const handleComment = async () => {
        if (!commentText.trim() || !user || addingComment) return

        setAddingComment(true)
        try {
            await addComment(id, commentText, user)
            setCommentText('')
            setToastMessage('Комментарий добавлен!')
            setShowToast(true)
        } catch (error) {
            console.error('Error adding comment:', error)
            setToastMessage('Ошибка при добавлении комментария')
            setShowToast(true)
        } finally {
            setAddingComment(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault()
            handleComment()
        }
    }

    const handleReply = (commentId, text) => {
        // Пока не реализовано - можно добавить позже
        console.log('Reply to comment:', commentId, text)
    }

    const handleDelete = async (commentId) => {
        try {
            await deleteComment(commentId, id)
            setToastMessage('Комментарий удален!')
            setShowToast(true)
        } catch (error) {
            console.error('Error deleting comment:', error)
            setToastMessage('Ошибка при удалении комментария')
            setShowToast(true)
        }
    }

    const handleDeletePost = async () => {
        if (!confirm('Вы уверены, что хотите удалить эту публикацию?')) return

        setDeleting(true)
        try {
            await deleteDoc(doc(db, 'posts', id))
            setToastMessage('Публикация удалена!')
            setShowToast(true)
            setTimeout(() => {
                navigate(post.communityId ? `/community/${post.communityId}` : '/')
            }, 1500)
        } catch (error) {
            console.error('Error deleting post:', error)
            setToastMessage('Ошибка при удалении публикации')
            setShowToast(true)
            setDeleting(false)
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

    if (!post) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-gray-600">Публикация не найдена</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    to={post.communityId ? `/community/${post.communityId}` : "/"}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {post.communityId ? 'Назад к сообществу' : 'Назад к ленте'}
                </Link>

                <Card className="mb-6">
                    <div className="flex items-start space-x-3 mb-4">
                        <Avatar
                            src={post.author?.photoURL}
                            alt={post.author?.displayName || post.authorName}
                            size="md"
                        />
                        <div className="flex-1 min-w-0">
                            {/* Имя + щит верификации */}
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <p className="font-semibold text-gray-900 truncate">
                                    {post.author?.displayName || post.authorName}
                                </p>
                                {post.authorVerified && (
                                    <Badge variant="success" className="flex items-center flex-shrink-0 px-1.5 sm:px-2">
                                        <Shield className="w-3 h-3 sm:mr-1" />
                                        <span className="hidden sm:inline">Верифицирован</span>
                                    </Badge>
                                )}
                            </div>
                            
                            {/* Сообщество */}
                            {(post.community?.name || post.communityName) && (
                                <div className="text-sm text-gray-500 mb-2">
                                    <Link
                                        to={`/community/${post.community?.id || post.communityId}`}
                                        className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                                    >
                                        {post.community?.name || post.communityName}
                                    </Link>
                                </div>
                            )}

                            {/* Badge типа + Время + Кнопка удаления */}
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant={typeColors[post.type]} className="w-fit">
                                        {typeLabels[post.type]}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                        {new Date(post.createdAt).toLocaleDateString('ru-RU')}
                                    </span>
                                </div>
                                {isOwner && (
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={handleDeletePost}
                                        disabled={deleting}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {post.title}
                    </h1>

                    <div className="prose max-w-none mb-6">
                        <p className="text-gray-700 whitespace-pre-line">
                            {post.content}
                        </p>
                    </div>

                    {/* Отображение изображений */}
                    {(post.image || post.imageUrl) && (
                        <img
                            src={post.image || post.imageUrl}
                            alt={post.title}
                            className="w-full rounded-lg mb-6"
                        />
                    )}
                    {post.images && post.images.length > 0 && (
                        <div className={`grid gap-4 mb-6 ${
                            post.images.length === 1 ? 'grid-cols-1' : 
                            post.images.length === 2 ? 'grid-cols-2' : 
                            'grid-cols-2 md:grid-cols-3'
                        }`}>
                            {post.images.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`${post.title} - ${index + 1}`}
                                    className="w-full rounded-lg object-cover"
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleLike}
                            className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                            <span>{post.likesCount}</span>
                        </button>
                        <div className="flex items-center space-x-2 text-gray-500">
                            <MessageCircle className="w-5 h-5" />
                            <span>{postComments.length}</span>
                        </div>
                        <button
                            onClick={handleShare}
                            className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                            <span>Поделиться</span>
                        </button>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Комментарии ({postComments.length})
                    </h2>

                    {user ? (
                        <div className="mb-6">
                            <Textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Напишите комментарий... (Ctrl+Enter для отправки)"
                                rows={3}
                                className="mb-3"
                            />
                            <Button
                                onClick={handleComment}
                                disabled={!commentText.trim() || addingComment}
                            >
                                {addingComment ? 'Отправка...' : 'Отправить'}
                            </Button>
                        </div>
                    ) : (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                            <p className="text-gray-600">
                                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                    Войдите
                                </Link>
                                {' '}или{' '}
                                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                    зарегистрируйтесь
                                </Link>
                                , чтобы оставлять комментарии
                            </p>
                        </div>
                    )}

                    {commentsLoading ? (
                        <div className="text-center py-8">
                            <div className="text-gray-500">Загрузка комментариев...</div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {postComments.length > 0 ? (
                                postComments.map(comment => (
                                    <Comment
                                        key={comment.id}
                                        comment={comment}
                                        postId={id}
                                        onReply={handleReply}
                                        onDelete={handleDelete}
                                    />
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-8">
                                    Пока нет комментариев. Будьте первым!
                                </p>
                            )}
                        </div>
                    )}
                </Card>
            </div>

            <Toast
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
            />
        </div>
    )
}
