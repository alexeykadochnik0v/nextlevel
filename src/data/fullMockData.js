// ПОЛНЫЙ НАБОР МОКОВЫХ ДАННЫХ ДЛЯ ТЕСТИРОВАНИЯ

import { mockCommunities } from './mockCommunities'

// ПУБЛИКАЦИИ, ВАКАНСИИ, СТАЖИРОВКИ И ПРОЕКТЫ
export const fullMockPosts = [
    // IT & Tech Hub - Публикации
    {
        id: 'tech-post-1',
        type: 'post',
        communityId: '1',
        community: { id: '1', name: 'IT & Tech', logoUrl: '/images/communities/1.png' },
        title: 'Запустили новый микросервис на Kubernetes',
        content: 'Рады сообщить, что наша команда успешно запустила новый микросервис. Использовали Kubernetes для оркестрации, PostgreSQL для хранения данных. Производительность выросла в 3 раза!',
        authorId: 'user1',
        authorName: 'Александр Иванов',
        authorVerified: true,
        imageUrl: '/images/posts/1.jpg',
        likesCount: 234,
        commentsCount: 45,
        createdAt: '2025-01-15T14:30:00Z'
    },
    {
        id: 'tech-post-2',
        type: 'post',
        communityId: '1',
        community: { id: '1', name: 'IT & Tech', logoUrl: '/images/communities/1.png' },
        title: 'Переход на TypeScript: наш опыт',
        content: 'Делимся опытом миграции большого React проекта с JavaScript на TypeScript. Что изменилось и почему это было правильным решением.',
        authorId: 'user1',
        authorName: 'Мария Петрова',
        authorVerified: true,
        imageUrl: '/images/posts/2.jpg',
        likesCount: 189,
        commentsCount: 38,
        createdAt: '2025-01-12T10:15:00Z'
    },

    // IT - Вакансии
    {
        id: 'tech-vac-1',
        type: 'vacancy',
        communityId: '1',
        community: { id: '1', name: 'IT & Tech', logoUrl: '/images/communities/1.png' },
        title: 'Senior Frontend Developer (React)',
        content: 'Ищем опытного frontend разработчика для работы над крупными enterprise проектами.\n\n📋 Требования:\n• Опыт работы с React 5+ лет\n• TypeScript на продакшене\n• Redux Toolkit, Redux-Saga\n• Next.js 13+ (App Router)\n• Опыт code review\n• Понимание архитектурных паттернов\n\n💼 Обязанности:\n• Разработка новых фичей\n• Оптимизация производительности\n• Менторство junior разработчиков\n• Участие в технических обсуждениях\n\n🎁 Мы предлагаем:\n• 250-350к руб (по результатам собеседования)\n• Удаленная работа\n• Гибкий график\n• ДМС для вас и семьи\n• Корпоративное обучение\n• Современный tech stack',
        authorId: 'user1',
        authorName: 'Александр Иванов',
        salary: '250-350к ₽',
        location: 'Удаленно',
        imageUrl: '/images/vacancies/1.png',
        likesCount: 156,
        commentsCount: 23,
        createdAt: '2025-01-14T10:00:00Z'
    },
    {
        id: 'tech-vac-2',
        type: 'vacancy',
        communityId: '1',
        community: { id: '1', name: 'IT & Tech', logoUrl: '/images/communities/1.png' },
        title: 'Backend Developer (Node.js)',
        content: 'Backend разработчик для работы над микросервисной архитектурой.\n\n📋 Требования:\n• Node.js (Express/Fastify) 3+ года\n• PostgreSQL, работа с индексами\n• Docker, Docker Compose\n• Базовые знания Kubernetes\n• REST API, GraphQL\n• Опыт с message brokers (RabbitMQ/Kafka)\n\n💼 Задачи:\n• Проектирование и разработка микросервисов\n• Оптимизация баз данных\n• Интеграция с внешними API\n• Написание технической документации\n\n🎁 Условия:\n• 200-280к руб\n• Москва (офис в центре) / Удаленно\n• Оплачиваемые больничные\n• Корпоративный английский',
        authorId: 'user1',
        authorName: 'Мария Петрова',
        salary: '200-280к ₽',
        location: 'Москва/Удаленно',
        imageUrl: '/images/vacancies/2.png',
        likesCount: 123,
        commentsCount: 19,
        createdAt: '2025-01-12T09:00:00Z'
    },

    // IT - Стажировка
    {
        id: 'tech-int-1',
        type: 'internship',
        communityId: '1',
        community: { id: '1', name: 'IT & Tech', logoUrl: '/images/communities/1.png' },
        title: 'Стажировка Frontend разработчик',
        content: '3 месяца обучения и практики. Менторство от senior разработчиков. Реальные задачи.\n\nСтипендия: 40-60к руб',
        authorId: 'user1',
        authorName: 'Александр Иванов',
        salary: '40-60к ₽',
        location: 'Удаленно',
        imageUrl: '/images/posts/3.jpg',
        likesCount: 234,
        commentsCount: 67,
        createdAt: '2025-01-13T10:00:00Z'
    },

    // IT - Проект
    {
        id: 'tech-proj-1',
        type: 'project',
        communityId: '1',
        community: { id: '1', name: 'IT & Tech', logoUrl: '/images/communities/1.png' },
        title: 'Open Source библиотека React компонентов',
        content: 'Разрабатываем UI библиотеку. 50+ компонентов, TypeScript, Storybook. Ищем контрибьюторов!',
        authorId: 'user1',
        authorName: 'Иван Соколов',
        imageUrl: '/images/posts/4.jpg',
        likesCount: 445,
        commentsCount: 89,
        createdAt: '2025-01-10T15:00:00Z'
    },

    // Машиностроение - Публикации
    {
        id: 'mech-post-1',
        type: 'post',
        communityId: '2',
        community: { id: '2', name: 'Машиностроение', logoUrl: '/images/communities/2.png' },
        title: 'Автоматизация производственной линии',
        content: 'Завершили проект по автоматизации. Внедрили роботизированные манипуляторы. Производительность +40%.',
        authorId: 'user2',
        authorName: 'Дмитрий Петров',
        authorVerified: true,
        imageUrl: '/images/posts/5.jpg',
        likesCount: 156,
        commentsCount: 28,
        createdAt: '2025-01-14T09:00:00Z'
    },
    {
        id: 'mech-post-2',
        type: 'post',
        communityId: '2',
        community: { id: '2', name: 'Машиностроение', logoUrl: '/images/communities/2.png' },
        title: 'Внедрение IoT датчиков на производстве',
        content: 'Используем IoT и машинное обучение для предсказания поломок. Планируем обслуживание заранее.',
        authorId: 'user2',
        authorName: 'Игорь Сидоров',
        authorVerified: true,
        imageUrl: '/images/6.png',
        likesCount: 198,
        commentsCount: 41,
        createdAt: '2025-01-11T11:30:00Z'
    },
    {
        id: 'mech-post-3',
        type: 'post',
        communityId: '2',
        community: { id: '2', name: 'Машиностроение', logoUrl: '/images/communities/2.png' },
        title: 'Цифровой двойник станка: результаты внедрения',
        content: 'Создали цифровой двойник токарного станка. Симулируем процессы, оптимизируем режимы. Экономия материалов 15%, время наладки сократили вдвое.',
        authorId: 'user2',
        authorName: 'Сергей Морозов',
        authorVerified: true,
        imageUrl: '/images/7.png',
        likesCount: 145,
        commentsCount: 32,
        createdAt: '2025-01-09T13:45:00Z'
    },
    {
        id: 'mech-post-4',
        type: 'post',
        communityId: '2',
        community: { id: '2', name: 'Машиностроение', logoUrl: '/images/communities/2.png' },
        title: 'Новый стандарт контроля качества ISO 9001:2025',
        content: 'Обсуждаем изменения в стандарте. Ужесточили требования к метрологии, добавили блок про цифровизацию процессов.',
        authorId: 'user2',
        authorName: 'Ольга Белова',
        authorVerified: true,
        imageUrl: '/images/8.png',
        likesCount: 89,
        commentsCount: 24,
        createdAt: '2025-01-08T16:20:00Z'
    },

    // Машиностроение - Вакансия
    {
        id: 'mech-vac-1',
        type: 'vacancy',
        communityId: '2',
        community: { id: '2', name: 'Машиностроение', logoUrl: '/images/communities/2.png' },
        title: 'Инженер-технолог',
        content: 'Требуется инженер-технолог на производство металлообрабатывающей продукции.\n\n📋 Требования:\n• Высшее техническое образование\n• Опыт работы инженером-технологом от 3 лет\n• Знание технологии металлообработки\n• Опыт работы в CAD системах (SolidWorks, КОМПАС)\n• Умение читать чертежи\n• Знание стандартов и ГОСТов\n\n💼 Обязанности:\n• Разработка технологических процессов\n• Оптимизация существующих процессов\n• Расчет норм времени и материалов\n• Подбор оборудования и инструмента\n• Работа с конструкторской документацией\n\n🎁 Условия:\n• 120-180к руб\n• Санкт-Петербург, Калининский район\n• График 5/2, 9:00-18:00\n• ДМС после испытательного срока',
        authorId: 'user2',
        authorName: 'Дмитрий Петров',
        salary: '120-180к ₽',
        location: 'Санкт-Петербург',
        imageUrl: '/images/vacancies/3.png',
        likesCount: 89,
        commentsCount: 15,
        createdAt: '2025-01-11T11:00:00Z'
    },

    // Дизайн - Публикации
    {
        id: 'design-post-1',
        type: 'post',
        communityId: '3',
        community: { id: '3', name: 'Дизайн', logoUrl: '/images/communities/3.png' },
        title: 'Редизайн мобильного банка',
        content: 'Показываем процесс редизайна. От исследования до финального UI. Figma + A/B тестирование.',
        authorId: 'user3',
        authorName: 'Анна Смирнова',
        authorVerified: true,
        imageUrl: '/images/7.png',
        likesCount: 421,
        commentsCount: 89,
        createdAt: '2025-01-13T15:45:00Z'
    },
    {
        id: 'design-post-2',
        type: 'post',
        communityId: '3',
        community: { id: '3', name: 'Дизайн', logoUrl: '/images/communities/3.png' },
        title: 'Тренды UI дизайна 2025',
        content: 'Собрали главные тренды года: glassmorphism, 3D элементы, AI-генерация, микроанимации.',
        authorId: 'user3',
        authorName: 'Елена Краснова',
        authorVerified: true,
        imageUrl: '/images/8.png',
        likesCount: 567,
        commentsCount: 123,
        createdAt: '2025-01-09T12:00:00Z'
    },

    // Дизайн - Вакансия
    {
        id: 'design-vac-1',
        type: 'vacancy',
        communityId: '3',
        community: { id: '3', name: 'Дизайн', logoUrl: '/images/communities/3.png' },
        title: 'UI/UX Designer (Middle/Senior)',
        content: 'Работа над мобильными приложениями. Figma, user flow, дизайн-системы.\n\n150-250к руб, удаленка',
        authorId: 'user3',
        authorName: 'Анна Смирнова',
        salary: '150-250к ₽',
        location: 'Удаленно',
        imageUrl: '/images/vacancies/4.png',
        likesCount: 234,
        commentsCount: 45,
        createdAt: '2025-01-10T14:00:00Z'
    },

    // Дизайн - Стажировка
    {
        id: 'design-int-1',
        type: 'internship',
        communityId: '3',
        community: { id: '3', name: 'Дизайн', logoUrl: '/images/communities/3.png' },
        title: 'Стажер UI/UX дизайнер',
        content: 'Реальные проекты, прототипы в Figma, UX исследования. Портфолио приветствуется.\n\n30-50к руб',
        authorId: 'user3',
        authorName: 'Анна Смирнова',
        salary: '30-50к ₽',
        location: 'Москва',
        imageUrl: '/images/9.png',
        likesCount: 345,
        commentsCount: 78,
        createdAt: '2025-01-11T09:00:00Z'
    },

    // Маркетинг - Публикации
    {
        id: 'mark-post-1',
        type: 'post',
        communityId: '4',
        community: { id: '4', name: 'Маркетинг', logoUrl: '/images/communities/4.png' },
        title: 'Кейс: конверсия лендинга +150%',
        content: 'CRO-аудит, новые заголовки, CTA. Конверсия с 2.3% до 5.8%. Делимся методологией.',
        authorId: 'user4',
        authorName: 'Елена Козлова',
        authorVerified: true,
        imageUrl: '/images/10.png',
        likesCount: 312,
        commentsCount: 67,
        createdAt: '2025-01-10T13:20:00Z'
    },

    // Маркетинг - Вакансия
    {
        id: 'mark-vac-1',
        type: 'vacancy',
        communityId: '4',
        community: { id: '4', name: 'Маркетинг', logoUrl: '/images/communities/4.png' },
        title: 'Performance маркетолог',
        content: 'Digital каналы: Яндекс.Директ, Google Ads, таргет, аналитика.\n\n100-180к руб, Москва',
        authorId: 'user4',
        authorName: 'Елена Козлова',
        salary: '100-180к ₽',
        location: 'Москва',
        imageUrl: '/images/vacancies/5.png',
        likesCount: 167,
        commentsCount: 29,
        createdAt: '2025-01-09T10:30:00Z'
    },

    // Маркетинг - Стажировка
    {
        id: 'mark-int-1',
        type: 'internship',
        communityId: '4',
        community: { id: '4', name: 'Маркетинг', logoUrl: '/images/communities/4.png' },
        title: 'Стажер-маркетолог (SMM)',
        content: 'Контент для соцсетей, запуск кампаний, аналитика. Активный пользователь соцсетей.\n\n25-40к руб',
        authorId: 'user4',
        authorName: 'Елена Козлова',
        salary: '25-40к ₽',
        location: 'Удаленно',
        imageUrl: '/images/posts/1.jpg',
        likesCount: 289,
        commentsCount: 56,
        createdAt: '2025-01-09T14:00:00Z'
    },

    // Финансы - Публикации
    {
        id: 'fin-post-1',
        type: 'post',
        communityId: '5',
        community: { id: '5', name: 'Финансы', logoUrl: '/images/communities/5.png' },
        title: 'Налоговые изменения 2025',
        content: 'Ключевые изменения в налоговом законодательстве. Что нужно знать бухгалтерам.',
        authorId: 'user5',
        authorName: 'Михаил Волков',
        authorVerified: true,
        imageUrl: '/images/posts/2.jpg',
        likesCount: 267,
        commentsCount: 52,
        createdAt: '2025-01-09T10:00:00Z'
    },

    // Финансы - Вакансия
    {
        id: 'fin-vac-1',
        type: 'vacancy',
        communityId: '5',
        community: { id: '5', name: 'Финансы', logoUrl: '/images/communities/5.png' },
        title: 'Главный бухгалтер',
        content: 'Ведение учета, налоговая отчетность, 1С, управление командой. Опыт 5+ лет.\n\n150-200к руб',
        authorId: 'user5',
        authorName: 'Михаил Волков',
        salary: '150-200к ₽',
        location: 'Москва',
        imageUrl: '/images/vacancies/6.png',
        likesCount: 134,
        commentsCount: 21,
        createdAt: '2025-01-08T09:00:00Z'
    },

    // HR - Публикации
    {
        id: 'hr-post-1',
        type: 'post',
        communityId: '6',
        community: { id: '6', name: 'HR', logoUrl: '/images/communities/6.png' },
        title: 'Программа адаптации junior-специалистов',
        content: 'Менторство, обучающие модули, встречи с руководством. Retention вырос на 30%.',
        authorId: 'user6',
        authorName: 'Ольга Новикова',
        authorVerified: true,
        imageUrl: '/images/posts/3.jpg',
        likesCount: 178,
        commentsCount: 34,
        createdAt: '2025-01-08T14:15:00Z'
    },

    // HR - Вакансия
    {
        id: 'hr-vac-1',
        type: 'vacancy',
        communityId: '6',
        community: { id: '6', name: 'HR', logoUrl: '/images/communities/6.png' },
        title: 'HR Business Partner',
        content: 'Партнерство с бизнесом, HR стратегии, корпоративная культура. Опыт 3+ года.\n\n180-250к руб',
        authorId: 'user6',
        authorName: 'Ольга Новикова',
        salary: '180-250к ₽',
        location: 'Москва',
        imageUrl: '/images/vacancies/7.png',
        likesCount: 156,
        commentsCount: 28,
        createdAt: '2025-01-07T15:00:00Z'
    },

    // Логистика - Публикации  
    {
        id: 'log-post-1',
        type: 'post',
        communityId: '7',
        community: { id: '7', name: 'Логистика', logoUrl: '/images/communities/7.png' },
        title: 'AI в оптимизации маршрутов',
        content: 'Машинное обучение для маршрутов доставки. Расходы на топливо -25%, доставок в день больше.',
        authorId: 'user7',
        authorName: 'Сергей Морозов',
        authorVerified: true,
        imageUrl: '/images/posts/4.jpg',
        likesCount: 145,
        commentsCount: 29,
        createdAt: '2025-01-07T09:30:00Z'
    },

    // Логистика - Вакансия
    {
        id: 'log-vac-1',
        type: 'vacancy',
        communityId: '7',
        community: { id: '7', name: 'Логистика', logoUrl: '/images/communities/7.png' },
        title: 'Руководитель отдела логистики',
        content: 'Управление командой 15 чел, оптимизация, работа с перевозчиками. Опыт 3+ года.\n\n150-220к руб',
        authorId: 'user7',
        authorName: 'Сергей Морозов',
        salary: '150-220к ₽',
        location: 'Санкт-Петербург',
        imageUrl: '/images/vacancies/8.png',
        likesCount: 112,
        commentsCount: 18,
        createdAt: '2025-01-06T11:00:00Z'
    },

    // Продажи - Публикации
    {
        id: 'sales-post-1',
        type: 'post',
        communityId: '8',
        community: { id: '8', name: 'Продажи', logoUrl: '/images/communities/8.png' },
        title: 'Как закрыли сделку на $500k',
        content: 'Реальный кейс B2B продажи. От первого касания до договора. Техники работы с возражениями.',
        authorId: 'user8',
        authorName: 'Игорь Соколов',
        authorVerified: true,
        imageUrl: '/images/posts/5.jpg',
        likesCount: 534,
        commentsCount: 98,
        createdAt: '2025-01-06T16:00:00Z'
    },

    // Продажи - Вакансия
    {
        id: 'sales-vac-1',
        type: 'vacancy',
        communityId: '8',
        community: { id: '8', name: 'Продажи', logoUrl: '/images/communities/8.png' },
        title: 'Менеджер по продажам B2B',
        content: 'SaaS продажи, переговоры с ЛПР, AmoCRM. Длинный цикл сделки.\n\n80к + бонусы (до 200к)',
        authorId: 'user8',
        authorName: 'Игорь Соколов',
        salary: '80к + бонусы',
        location: 'Москва',
        imageUrl: '/images/vacancies/9.png',
        likesCount: 203,
        commentsCount: 34,
        createdAt: '2025-01-05T10:00:00Z'
    },

    // Юристы - Публикации
    {
        id: 'legal-post-1',
        type: 'post',
        communityId: '9',
        community: { id: '9', name: 'Юристы', logoUrl: '/images/communities/9.png' },
        title: 'Обзор судебной практики Q4 2024',
        content: 'Анализируем важнейшие решения по корпоративным спорам. Новые прецеденты и их влияние.',
        authorId: 'user9',
        authorName: 'Виктория Федорова',
        authorVerified: true,
        imageUrl: '/images/6.png',
        likesCount: 189,
        commentsCount: 43,
        createdAt: '2025-01-05T14:00:00Z'
    },

    // Юристы - Вакансия
    {
        id: 'legal-vac-1',
        type: 'vacancy',
        communityId: '9',
        community: { id: '9', name: 'Юристы', logoUrl: '/images/communities/9.png' },
        title: 'Корпоративный юрист',
        content: 'M&A сделки, договорная работа, интеллектуальная собственность. Опыт 5+ лет.\n\n200-300к руб',
        authorId: 'user9',
        authorName: 'Виктория Федорова',
        salary: '200-300к ₽',
        location: 'Москва',
        imageUrl: '/images/vacancies/10.png',
        likesCount: 167,
        commentsCount: 25,
        createdAt: '2025-01-04T14:00:00Z'
    },

    // Стартапы - Публикации
    {
        id: 'startup-post-1',
        type: 'post',
        communityId: '10',
        community: { id: '10', name: 'Стартапы', logoUrl: '/images/communities/10.png' },
        title: 'Привлекли $2M seed раунд',
        content: 'Делимся опытом привлечения инвестиций. Питч-дек, переговоры с фондами, условия сделки.',
        authorId: 'user10',
        authorName: 'Артем Лебедев',
        authorVerified: true,
        imageUrl: '/images/7.png',
        likesCount: 789,
        commentsCount: 156,
        createdAt: '2025-01-04T10:00:00Z'
    },
    {
        id: 'startup-post-2',
        type: 'post',
        communityId: '10',
        community: { id: '10', name: 'Стартапы', logoUrl: '/images/communities/10.png' },
        title: 'От идеи до первых клиентов за 3 месяца',
        content: 'История запуска нашего SaaS стартапа. MVP, первые пользователи, поиск product-market fit.',
        authorId: 'user10',
        authorName: 'Мария Волкова',
        authorVerified: true,
        imageUrl: '/images/8.png',
        likesCount: 612,
        commentsCount: 134,
        createdAt: '2025-01-02T15:00:00Z'
    }
]

