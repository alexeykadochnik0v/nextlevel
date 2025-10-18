import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCommunitiesStore = create(
    persist(
        (set, get) => ({
            // Присоединенные сообщества пользователя
            joinedCommunities: [],

            // Присоединиться к сообществу
            joinCommunity: (communityId) => {
                const { joinedCommunities } = get()
                if (!joinedCommunities.includes(communityId)) {
                    set({
                        joinedCommunities: [...joinedCommunities, communityId]
                    })
                    return true
                }
                return false
            },

            // Покинуть сообщество
            leaveCommunity: (communityId) => {
                const { joinedCommunities } = get()
                set({
                    joinedCommunities: joinedCommunities.filter(id => id !== communityId)
                })
            },

            // Проверить, присоединен ли к сообществу
            isJoined: (communityId) => {
                const { joinedCommunities } = get()
                return joinedCommunities.includes(communityId)
            }
        }),
        {
            name: 'communities-storage'
        }
    )
)

export default useCommunitiesStore