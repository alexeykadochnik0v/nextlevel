import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useFriendshipsStore = create(
    persist(
        (set) => ({
            // Дружественные связи { [communityId]: [friendCommunityId, ...] }
            friendships: {},

            // Исходящие заявки { [fromCommunityId]: [toCommunityId, ...] }
            outgoingRequests: {},

            // Входящие заявки { [toCommunityId]: [fromCommunityId, ...] }
            incomingRequests: {},

            // Отправить заявку на дружбу
            sendFriendshipRequest: (fromCommunityId, toCommunityId) => set((state) => ({
                outgoingRequests: {
                    ...state.outgoingRequests,
                    [fromCommunityId]: [...(state.outgoingRequests[fromCommunityId] || []), toCommunityId]
                },
                incomingRequests: {
                    ...state.incomingRequests,
                    [toCommunityId]: [...(state.incomingRequests[toCommunityId] || []), fromCommunityId]
                }
            })),

            // Принять заявку на дружбу
            acceptFriendshipRequest: (communityId, friendCommunityId) => set((state) => ({
                friendships: {
                    ...state.friendships,
                    [communityId]: [...(state.friendships[communityId] || []), friendCommunityId],
                    [friendCommunityId]: [...(state.friendships[friendCommunityId] || []), communityId]
                },
                incomingRequests: {
                    ...state.incomingRequests,
                    [communityId]: (state.incomingRequests[communityId] || []).filter(id => id !== friendCommunityId)
                },
                outgoingRequests: {
                    ...state.outgoingRequests,
                    [friendCommunityId]: (state.outgoingRequests[friendCommunityId] || []).filter(id => id !== communityId)
                }
            })),

            // Отклонить заявку на дружбу
            rejectFriendshipRequest: (communityId, friendCommunityId) => set((state) => ({
                incomingRequests: {
                    ...state.incomingRequests,
                    [communityId]: (state.incomingRequests[communityId] || []).filter(id => id !== friendCommunityId)
                },
                outgoingRequests: {
                    ...state.outgoingRequests,
                    [friendCommunityId]: (state.outgoingRequests[friendCommunityId] || []).filter(id => id !== communityId)
                }
            })),

            // Удалить дружбу
            removeFriendship: (communityId, friendCommunityId) => set((state) => ({
                friendships: {
                    ...state.friendships,
                    [communityId]: (state.friendships[communityId] || []).filter(id => id !== friendCommunityId),
                    [friendCommunityId]: (state.friendships[friendCommunityId] || []).filter(id => id !== communityId)
                }
            })),

            // Получить дружественные сообщества
            getFriendCommunities: (communityId) => {
                return (state) => state.friendships[communityId] || []
            },

            // Получить входящие заявки
            getIncomingRequests: (communityId) => {
                return (state) => state.incomingRequests[communityId] || []
            },

            // Получить исходящие заявки
            getOutgoingRequests: (communityId) => {
                return (state) => state.outgoingRequests[communityId] || []
            },

            // Проверить дружбу
            areFriends: (communityId, friendCommunityId) => {
                return (state) => (state.friendships[communityId] || []).includes(friendCommunityId)
            },

            // Проверить есть ли исходящая заявка
            hasOutgoingRequest: (communityId, toCommunityId) => {
                return (state) => (state.outgoingRequests[communityId] || []).includes(toCommunityId)
            }
        }),
        {
            name: 'friendships-storage',
            partialize: (state) => ({
                friendships: state.friendships,
                outgoingRequests: state.outgoingRequests,
                incomingRequests: state.incomingRequests
            })
        }
    )
)

export default useFriendshipsStore