// ПРЕДЛОЖЕНИЯ О СОТРУДНИЧЕСТВЕ
export const fullMockPartnerships = [
    {
        id: 'part1',
        communityId: '1',
        communityName: 'IT & Tech Hub',
        community: { id: '1', name: 'IT & Tech Hub', logoUrl: '/images/communities/1.png' },
        authorId: 'user1',
        authorName: 'Александр Иванов',
        authorVerified: true,
        title: 'Ищем технологического партнера для AI решений',
        description: 'Разрабатываем AI-powered платформу для автоматизации бизнес-процессов. Ищем партнера с экспертизой в ML/AI для совместной разработки и вывода продукта на рынок.',
        partnerType: 'integrator',
        expiryDate: '2025-03-31',
        status: 'open',
        createdAt: '2025-01-14T10:00:00Z'
    },
    {
        id: 'part2',
        communityId: '2',
        communityName: 'Машиностроение и производство',
        community: { id: '2', name: 'Машиностроение и производство', logoUrl: '/images/communities/2.png' },
        authorId: 'user2',
        authorName: 'Дмитрий Петров',
        authorVerified: true,
        title: 'Поиск поставщика комплектующих',
        description: 'Производственное предприятие ищет надежного поставщика высокоточных комплектующих для станков. Требуется сертификация ISO 9001.',
        partnerType: 'supplier',
        expiryDate: '2025-02-28',
        status: 'open',
        createdAt: '2025-01-12T11:00:00Z'
    },
    {
        id: 'part3',
        communityId: '3',
        communityName: 'Дизайн и креатив',
        community: { id: '3', name: 'Дизайн и креатив', logoUrl: '/images/communities/3.png' },
        authorId: 'user3',
        authorName: 'Анна Смирнова',
        authorVerified: true,
        title: 'Партнерство с IT компаниями',
        description: 'Дизайн-студия предлагает сотрудничество IT компаниям. Полный цикл дизайна: от UX исследований до готового UI. Выгодные условия для партнеров.',
        partnerType: 'contractor',
        expiryDate: null,
        status: 'open',
        createdAt: '2025-01-11T14:00:00Z'
    },
    {
        id: 'part4',
        communityId: '8',
        communityName: 'Продажи и развитие бизнеса',
        community: { id: '8', name: 'Продажи и развитие бизнеса', logoUrl: '/images/communities/8.png' },
        authorId: 'user8',
        authorName: 'Игорь Соколов',
        authorVerified: true,
        title: 'Ищем реселлеров для SaaS продукта',
        description: 'CRM система для малого бизнеса. Ищем реселлеров в регионах. Маржа 30%, маркетинговая поддержка, обучение.',
        partnerType: 'reseller',
        expiryDate: '2025-04-30',
        status: 'open',
        createdAt: '2025-01-10T09:00:00Z'
    },
    {
        id: 'part5',
        communityId: '10',
        communityName: 'Стартапы и предпринимательство',
        community: { id: '10', name: 'Стартапы и предпринимательство', logoUrl: '/images/communities/10.png' },
        authorId: 'user10',
        authorName: 'Артем Лебедев',
        authorVerified: true,
        title: 'Ищем инвестора для масштабирования',
        description: 'EdTech стартап, 1000+ активных пользователей, MRR $15k. Ищем инвестора для выхода на рынок СНГ. Seed раунд $500k.',
        partnerType: 'investor',
        expiryDate: '2025-03-15',
        status: 'open',
        createdAt: '2025-01-08T16:00:00Z'
    }
]

export { mockCommunities }
