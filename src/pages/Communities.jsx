import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { mockCommunities } from '../data/fullMockData'
import { Users } from 'lucide-react'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import useCommunitiesStore from '../store/communitiesStore'

export default function Communities() {
    const [communities, setCommunities] = useState([])
    const [loading, setLoading] = useState(true)
    const { isJoined } = useCommunitiesStore()

    useEffect(() => {
        const loadCommunities = async () => {
            try {
                // Загружаем реальные сообщества из Firebase
                const communitiesSnapshot = await getDocs(collection(db, 'communities'))
                const realCommunities = []
                communitiesSnapshot.forEach((doc) => {
                    realCommunities.push({ id: doc.id, ...doc.data() })
                })

                // Объединяем с моковыми
                const allCommunities = [...realCommunities, ...mockCommunities]
                setCommunities(allCommunities)
            } catch (error) {
                console.error('Error loading communities:', error)
                // Если ошибка, показываем только моковые
                setCommunities(mockCommunities)
            } finally {
                setLoading(false)
            }
        }

        loadCommunities()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="text-gray-500">Загрузка...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Все сообщества</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {communities.map((community) => (
                        <Link key={community.id} to={`/community/${community.id}`}>
                            <Card className="hover:shadow-xl transition-shadow h-full">
                                <div className="flex items-start space-x-4 mb-4">
                                    {community.logoUrl ? (
                                        <img
                                            src={community.logoUrl}
                                            alt={community.title || community.name}
                                            className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                                            {(community.title || community.name || 'C').charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-1">
                                            {community.title || community.name}
                                        </h2>
                                        <div className="flex items-center text-gray-500 text-sm">
                                            <Users className="w-4 h-4 mr-1" />
                                            <span>{community.membersCount || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                    {community.description}
                                </p>

                                {community.tags && community.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {community.tags.slice(0, 3).map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {community.tags.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">
                                                +{community.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
