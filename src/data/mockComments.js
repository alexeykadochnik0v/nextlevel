export const mockComments = {
    '1': [
        {
            id: '1',
            content: 'Поздравляю! Это действительно важный проект 🎉',
            userId: 'mock-user-1',
            userDisplayName: 'Мария Петрова',
            userPhotoURL: null,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likesCount: 12,
            likes: []
        },
        {
            id: '2',
            content: 'Отличная работа! Хочу присоединиться к проекту',
            userId: 'mock-user-2',
            userDisplayName: 'Дмитрий Козлов',
            userPhotoURL: null,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            likesCount: 8,
            likes: []
        }
    ],
    '2': [
        {
            id: '1',
            content: 'Отличное мероприятие! Обязательно буду участвовать 🚀',
            userId: 'mock-user-3',
            userDisplayName: 'Иван Сидоров',
            userPhotoURL: null,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likesCount: 15,
            likes: []
        },
        {
            id: '3',
            content: 'Какие требования к участникам?',
            userId: 'mock-user-5',
            userDisplayName: 'Анна Смирнова',
            userPhotoURL: null,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            likesCount: 7,
            likes: []
        }
    ],
    '3': [
        {
            id: '1',
            content: 'Интересная вакансия! Где можно отправить резюме?',
            userId: 'mock-user-6',
            userDisplayName: 'Сергей Иванов',
            userPhotoURL: null,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likesCount: 3,
            likes: []
        }
    ],
    '4': [
        {
            id: '1',
            content: 'Отличная возможность для начала карьеры!',
            userId: 'mock-user-7',
            userDisplayName: 'Елена Волкова',
            userPhotoURL: null,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likesCount: 8,
            likes: []
        },
        {
            id: '2',
            content: 'Есть ли возможность удаленной стажировки?',
            userId: 'mock-user-8',
            userDisplayName: 'Максим Попов',
            userPhotoURL: null,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            likesCount: 4,
            likes: []
        }
    ],
    '5': [
        {
            id: '1',
            content: 'Супер кейс! Обязательно попробую',
            userId: 'mock-user-9',
            userDisplayName: 'Ольга Новикова',
            userPhotoURL: null,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likesCount: 10,
            likes: []
        }
    ]
}

// Функция для подсчета всех комментариев
export const countComments = (comments) => {
    if (!comments) return 0
    return comments.length
}

