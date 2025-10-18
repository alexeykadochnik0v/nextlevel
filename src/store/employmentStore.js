import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useEmploymentStore = create(
    persist(
        (set) => ({
            // История работы текущего пользователя
            employmentHistory: [],

            // Заявки на подтверждение (для работодателя)
            employmentRequests: [],

            // Подтвержденные сотрудники по сообществам
            communityEmployees: {}, // { [communityId]: [employees] }

            // Добавить опыт работы
            addEmployment: (employment) => set((state) => ({
                employmentHistory: [...state.employmentHistory, {
                    ...employment,
                    id: `emp-${Date.now()}`,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                }]
            })),

            // Обновить опыт работы
            updateEmployment: (id, updates) => set((state) => ({
                employmentHistory: state.employmentHistory.map(emp =>
                    emp.id === id ? { ...emp, ...updates } : emp
                )
            })),

            // Удалить опыт работы
            deleteEmployment: (id) => set((state) => ({
                employmentHistory: state.employmentHistory.filter(emp => emp.id !== id)
            })),

            // Отправить запрос на подтверждение сотрудника
            requestEmployeeConfirmation: (communityId, data) => set((state) => ({
                employmentRequests: [...state.employmentRequests, {
                    id: `req-${Date.now()}`,
                    communityId,
                    ...data,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                }]
            })),

            // Подтвердить сотрудника (для работодателя)
            approveEmployeeRequest: (requestId, communityId) => set((state) => {
                const request = state.employmentRequests.find(r => r.id === requestId)
                if (!request) return state

                const newEmployee = {
                    ...request,
                    status: 'confirmed',
                    confirmedAt: new Date().toISOString()
                }

                return {
                    employmentRequests: state.employmentRequests.filter(r => r.id !== requestId),
                    communityEmployees: {
                        ...state.communityEmployees,
                        [communityId]: [...(state.communityEmployees[communityId] || []), newEmployee]
                    }
                }
            }),

            // Отклонить запрос на подтверждение
            rejectEmployeeRequest: (requestId, reason) => set((state) => ({
                employmentRequests: state.employmentRequests.map(r =>
                    r.id === requestId
                        ? { ...r, status: 'rejected', rejectionReason: reason }
                        : r
                )
            })),

            // Завершить период работы (для работодателя)
            endEmployment: (communityId, employeeId, endDate) => set((state) => ({
                communityEmployees: {
                    ...state.communityEmployees,
                    [communityId]: state.communityEmployees[communityId]?.map(emp =>
                        emp.id === employeeId ? { ...emp, endDate, isCurrent: false } : emp
                    )
                }
            })),

            // Получить сотрудников сообщества
            getCommunityEmployees: (communityId) => (state) =>
                state.communityEmployees[communityId] || [],

            // Получить текущих сотрудников (без даты окончания)
            getCurrentEmployees: (communityId) => (state) =>
                (state.communityEmployees[communityId] || []).filter(emp => !emp.endDate),

            // Установить сотрудников сообщества (при загрузке из Firebase)
            setCommunityEmployees: (communityId, employees) => set((state) => ({
                communityEmployees: {
                    ...state.communityEmployees,
                    [communityId]: employees
                }
            })),

            // Установить историю работы (при загрузке из Firebase)
            setEmploymentHistory: (history) => set({ employmentHistory: history })
        }),
        {
            name: 'employment-storage',
            partialize: (state) => ({
                employmentHistory: state.employmentHistory,
                communityEmployees: state.communityEmployees
            })
        }
    )
)

export default useEmploymentStore


