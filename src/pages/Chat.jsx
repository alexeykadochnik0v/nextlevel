import { useState, useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send, Paperclip, Users, Settings } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import useChatsStore from '../store/chatsStore'
import Header from '../components/Header'
import Message from '../components/Message'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

export default function Chat() {
    const { id } = useParams()
    const { user } = useAuth()
    const [messageText, setMessageText] = useState('')
    const messagesEndRef = useRef(null)
    const { messages, setMessages, addMessage } = useChatsStore()

    // Для демонстрации используем моковые данные
    const mockChat = {
        id,
        name: 'Общий чат',
        type: 'public',
        community: {
            id: '1',
            name: 'IT & Tech'
        },
        membersCount: 234
    }

    const initialMockMessages = [
        {
            id: '1',
            text: 'Привет всем! Кто-нибудь работал с React 19?',
            author: {
                uid: 'user1',
                displayName: 'Мария Иванова',
                photoURL: null
            },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            attachments: []
        },
        {
            id: '2',
            text: 'Да, пробовал новые хуки. Очень удобно!',
            author: {
                uid: 'user2',
                displayName: 'Алексей Петров',
                photoURL: null
            },
            createdAt: new Date(Date.now() - 3500000).toISOString(),
            attachments: []
        },
        {
            id: '3',
            text: 'Можете поделиться документацией?',
            author: {
                uid: user?.uid,
                displayName: user?.displayName || 'Вы',
                photoURL: user?.photoURL
            },
            createdAt: new Date(Date.now() - 3400000).toISOString(),
            attachments: []
        },
        {
            id: '4',
            text: 'Конечно! Вот официальный гайд',
            author: {
                uid: 'user2',
                displayName: 'Алексей Петров',
                photoURL: null
            },
            createdAt: new Date(Date.now() - 3300000).toISOString(),
            attachments: [
                { name: 'react-19-guide.pdf', url: '#' }
            ]
        },
        {
            id: '5',
            text: 'Спасибо большое! 🙏',
            author: {
                uid: user?.uid,
                displayName: user?.displayName || 'Вы',
                photoURL: user?.photoURL
            },
            createdAt: new Date(Date.now() - 3200000).toISOString(),
            attachments: []
        }
    ]

    // Получаем сообщения для текущего чата
    const chatMessages = messages[id] || []

    // Загружаем моковые сообщения при первом рендере
    useEffect(() => {
        if (chatMessages.length === 0) {
            setMessages(id, initialMockMessages)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [chatMessages])

    const handleSend = () => {
        if (messageText.trim() && user) {
            const newMessage = {
                id: `msg-${Date.now()}`,
                text: messageText,
                author: {
                    uid: user.uid,
                    displayName: user.displayName || user.email,
                    photoURL: user.photoURL || null
                },
                createdAt: new Date().toISOString(),
                attachments: []
            }
            
            addMessage(id, newMessage)
            setMessageText('')
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
                <div className="bg-white border-b border-gray-200 px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link
                                to={`/community/${mockChat.community.id}`}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <span>{mockChat.name}</span>
                                    <Badge variant={mockChat.type === 'private' ? 'warning' : 'primary'}>
                                        {mockChat.type === 'private' ? 'Приватный' : 'Открытый'}
                                    </Badge>
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {mockChat.community.name} • {mockChat.membersCount} участников
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                                <Users className="w-5 h-5" />
                            </Button>
                            <Button variant="ghost" size="sm">
                                <Settings className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {chatMessages.map(message => (
                        <Message
                            key={message.id}
                            message={message}
                            isOwn={message.author.uid === user?.uid}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <div className="bg-white border-t border-gray-200 p-4">
                    <div className="flex items-end space-x-2">
                        <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors">
                            <Paperclip className="w-5 h-5" />
                        </button>

                        <textarea
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Напишите сообщение..."
                            rows={1}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            style={{ minHeight: '42px', maxHeight: '120px' }}
                        />

                        <Button
                            onClick={handleSend}
                            disabled={!messageText.trim()}
                            className="px-4"
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
