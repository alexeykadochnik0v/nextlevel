import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle, Heart, Share2 } from 'lucide-react'
import Card from './ui/Card'
import Avatar from './ui/Avatar'
import Badge from './ui/Badge'
import Toast from './Toast'
import usePostsStore from '../store/postsStore'

export default function PostCard({ post }) {
    const { toggleLike, likedPosts } = usePostsStore()
    const [showToast, setShowToast] = useState(false)
    const isLiked = likedPosts[post.id] || false

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
        e.preventDefault()
        toggleLike(post.id)
    }

    const handleShare = async (e) => {
        e.preventDefault()
        const url = `${window.location.origin}/post/${post.id}`
        try {
            await navigator.clipboard.writeText(url)
            setShowToast(true)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <>
            <Card>
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                        <Avatar
                            src={post.author?.photoURL}
                            alt={post.author?.displayName}
                            size="sm"
                        />
                        <div>
                            <p className="font-medium text-gray-900">{post.author?.displayName}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span>{post.community?.name}</span>
                                <span>•</span>
                                <span>{new Date(post.createdAt).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                    </div>
                    <Badge variant={typeColors[post.type]}>
                        {typeLabels[post.type]}
                    </Badge>
                </div>

                <Link to={`/post/${post.id}`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-indigo-600">
                        {post.title}
                    </h3>
                </Link>

                <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.content}
                </p>

                {post.image && (
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                )}

                <div className="flex items-center space-x-6 text-gray-500">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-red-600' : 'hover:text-red-600'
                            }`}
                    >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{post.likesCount || 0}</span>
                    </button>
                    <Link to={`/post/${post.id}`} className="flex items-center space-x-2 hover:text-indigo-600 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">{post.commentsCount || 0}</span>
                    </Link>
                    <button
                        onClick={handleShare}
                        className="flex items-center space-x-2 hover:text-indigo-600 transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </Card>

            <Toast
                message="Ссылка скопирована! Можешь отправлять"
                show={showToast}
                onClose={() => setShowToast(false)}
            />
        </>
    )
}

