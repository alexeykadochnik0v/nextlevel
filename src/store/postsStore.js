import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../lib/firebase'

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

            toggleLike: async (postId) => {
                const state = usePostsStore.getState()
                const isLiked = state.likedPosts[postId]
                const delta = isLiked ? -1 : 1

                // Обновляем локальное состояние
                set((state) => ({
                    likedPosts: {
                        ...state.likedPosts,
                        [postId]: !isLiked
                    },
                    posts: state.posts.map(post =>
                        post.id === postId
                            ? { ...post, likesCount: (post.likesCount || 0) + delta }
                            : post
                    )
                }))

                // Обновляем в Firebase
                try {
                    const postRef = doc(db, 'posts', postId)
                    await updateDoc(postRef, {
                        likesCount: increment(delta)
                    })
                } catch (error) {
                    console.error('Error updating like in Firebase:', error)
                    // Откатываем изменения при ошибке
                    set((state) => ({
                        likedPosts: {
                            ...state.likedPosts,
                            [postId]: isLiked
                        },
                        posts: state.posts.map(post =>
                            post.id === postId
                                ? { ...post, likesCount: (post.likesCount || 0) - delta }
                                : post
                        )
                    }))
                }
            },

            updateCommentsCount: (postId, count) => set((state) => ({
                posts: state.posts.map(post =>
                    post.id === postId ? { ...post, commentsCount: count } : post
                )
            })),

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

