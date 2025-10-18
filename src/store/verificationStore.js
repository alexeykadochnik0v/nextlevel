import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useVerificationStore = create(
    persist(
        (set) => ({
            verificationRequests: [],
            userVerification: {
                student: {
                    status: 'none', // none | pending | approved | rejected
                    docUrl: null,
                    university: '',
                    submittedAt: null,
                    reviewedAt: null,
                    reviewedBy: null,
                    reason: ''
                },
                employer: {
                    status: 'none',
                    docUrl: null,
                    communityId: null,
                    companyName: '',
                    inn: '',
                    submittedAt: null,
                    reviewedAt: null,
                    reviewedBy: null,
                    reason: ''
                }
            },

            // Отправить заявку на верификацию студента
            submitStudentVerification: (data) => set((state) => ({
                userVerification: {
                    ...state.userVerification,
                    student: {
                        ...data,
                        status: 'pending',
                        submittedAt: new Date().toISOString()
                    }
                }
            })),

            // Отправить заявку на верификацию работодателя
            submitEmployerVerification: (data) => set((state) => ({
                userVerification: {
                    ...state.userVerification,
                    employer: {
                        ...data,
                        status: 'pending',
                        submittedAt: new Date().toISOString()
                    }
                }
            })),

            // Установить данные верификации (загрузка из Firestore)
            setVerification: (verification) => set({
                userVerification: verification
            }),

            // Обновить статус верификации (для админа)
            updateVerificationStatus: (type, status, reason = '') => set((state) => ({
                userVerification: {
                    ...state.userVerification,
                    [type]: {
                        ...state.userVerification[type],
                        status,
                        reason,
                        reviewedAt: new Date().toISOString()
                    }
                }
            })),

            // Получить все заявки (для админа)
            setVerificationRequests: (requests) => set({ verificationRequests: requests }),

            // Добавить новую заявку в очередь
            addVerificationRequest: (request) => set((state) => ({
                verificationRequests: [...state.verificationRequests, request]
            })),

            // Обновить заявку
            updateVerificationRequest: (requestId, updates) => set((state) => ({
                verificationRequests: state.verificationRequests.map(req =>
                    req.id === requestId ? { ...req, ...updates } : req
                )
            })),

            // Удалить заявку из очереди
            removeVerificationRequest: (requestId) => set((state) => ({
                verificationRequests: state.verificationRequests.filter(req => req.id !== requestId)
            }))
        }),
        {
            name: 'verification-storage',
            partialize: (state) => ({
                userVerification: state.userVerification
            })
        }
    )
)

export default useVerificationStore


