# NextLevel - Платформа для молодежных сообществ и клубов предприятий

![React](https://img.shields.io/badge/React-19.1.1-blue.svg)

![Vite](https://img.shields.io/badge/Vite-7.1.7-646CFF.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC.svg)
![Firebase](https://img.shields.io/badge/Firebase-Integrated-FFA611.svg)

**NextLevel** — это современная веб-платформа для объединения молодых специалистов и предприятий. Приложение позволяет создавать сообщества, публиковать вакансии и стажировки, общаться в чатах и развивать профессиональные навыки.

## 🚀 Демо

**Live Demo:** [https://levelnext-d7504.web.app](https://levelnext-d7504.web.app)

## ✨ Основные возможности

### 🔐 Авторизация
- Регистрация с выбором роли (Пользователь / Наставник / Работодатель)
- Вход с сохранением сессии
- Восстановление пароля через Firebase Auth

### 📰 Лента публикаций
- Персонализированная лента с постами, событиями, вакансиями и проектами
- Лайки с сохранением в localStorage
- Кнопка "Поделиться" с копированием ссылки
- Карточки с изображениями

### 💬 Система комментариев
- ✅ Создание комментариев (только для авторизованных)
- ✅ Многоуровневые ответы на комментарии
- ✅ Лайки на комментариях
- ✅ Удаление своих комментариев
- ✅ Сохранение всех действий в localStorage

### 👥 Сообщества
- Информация о сообществе
- Вкладки: Публикации / Работа / Чаты
- Возможность присоединиться

### 👤 Профиль пользователя
- Геймификация: уровни (1-10), баллы, бейджи
- Портфолио: навыки, проекты
- История активности

### 💼 Админ-панель
- Аналитика: статистика участников, вовлеченность
- Управление сообществами
- Поиск талантов по навыкам

### 💬 Чаты (Real-time)
- Текстовые сообщения
- Вложение файлов
- Socket.IO для real-time обновлений

## 🛠️ Технологии

### Frontend
- **React 19.1.1** - современная UI библиотека
- **Vite 7.1.7** - быстрый сборщик
- **React Router DOM 7.9.4** - маршрутизация
- **Tailwind CSS 3.4.17** - стилизация
- **Zustand 5.0.8** - управление состоянием
- **Socket.IO Client 4.8.1** - WebSocket для чатов
- **Lucide React** - иконки

### Backend
- **Firebase Authentication** - авторизация
- **Firebase Firestore** - база данных
- **Firebase Storage** - хранение файлов
- **Firebase Hosting** - хостинг

## 📦 Установка и запуск

### 1. Клонировать репозиторий
```bash
git clone https://github.com/alexeykadochnik0v/nextlevel.git
cd nextlevel
```

### 2. Установить зависимости
```bash
npm install
```

### 3. Настроить Firebase
Создайте файл `.env` в корне проекта:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_SOCKET_URL=http://localhost:3001
```

### 4. Запустить dev сервер
```bash
npm run dev
```

Приложение откроется на [http://localhost:5173](http://localhost:5173)

### 5. Собрать для production
```bash
npm run build
```

### 6. Деплой на Firebase Hosting
```bash
npx firebase-tools deploy --only hosting
```

## 📁 Структура проекта

```
src/
├── components/          # React компоненты
│   ├── ui/             # UI библиотека (Button, Input, Card, Avatar, Badge, Textarea, Toast)
│   ├── Header.jsx      # Шапка с поиском
│   ├── Layout.jsx      # Layout для страниц
│   ├── PostCard.jsx    # Карточка публикации
│   ├── Comment.jsx     # Компонент комментария
│   └── ...
├── pages/              # Страницы
│   ├── Home.jsx        # Главная с лентой
│   ├── Login.jsx       # Вход
│   ├── Register.jsx    # Регистрация
│   ├── Post.jsx        # Детальная публикация
│   ├── Community.jsx   # Страница сообщества
│   ├── Profile.jsx     # Профиль пользователя
│   ├── Chat.jsx        # Чат
│   └── Admin.jsx       # Админ-панель
├── store/              # Zustand stores
│   ├── authStore.js    # Авторизация
│   ├── postsStore.js   # Посты и лайки
│   ├── commentsStore.js # Комментарии
│   └── ...
├── hooks/              # Custom hooks
│   ├── useAuth.js      # Работа с авторизацией
│   └── useChat.js      # Работа с чатами
├── data/               # Моковые данные
│   ├── mockPosts.js    # Посты с изображениями
│   ├── mockComments.js # Комментарии
│   └── filters.js      # Фильтры и навыки
├── lib/                # Утилиты
│   ├── firebase.js     # Firebase конфигурация
│   └── utils.js        # Вспомогательные функции
└── services/           # Сервисы
    └── socket.js       # Socket.IO клиент
```

## 🎯 Роли и права

### 👤 Пользователь
- Вступление в сообщества
- Создание публикаций
- Комментирование и лайки
- Участие в чатах

### 👨‍🏫 Наставник
- Все права пользователя
- Создание обучающих материалов
- Ведение чатов с участниками

### 💼 Работодатель
- Создание сообществ
- Публикация вакансий и стажировок
- Аналитика и поиск талантов

## 🚀 Текущий статус

✅ **MVP готов!**
- [x] Авторизация и регистрация
- [x] Лента с постами, вакансиями, событиями
- [x] Полноценная система комментариев
- [x] Лайки на постах и комментариях
- [x] Поделиться постами
- [x] Кэширование (localStorage + Zustand persist)
- [x] Админ-панель
- [x] Профиль с геймификацией
- [x] Сообщества
- [x] Чаты (UI готов)

## 📋 Roadmap

### Ближайшие задачи
- [ ] Интеграция Firestore для постов и комментариев
- [ ] Socket.IO сервер для real-time чатов
- [ ] Загрузка изображений в Firebase Storage
- [ ] Пагинация для ленты
- [ ] Уведомления

### Будущие улучшения
- [ ] PWA (Progressive Web App)
- [ ] Push-уведомления
- [ ] Email рассылки
- [ ] Реакции (эмодзи)
- [ ] Упоминания (@username)
- [ ] Редактирование комментариев

## 📄 Лицензия

MIT License - можно использовать в любых целях.

## 👨‍💻 Автор

Проект разработан в рамках создания платформы для объединения молодежи и промышленных предприятий.

## 🤝 Участие в разработке

Contributions are welcome! Пожалуйста:
1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📞 Контакты

GitHub: [@alexeykadochnik0v](https://github.com/alexeykadochnik0v)

---

⭐ Если проект понравился, поставьте звезду!
