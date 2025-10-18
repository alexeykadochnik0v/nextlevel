import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db } from '../lib/firebase'
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot
} from 'firebase/firestore'
import useNotificationsStore from './notificationsStore'

const usePartnershipStore = create(
    persist(
        (set, get) => ({
            offers: [],
            applications: [],
            loading: false,

            // Загрузить предложения о сотрудничестве
            loadOffers: (communityId = null) => {
                set({ loading: true })
                try {
                    const offersRef = collection(db, 'partnershipOffers')
                    let q = query(
                        offersRef,
                        orderBy('createdAt', 'desc')
                    )

                    if (communityId) {
                        q = query(
                            offersRef,
                            where('communityId', '==', communityId),
                            orderBy('createdAt', 'desc')
                        )
                    }

                    const unsubscribe = onSnapshot(q, (querySnapshot) => {
                        const offers = []
                        querySnapshot.forEach((doc) => {
                            offers.push({ id: doc.id, ...doc.data() })
                        })
                        set({ offers, loading: false })
                    }, (error) => {
                        console.error('Error loading partnership offers:', error)
                        set({ loading: false })
                    })

                    return unsubscribe
                } catch (error) {
                    console.error('Error setting up partnership offers listener:', error)
                    set({ loading: false })
                    return () => { }
                }
            },

            // Создать предложение о сотрудничестве
            createOffer: async (offerData) => {
                try {
                    const offer = {
                        ...offerData,
                        createdAt: new Date().toISOString(),
                        status: 'active'
                    }

                    const docRef = await addDoc(collection(db, 'partnershipOffers'), offer)
                    return docRef.id
                } catch (error) {
                    console.error('Error creating partnership offer:', error)
                    throw error
                }
            },

            // Загрузить заявки на сотрудничество
            loadApplications: (communityId = null) => {
                set({ loading: true })
                try {
                    const applicationsRef = collection(db, 'partnershipApplications')
                    let q = query(
                        applicationsRef,
                        orderBy('createdAt', 'desc')
                    )

                    if (communityId) {
                        q = query(
                            applicationsRef,
                            where('toCommunityId', '==', communityId),
                            orderBy('createdAt', 'desc')
                        )
                    }

                    const unsubscribe = onSnapshot(q, (querySnapshot) => {
                        const applications = []
                        querySnapshot.forEach((doc) => {
                            applications.push({ id: doc.id, ...doc.data() })
                        })
                        set({ applications, loading: false })
                    }, (error) => {
                        console.error('Error loading partnership applications:', error)
                        set({ loading: false })
                    })

                    return unsubscribe
                } catch (error) {
                    console.error('Error setting up partnership applications listener:', error)
                    set({ loading: false })
                    return () => { }
                }
            },

            // Подать заявку на сотрудничество
            submitApplication: async (applicationData) => {
                try {
                    const application = {
                        ...applicationData,
                        createdAt: new Date().toISOString(),
                        status: 'pending'
                    }

                    const docRef = await addDoc(collection(db, 'partnershipApplications'), application)

                    // Отправить уведомление
                    const { addNotification } = useNotificationsStore.getState()
                    await addNotification({
                        type: 'partnership_request',
                        userId: applicationData.toCommunityAdminId,
                        fromUserId: applicationData.fromUserId,
                        fromUserName: applicationData.fromUserName,
                        fromUserPhotoURL: applicationData.fromUserPhotoURL,
                        fromCommunityId: applicationData.fromCommunityId,
                        fromCommunityName: applicationData.fromCommunityName,
                        offerId: applicationData.offerId,
                        applicationId: docRef.id,
                        message: `Запрос на сотрудничество от "${applicationData.fromCommunityName}"`
                    })

                    return docRef.id
                } catch (error) {
                    console.error('Error submitting partnership application:', error)
                    throw error
                }
            },

            // Одобрить заявку на сотрудничество
            approveApplication: async (applicationId, approvedBy) => {
                try {
                    await updateDoc(doc(db, 'partnershipApplications', applicationId), {
                        status: 'approved',
                        reviewedAt: new Date().toISOString(),
                        reviewedBy: approvedBy
                    })

                    // Отправить уведомление о принятии
                    const application = get().applications.find(app => app.id === applicationId)
                    if (application) {
                        const { addNotification } = useNotificationsStore.getState()
                        await addNotification({
                            type: 'application_approved',
                            userId: application.fromUserId,
                            fromUserId: approvedBy,
                            fromCommunityId: application.toCommunityId,
                            fromCommunityName: application.toCommunityName,
                            offerId: application.offerId,
                            message: `Ваш запрос на сотрудничество принят!`
                        })

                        // Создать чат между сообществами
                        await get().createPartnershipChat(application)
                    }
                } catch (error) {
                    console.error('Error approving partnership application:', error)
                    throw error
                }
            },

            // Отклонить заявку на сотрудничество
            rejectApplication: async (applicationId, rejectedBy) => {
                try {
                    await updateDoc(doc(db, 'partnershipApplications', applicationId), {
                        status: 'rejected',
                        reviewedAt: new Date().toISOString(),
                        reviewedBy: rejectedBy
                    })

                    // Отправить уведомление об отклонении
                    const application = get().applications.find(app => app.id === applicationId)
                    if (application) {
                        const { addNotification } = useNotificationsStore.getState()
                        await addNotification({
                            type: 'application_rejected',
                            userId: application.fromUserId,
                            fromUserId: rejectedBy,
                            fromCommunityId: application.toCommunityId,
                            fromCommunityName: application.toCommunityName,
                            offerId: application.offerId,
                            message: `Ваш запрос на сотрудничество отклонен`
                        })
                    }
                } catch (error) {
                    console.error('Error rejecting partnership application:', error)
                    throw error
                }
            },

            // Создать чат для сотрудничества
            createPartnershipChat: async (application) => {
                try {
                    const chatData = {
                        type: 'partnership',
                        participants: [application.fromUserId, application.toCommunityAdminId],
                        context: {
                            offerId: application.offerId,
                            communities: [application.fromCommunityId, application.toCommunityId],
                            partnershipApplicationId: application.id
                        },
                        createdAt: new Date().toISOString(),
                        lastMessage: null,
                        lastMessageAt: null
                    }

                    const docRef = await addDoc(collection(db, 'chats'), chatData)

                    // Отправить уведомление о создании чата
                    const { addNotification } = useNotificationsStore.getState()
                    await Promise.all([
                        addNotification({
                            type: 'new_chat',
                            userId: application.fromUserId,
                            fromUserId: application.toCommunityAdminId,
                            chatId: docRef.id,
                            message: `Создан чат для сотрудничества`
                        }),
                        addNotification({
                            type: 'new_chat',
                            userId: application.toCommunityAdminId,
                            fromUserId: application.fromUserId,
                            chatId: docRef.id,
                            message: `Создан чат для сотрудничества`
                        })
                    ])

                    return docRef.id
                } catch (error) {
                    console.error('Error creating partnership chat:', error)
                    throw error
                }
            },

            // Удалить предложение о сотрудничестве
            deleteOffer: async (offerId) => {
                try {
                    await deleteDoc(doc(db, 'partnershipOffers', offerId))
                } catch (error) {
                    console.error('Error deleting partnership offer:', error)
                    throw error
                }
            }
        }),
        {
            name: 'partnership-storage',
            partialize: (state) => ({
                // Можно добавить кеширование если нужно
            })
        }
    )
)

export default usePartnershipStore
