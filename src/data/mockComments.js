export const mockComments = {
    '1': [
        {
            id: '1',
            text: 'Поздравляю! Это действительно важный проект 🎉',
            author: { uid: 'mock-user-1', displayName: 'Мария Петрова', photoURL: null },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likesCount: 12,
            replies: []
        },
        {
            id: '2',
            text: 'Отличная работа! Хочу присоединиться к проекту',
            author: { uid: 'mock-user-2', displayName: 'Дмитрий Козлов', photoURL: null },
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            likesCount: 8,
            replies: []
        }
    ],
    '2': [
        {
            id: '1',
            text: 'Отличное мероприятие! Обязательно буду участвовать 🚀',
            author: { uid: 'mock-user-3', displayName: 'Иван Сидоров', photoURL: null },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likesCount: 15,
            replies: [
                {
                    id: '2',
                    text: 'Присоединяйся к нашей команде!',
                    author: { uid: 'mock-user-4', displayName: 'Алексей Петров', photoURL: null },
                    createdAt: new Date(Date.now() - 3500000).toISOString(),
                    likesCount: 5,
                    replies: []
                }
            ]
        },
        {
            id: '3',
            text: 'Какие требования к участникам?',
            author: { uid: 'mock-user-5', displayName: 'Анна Смирнова', photoURL: null },
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            likesCount: 7,
            replies: []
        }
    ],
    '3': [
        {
            id: '1',
            text: 'Интересная вакансия! Где можно отправить резюме?',
            author: { uid: 'mock-user-6', displayName: 'Сергей Иванов', photoURL: null },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likesCount: 3,
            replies: []
        }
    ],
    '4': [
        {
            id: '1',
            text: 'Отличная возможность для начала карьеры!',
            author: { uid: 'mock-user-7', displayName: 'Елена Волкова', photoURL: null },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likesCount: 8,
            replies: []
        },
        {
            id: '2',
            text: 'Есть ли возможность удаленной стажировки?',
            author: { uid: 'mock-user-8', displayName: 'Максим Попов', photoURL: null },
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            likesCount: 4,
            replies: []
        }
    ],
    '5': [
        {
            id: '1',
            text: 'Супер кейс! Обязательно попробую',
            author: { uid: 'mock-user-9', displayName: 'Ольга Новикова', photoURL: null },
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likesCount: 10,
            replies: []
        }
    ]
}

// Функция для подсчета всех комментариев (включая ответы)
export const countComments = (comments) => {
    if (!comments) return 0
    return comments.reduce((total, comment) => {
        return total + 1 + (comment.replies ? countComments(comment.replies) : 0)
    }, 0)
}

