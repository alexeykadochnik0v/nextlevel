import { useState } from 'react'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import Avatar from './ui/Avatar'
import Button from './ui/Button'
import useCommentsStore from '../store/commentsStore'
import { useAuth } from '../hooks/useAuth'

export default function Comment({ comment, postId, onReply, onDelete }) {
    const [showReply, setShowReply] = useState(false)
    const [replyText, setReplyText] = useState('')
    const [liking, setLiking] = useState(false)
    const { toggleCommentLike, isCommentLiked } = useCommentsStore()
    const { user } = useAuth()

    // Отладочная информация (временно отключена)
    // console.log('Comment data:', comment)

    const isLiked = isCommentLiked(comment.id, user?.uid)
    const isOwner = user && comment.userId === user.uid

    const handleReply = () => {
        if (replyText.trim()) {
            onReply(comment.id, replyText)
            setReplyText('')
            setShowReply(false)
        }
    }

    const handleLike = async () => {
        if (!user || liking) return

        setLiking(true)
        try {
            await toggleCommentLike(comment.id, user.uid, postId)
        } catch (error) {
            console.error('Error toggling like:', error)
        } finally {
            setLiking(false)
        }
    }

    const handleDelete = async () => {
        if (isOwner) {
            onDelete(comment.id)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleReply()
        }
    }

    return (
        <div className="flex space-x-3">
            <Avatar
                src={comment.userPhotoURL}
                alt={comment.userDisplayName}
                size="sm"
            />
            <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900 text-sm">
                                {comment.userDisplayName || 'Неизвестный пользователь'}
                            </span>
                            <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                        </div>
                        {isOwner && (
                            <button
                                onClick={handleDelete}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Удалить комментарий"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <p className="text-gray-700 text-sm">
                        {comment.content || 'Комментарий пуст'}
                    </p>
                </div>

                <div className="flex items-center space-x-4 mt-2 ml-3">
                    <button
                        onClick={handleLike}
                        disabled={liking || !user}
                        className={`flex items-center space-x-1 text-xs transition-colors ${isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                            } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{comment.likesCount || 0}</span>
                    </button>
                    <button
                        onClick={() => setShowReply(!showReply)}
                        disabled={!user}
                        className={`flex items-center space-x-1 text-xs transition-colors ${!user ? 'opacity-50 cursor-not-allowed' : 'text-gray-500 hover:text-indigo-600'
                            }`}
                    >
                        <MessageCircle className="w-3 h-3" />
                        <span>Ответить</span>
                    </button>
                </div>

                {showReply && user && (
                    <div className="mt-3 flex space-x-2">
                        <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Напишите ответ..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <Button size="sm" onClick={handleReply} disabled={!replyText.trim()}>
                            Отправить
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

