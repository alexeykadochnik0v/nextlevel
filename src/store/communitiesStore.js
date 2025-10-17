import { create } from 'zustand'

const useCommunitiesStore = create((set) => ({
    communities: [],
    myCommunities: [],
    loading: false,

    setCommunities: (communities) => set({ communities }),

    setMyCommunities: (myCommunities) => set({ myCommunities }),

    addCommunity: (community) => set((state) => ({
        communities: [...state.communities, community]
    })),

    joinCommunity: (communityId) => set((state) => ({
        myCommunities: [...state.myCommunities, communityId]
    })),

    leaveCommunity: (communityId) => set((state) => ({
        myCommunities: state.myCommunities.filter(id => id !== communityId)
    }))
}))

export default useCommunitiesStore

