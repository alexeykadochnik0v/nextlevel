import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db } from '../lib/firebase'
import { collection, doc, getDocs, addDoc, updateDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore'

const useNotificationsStore = create(
    persist(
        (set, get) => ({
            notifications: [],
            unreadCount: 0,
            loading: false,

            // Загрузить уведомления пользователя
            loadNotifications: (userId) => {
                set({ loading: true })
                try {
                    const notificationsRef = collection(db, 'notifications')
                    // Упрощенный запрос без orderBy для избежания проблем с индексами
                    const q = query(
                        notificationsRef,
                        where('userId', '==', userId)
                    )

                    const unsubscribe = onSnapshot(q, (querySnapshot) => {
                        const notifications = []
                        let unreadCount = 0

                        querySnapshot.forEach((doc) => {
                            const notification = { id: doc.id, ...doc.data() }
                            notifications.push(notification)
                            if (!notification.read) {
                                unreadCount++
                            }
                        })

                        // Сортируем вручную по дате создания
                        notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

                        set({
                            notifications,
                            unreadCount,
                            loading: false
                        })
                    }, (error) => {
                        console.error('Error loading notifications:', error)
                        set({ loading: false })
                    })

                    return unsubscribe
                } catch (error) {
                    console.error('Error setting up notifications listener:', error)
                    set({ loading: false })
                    return () => { } // Возвращаем пустую функцию cleanup
                }
            },

            // Добавить уведомление
            addNotification: async (notificationData) => {
                try {
                    const notification = {
                        ...notificationData,
                        createdAt: new Date().toISOString(),
                        read: false
                    }

                    await addDoc(collection(db, 'notifications'), notification)
                } catch (error) {
                    console.error('Error adding notification:', error)
                    throw error
                }
            },

            // Отметить уведомление как прочитанное
            markAsRead: async (notificationId) => {
                try {
                    await updateDoc(doc(db, 'notifications', notificationId), {
                        read: true,
                        readAt: new Date().toISOString()
                    })
                } catch (error) {
                    console.error('Error marking notification as read:', error)
                }
            },

            // Отметить все уведомления как прочитанные
            markAllAsRead: async (userId) => {
                try {
                    const notifications = get().notifications
                    const unreadNotifications = notifications.filter(n => !n.read)

                    const promises = unreadNotifications.map(notification =>
                        updateDoc(doc(db, 'notifications', notification.id), {
                            read: true,
                            readAt: new Date().toISOString()
                        })
                    )

                    await Promise.all(promises)
                } catch (error) {
                    console.error('Error marking all notifications as read:', error)
                }
            },

            // Очистить уведомления
            clearNotifications: () => {
                set({ notifications: [], unreadCount: 0 })
            }
        }),
        {
            name: 'notifications-storage',
            partialize: (state) => ({
                notifications: state.notifications,
                unreadCount: state.unreadCount
            })
        }
    )
)

export default useNotificationsStore
