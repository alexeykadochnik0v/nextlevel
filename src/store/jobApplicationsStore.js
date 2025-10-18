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

const useJobApplicationsStore = create(
    persist(
        (set, get) => ({
            applications: [],
            loading: false,

            // Загрузить заявки на вакансии
            loadApplications: (jobId = null, employerId = null) => {
                set({ loading: true })
                try {
                    const applicationsRef = collection(db, 'jobApplications')
                    let q = query(
                        applicationsRef,
                        orderBy('createdAt', 'desc')
                    )

                    if (jobId) {
                        q = query(
                            applicationsRef,
                            where('jobId', '==', jobId),
                            orderBy('createdAt', 'desc')
                        )
                    } else if (employerId) {
                        q = query(
                            applicationsRef,
                            where('employerId', '==', employerId),
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
                        console.error('Error loading job applications:', error)
                        set({ loading: false })
                    })

                    return unsubscribe
                } catch (error) {
                    console.error('Error setting up job applications listener:', error)
                    set({ loading: false })
                    return () => { }
                }
            },

            // Подать заявку на вакансию
            submitApplication: async (applicationData) => {
                try {
                    const application = {
                        ...applicationData,
                        createdAt: new Date().toISOString(),
                        status: 'pending'
                    }

                    const docRef = await addDoc(collection(db, 'jobApplications'), application)

                    // Отправить уведомление работодателю
                    const { addNotification } = useNotificationsStore.getState()
                    await addNotification({
                        type: 'job_application',
                        userId: applicationData.employerId,
                        fromUserId: applicationData.applicantId,
                        fromUserName: applicationData.applicantName,
                        fromUserPhotoURL: applicationData.applicantPhotoURL,
                        jobId: applicationData.jobId,
                        jobTitle: applicationData.jobTitle,
                        applicationId: docRef.id,
                        message: `Новый отклик на вакансию "${applicationData.jobTitle}"`
                    })

                    return docRef.id
                } catch (error) {
                    console.error('Error submitting job application:', error)
                    throw error
                }
            },

            // Одобрить заявку на вакансию
            approveApplication: async (applicationId, approvedBy) => {
                try {
                    await updateDoc(doc(db, 'jobApplications', applicationId), {
                        status: 'approved',
                        reviewedAt: new Date().toISOString(),
                        reviewedBy: approvedBy
                    })

                    // Отправить уведомление кандидату
                    const application = get().applications.find(app => app.id === applicationId)
                    if (application) {
                        const { addNotification } = useNotificationsStore.getState()
                        await addNotification({
                            type: 'application_approved',
                            userId: application.applicantId,
                            fromUserId: approvedBy,
                            jobId: application.jobId,
                            jobTitle: application.jobTitle,
                            message: `Ваш отклик на "${application.jobTitle}" принят!`
                        })

                        // Создать чат между студентом и работодателем
                        await get().createJobChat(application, approvedBy)
                    }
                } catch (error) {
                    console.error('Error approving job application:', error)
                    throw error
                }
            },

            // Отклонить заявку на вакансию
            rejectApplication: async (applicationId, rejectedBy) => {
                try {
                    await updateDoc(doc(db, 'jobApplications', applicationId), {
                        status: 'rejected',
                        reviewedAt: new Date().toISOString(),
                        reviewedBy: rejectedBy
                    })

                    // Отправить уведомление кандидату
                    const application = get().applications.find(app => app.id === applicationId)
                    if (application) {
                        const { addNotification } = useNotificationsStore.getState()
                        await addNotification({
                            type: 'application_rejected',
                            userId: application.applicantId,
                            fromUserId: rejectedBy,
                            jobId: application.jobId,
                            jobTitle: application.jobTitle,
                            message: `Ваш отклик на "${application.jobTitle}" отклонен`
                        })
                    }
                } catch (error) {
                    console.error('Error rejecting job application:', error)
                    throw error
                }
            },

            // Создать чат для вакансии
            createJobChat: async (application, employerId) => {
                try {
                    const chatData = {
                        type: 'job',
                        participants: [application.applicantId, employerId],
                        context: {
                            jobId: application.jobId,
                            companyId: application.companyId,
                            jobApplicationId: application.id
                        },
                        createdAt: new Date().toISOString(),
                        lastMessage: null,
                        lastMessageAt: null
                    }

                    const docRef = await addDoc(collection(db, 'chats'), chatData)

                    // Отправить уведомления о создании чата
                    const { addNotification } = useNotificationsStore.getState()
                    await Promise.all([
                        addNotification({
                            type: 'new_chat',
                            userId: application.applicantId,
                            fromUserId: employerId,
                            chatId: docRef.id,
                            message: `Создан чат для обсуждения вакансии`
                        }),
                        addNotification({
                            type: 'new_chat',
                            userId: employerId,
                            fromUserId: application.applicantId,
                            chatId: docRef.id,
                            message: `Создан чат для обсуждения вакансии`
                        })
                    ])

                    return docRef.id
                } catch (error) {
                    console.error('Error creating job chat:', error)
                    throw error
                }
            },

            // Удалить заявку
            deleteApplication: async (applicationId) => {
                try {
                    await deleteDoc(doc(db, 'jobApplications', applicationId))
                } catch (error) {
                    console.error('Error deleting job application:', error)
                    throw error
                }
            }
        }),
        {
            name: 'job-applications-storage',
            partialize: (state) => ({
                // Можно добавить кеширование если нужно
            })
        }
    )
)

export default useJobApplicationsStore
