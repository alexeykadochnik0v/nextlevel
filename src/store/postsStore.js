import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const usePostsStore = create(
    persist(
        (set) => ({
            posts: [],
            likedPosts: {},
            loading: false,

            setPosts: (posts) => set({ posts }),

            addPost: (post) => set((state) => ({
                posts: [post, ...state.posts]
            })),

            updatePost: (postId, updates) => set((state) => ({
                posts: state.posts.map(post =>
                    post.id === postId ? { ...post, ...updates } : post
                )
            })),

            deletePost: (postId) => set((state) => ({
                posts: state.posts.filter(post => post.id !== postId)
            })),

            toggleLike: (postId) => set((state) => {
                const isLiked = state.likedPosts[postId]
                return {
                    likedPosts: {
                        ...state.likedPosts,
                        [postId]: !isLiked
                    },
                    posts: state.posts.map(post =>
                        post.id === postId
                            ? { ...post, likesCount: post.likesCount + (isLiked ? -1 : 1) }
                            : post
                    )
                }
            }),

            isPostLiked: (postId) => (state) => !!state.likedPosts[postId]
        }),
        {
            name: 'posts-storage',
            partialize: (state) => ({
                posts: state.posts,
                likedPosts: state.likedPosts
            })
        }
    )
)

export default usePostsStore

