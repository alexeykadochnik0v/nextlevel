import Avatar from './ui/Avatar'

export default function Message({ message, isOwn }) {
    return (
        <div className={`flex items-end space-x-2 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {!isOwn && (
                <Avatar
                    src={message.author.photoURL}
                    alt={message.author.displayName}
                    size="sm"
                />
            )}

            <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && (
                    <p className="text-xs text-gray-600 mb-1 px-2">
                        {message.author.displayName}
                    </p>
                )}

                <div
                    className={`px-4 py-2 rounded-2xl ${isOwn
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                >
                    <p className="text-sm break-words">{message.text}</p>

                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {message.attachments.map((file, i) => (
                                <a
                                    key={i}
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-xs underline block ${isOwn ? 'text-white' : 'text-indigo-600'
                                        }`}
                                >
                                    📎 {file.name}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <p className={`text-xs text-gray-500 mt-1 px-2 ${isOwn ? 'text-right' : ''}`}>
                    {new Date(message.createdAt).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </p>
            </div>
        </div>
    )
}

