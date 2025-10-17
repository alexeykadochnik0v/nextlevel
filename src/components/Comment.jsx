import { useState } from 'react'
import { Heart, MessageCircle, Trash2 } from 'lucide-react'
import Avatar from './ui/Avatar'
import Button from './ui/Button'
import useCommentsStore from '../store/commentsStore'
import { useAuth } from '../hooks/useAuth'

export default function Comment({ comment, onReply, onDelete }) {
    const [showReply, setShowReply] = useState(false)
    const [replyText, setReplyText] = useState('')
    const { toggleCommentLike, likedComments } = useCommentsStore()
    const { user } = useAuth()

    const isLiked = likedComments[comment.id] || false
    const isOwner = user && comment.author.uid === user.uid

    const handleReply = () => {
        if (replyText.trim()) {
            onReply(comment.id, replyText)
            setReplyText('')
            setShowReply(false)
        }
    }

    const handleLike = () => {
        toggleCommentLike(comment.id)
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
                src={comment.author.photoURL}
                alt={comment.author.displayName}
                size="sm"
            />
            <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900 text-sm">
                                {comment.author.displayName}
                            </span>
                            <span className="text-xs text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                            </span>
                        </div>
                        {isOwner && (
                            <button
                                onClick={() => onDelete(comment.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Удалить комментарий"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <p className="text-gray-700 text-sm">
                        {comment.text}
                    </p>
                </div>

                <div className="flex items-center space-x-4 mt-2 ml-3">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-1 text-xs transition-colors ${isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                            }`}
                    >
                        <Heart className={`w-3 h-3 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{comment.likesCount || 0}</span>
                    </button>
                    <button
                        onClick={() => setShowReply(!showReply)}
                        className="flex items-center space-x-1 text-xs text-gray-500 hover:text-indigo-600"
                    >
                        <MessageCircle className="w-3 h-3" />
                        <span>Ответить</span>
                    </button>
                </div>

                {showReply && (
                    <div className="mt-3 flex space-x-2">
                        <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Напишите ответ..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <Button size="sm" onClick={handleReply}>
                            Отправить
                        </Button>
                    </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 space-y-3">
                        {comment.replies.map(reply => (
                            <Comment
                                key={reply.id}
                                comment={reply}
                                onReply={onReply}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

