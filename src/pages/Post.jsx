import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Heart, MessageCircle, Share2, ArrowLeft } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Textarea from '../components/ui/Textarea'
import Comment from '../components/Comment'
import Toast from '../components/Toast'
import { mockPosts } from '../data/mockPosts'
import { mockComments, countComments } from '../data/mockComments'
import usePostsStore from '../store/postsStore'
import useCommentsStore from '../store/commentsStore'
import { useAuth } from '../hooks/useAuth'

export default function Post() {
    const { id } = useParams()
    const [commentText, setCommentText] = useState('')
    const [showToast, setShowToast] = useState(false)
    const { toggleLike, likedPosts } = usePostsStore()
    const { comments: allComments, setComments, addComment, addReply, deleteComment } = useCommentsStore()
    const { user } = useAuth()

    // Находим пост по id
    const post = mockPosts.find(p => p.id === id) || mockPosts[0]
    const isLiked = likedPosts[post.id] || false

    // Получаем комментарии для этого поста
    const comments = allComments[id] || []

    // Загружаем моковые комментарии при первом рендере, если комментариев нет
    useEffect(() => {
        if (!allComments[id] && mockComments[id]) {
            setComments(id, mockComments[id])
        }
    }, [id, allComments, setComments])

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

    const handleComment = () => {
        if (commentText.trim() && user) {
            const newComment = {
                id: `c-${Date.now()}`,
                text: commentText,
                author: {
                    uid: user.uid,
                    displayName: user.displayName || user.email,
                    photoURL: user.photoURL || null
                },
                createdAt: new Date().toISOString(),
                likesCount: 0,
                replies: []
            }
            addComment(id, newComment)
            setCommentText('')
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault()
            handleComment()
        }
    }

    const handleReply = (commentId, text) => {
        if (text.trim() && user) {
            const newReply = {
                id: `r-${Date.now()}`,
                text,
                author: {
                    uid: user.uid,
                    displayName: user.displayName || user.email,
                    photoURL: user.photoURL || null
                },
                createdAt: new Date().toISOString(),
                likesCount: 0,
                replies: []
            }
            addReply(id, commentId, newReply)
        }
    }

    const handleDelete = (commentId) => {
        deleteComment(id, commentId)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    to="/"
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад к ленте
                </Link>

                <Card className="mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                            <Avatar
                                src={post.author.photoURL}
                                alt={post.author.displayName}
                                size="md"
                            />
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {post.author.displayName}
                                </p>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Link
                                        to={`/community/${post.community.id}`}
                                        className="hover:text-indigo-600"
                                    >
                                        {post.community.name}
                                    </Link>
                                    <span>•</span>
                                    <span>{new Date(post.createdAt).toLocaleDateString('ru-RU')}</span>
                                </div>
                            </div>
                        </div>
                        <Badge variant={typeColors[post.type]}>
                            {typeLabels[post.type]}
                        </Badge>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {post.title}
                    </h1>

                    <div className="prose max-w-none mb-6">
                        <p className="text-gray-700 whitespace-pre-line">
                            {post.content}
                        </p>
                    </div>

                    {post.image && (
                        <img
                            src={post.image}
                            alt={post.title}
                            className="w-full rounded-lg mb-6"
                        />
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
                            <span>{countComments(comments)}</span>
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
                        Комментарии ({countComments(comments)})
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
                            <Button onClick={handleComment} disabled={!commentText.trim()}>
                                Отправить
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

                    <div className="space-y-6">
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <Comment
                                    key={comment.id}
                                    comment={comment}
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
                </Card>
            </div>

            <Toast
                message="Ссылка скопирована! Можешь отправлять"
                show={showToast}
                onClose={() => setShowToast(false)}
            />
        </div>
    )
}
