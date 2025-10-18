import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import Card from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'

export default function CommunityCard({ community, joined = false, onJoin }) {
    const name = community.name || community.title
    return (
        <Card className="hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                    {community.logoUrl ? (
                        <img 
                            src={community.logoUrl} 
                            alt={name}
                            className="w-12 h-12 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            {name?.charAt(0)}
                        </div>
                    )}
                    <div>
                        <Link to={`/community/${community.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600">
                                {name}
                            </h3>
                        </Link>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Users className="w-4 h-4 mr-1" />
                            {community.membersCount || 0} участников
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {community.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
                {community.tags?.slice(0, 3).map((tag, i) => (
                    <Badge key={i} variant="primary">{tag}</Badge>
                ))}
            </div>

            {joined ? (
                <Link to={`/community/${community.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full">
                        Открыть
                    </Button>
                </Link>
            ) : (
                <Button size="sm" className="w-full" onClick={() => onJoin && onJoin(community.id)}>
                    Присоединиться
                </Button>
            )}
        </Card>
    )
}

