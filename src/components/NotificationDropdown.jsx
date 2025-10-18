import { useState, useEffect, useRef } from 'react'
import { Bell, X, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import useNotificationsStore from '../store/notificationsStore'
import Avatar from './ui/Avatar'

export default function NotificationDropdown() {
    const { user } = useAuth()
    const { notifications, unreadCount, loading, loadNotifications, markAsRead, markAllAsRead } = useNotificationsStore()
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        if (user) {
            const unsubscribe = loadNotifications(user.uid)
            return () => {
                if (unsubscribe) {
                    unsubscribe()
                }
            }
        }
    }, [user, loadNotifications])

    // Закрытие dropdown при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id)
        }
        setShowDropdown(false)

        // Здесь можно добавить навигацию к соответствующему контенту
        console.log('Navigate to:', notification)
    }

    const handleMarkAllRead = async () => {
        await markAllAsRead(user.uid)
    }

    const formatTime = (timestamp) => {
        const now = new Date()
        const notificationTime = new Date(timestamp)
        const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60))

        if (diffInMinutes < 1) return 'только что'
        if (diffInMinutes < 60) return `${diffInMinutes} мин назад`
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} ч назад`
        return `${Math.floor(diffInMinutes / 1440)} дн назад`
    }

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'job_application':
                return '💼'
            case 'partnership_request':
                return '🤝'
            case 'application_approved':
                return '✅'
            case 'application_rejected':
                return '❌'
            case 'new_chat':
                return '💬'
            default:
                return '🔔'
        }
    }

    const getNotificationText = (notification) => {
        switch (notification.type) {
            case 'job_application':
                return `Новый отклик на вакансию "${notification.jobTitle}"`
            case 'partnership_request':
                return `Запрос на сотрудничество от "${notification.fromCommunityName}"`
            case 'application_approved':
                return `Ваш отклик на "${notification.jobTitle}" принят!`
            case 'application_rejected':
                return `Ваш отклик на "${notification.jobTitle}" отклонен`
            case 'new_chat':
                return `Новое сообщение в чате`
            default:
                return notification.message || 'Новое уведомление'
        }
    }

    if (!user) return null

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Уведомления
                                {unreadCount > 0 && (
                                    <span className="ml-2 text-sm text-red-500">
                                        ({unreadCount} непрочитанных)
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center space-x-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-xs text-indigo-600 hover:text-indigo-800"
                                    >
                                        Отметить все как прочитанные
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDropdown(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                Загрузка уведомлений...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                Нет уведомлений
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm">
                                                        {getNotificationIcon(notification.type)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!notification.read ? 'font-medium' : 'font-normal'} text-gray-900`}>
                                                    {getNotificationText(notification)}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatTime(notification.createdAt)}
                                                </p>
                                                {notification.fromUserName && (
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <Avatar
                                                            src={notification.fromUserPhotoURL}
                                                            alt={notification.fromUserName}
                                                            size="xs"
                                                        />
                                                        <span className="text-xs text-gray-600">
                                                            {notification.fromUserName}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {!notification.read && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
