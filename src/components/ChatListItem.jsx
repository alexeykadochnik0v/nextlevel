import { Link } from 'react-router-dom'
import { MessageCircle, Lock } from 'lucide-react'
import Card from './ui/Card'
import Badge from './ui/Badge'

export default function ChatListItem({ chat }) {
    return (
        <Link to={`/chat/${chat.id}`}>
            <Card className="hover:border-indigo-200 border border-transparent transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-gray-900">{chat.name}</h4>
                                {chat.type === 'private' && (
                                    <Lock className="w-4 h-4 text-gray-400" />
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                {chat.lastMessage || 'Нет сообщений'}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <Badge variant={chat.type === 'private' ? 'warning' : 'primary'}>
                            {chat.type === 'private' ? 'Приватный' : 'Открытый'}
                        </Badge>
                        <span className="text-xs text-gray-500 mt-1">
                            {chat.membersCount || 0} участников
                        </span>
                    </div>
                </div>
            </Card>
        </Link>
    )
}

