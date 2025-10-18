import { Link } from 'react-router-dom'
import { Handshake, Shield, Calendar, Building, Trash2 } from 'lucide-react'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useState } from 'react'
import Card from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Toast from './Toast'
import { useAuth } from '../hooks/useAuth'

export default function PartnershipCard({ partnership, communityOwnerId }) {
    const { user } = useAuth()
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    
    // Проверяем, является ли пользователь владельцем/админом ДРУГОГО сообщества
    const canRespond = user && partnership.communityId !== user.currentCommunityId
    
    // Проверяем является ли пользователь автором или владельцем сообщества
    const canManage = user && (user.uid === partnership.authorId || user.uid === communityOwnerId)

    const partnerTypeLabels = {
        supplier: 'Поставщик',
        contractor: 'Подрядчик',
        integrator: 'Интегратор',
        investor: 'Инвестор',
        other: 'Другое'
    }

    const formatDate = (dateString) => {
        if (!dateString) return null
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const isExpired = partnership.expiryDate && new Date(partnership.expiryDate) < new Date()
    const isClosed = partnership.status === 'closed' || isExpired

    const handleDelete = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!window.confirm('Вы уверены, что хотите удалить это предложение?')) return
        
        try {
            await deleteDoc(doc(db, 'partnerships', partnership.id))
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
        <Link to={`/partnership/${partnership.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {/* Лого сообщества */}
                        {partnership.community?.logoUrl ? (
                            <img 
                                src={partnership.community.logoUrl} 
                                alt={partnership.communityName}
                                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                                {partnership.communityName?.charAt(0) || 'C'}
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            {/* Заголовок */}
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 hover:text-indigo-600 line-clamp-2">
                                {partnership.title}
                            </h3>

                            {/* Бейджи */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="primary" className="flex items-center">
                                    <Handshake className="w-3 h-3 mr-1" />
                                    Сотрудничество
                                </Badge>
                                {partnership.authorVerified && (
                                    <Badge variant="success" className="flex items-center">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Верифицирован
                                    </Badge>
                                )}
                                {isClosed && (
                                    <Badge variant="danger">
                                        Закрыто
                                    </Badge>
                                )}
                            </div>

                            {/* Метаданные */}
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                                <span className="flex items-center">
                                    <Building className="w-4 h-4 mr-1" />
                                    {partnerTypeLabels[partnership.partnerType] || 'Другое'}
                                </span>
                                {partnership.expiryDate && (
                                    <span className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        до {formatDate(partnership.expiryDate)}
                                    </span>
                                )}
                                <span className="text-gray-700">
                                    {partnership.communityName}
                                </span>
                                <span>{formatDate(partnership.createdAt)}</span>
                            </div>

                            {/* Короткое описание */}
                            <p className="text-gray-600 text-sm line-clamp-2">
                                {partnership.description}
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="w-full sm:w-auto sm:ml-4 flex-shrink-0 flex gap-2">
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
                        
                        {!isClosed && !canManage && (
                            <Button
                                size="sm"
                                disabled={!canRespond}
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    // Откроем модал отклика
                                }}
                                title={!canRespond ? 'Доступно администраторам сообществ' : ''}
                                className="w-full sm:w-auto"
                            >
                                Откликнуться
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
        
        <Toast
            message={toastMessage}
            show={showToast}
            onClose={() => setShowToast(false)}
        />
        </>
    )
}
