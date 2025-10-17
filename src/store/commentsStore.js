import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCommentsStore = create(
    persist(
        (set) => ({
            comments: {},
            likedComments: {},

            // Установить комментарии для поста
            setComments: (postId, comments) => set((state) => ({
                comments: { ...state.comments, [postId]: comments }
            })),

            // Добавить новый комментарий
            addComment: (postId, comment) => set((state) => ({
                comments: {
                    ...state.comments,
                    [postId]: [...(state.comments[postId] || []), comment]
                }
            })),

            // Добавить ответ на комментарий
            addReply: (postId, commentId, reply) => set((state) => {
                const addReplyToComment = (comments) => {
                    return comments.map(comment => {
                        if (comment.id === commentId) {
                            return {
                                ...comment,
                                replies: [...(comment.replies || []), reply]
                            }
                        }
                        if (comment.replies && comment.replies.length > 0) {
                            return {
                                ...comment,
                                replies: addReplyToComment(comment.replies)
                            }
                        }
                        return comment
                    })
                }

                return {
                    comments: {
                        ...state.comments,
                        [postId]: addReplyToComment(state.comments[postId] || [])
                    }
                }
            }),

            // Удалить комментарий
            deleteComment: (postId, commentId) => set((state) => {
                const deleteFromComments = (comments) => {
                    return comments.filter(comment => {
                        if (comment.id === commentId) return false
                        if (comment.replies && comment.replies.length > 0) {
                            comment.replies = deleteFromComments(comment.replies)
                        }
                        return true
                    })
                }

                return {
                    comments: {
                        ...state.comments,
                        [postId]: deleteFromComments(state.comments[postId] || [])
                    }
                }
            }),

            // Переключить лайк комментария
            toggleCommentLike: (commentId) => set((state) => {
                const isLiked = state.likedComments[commentId]

                const updateLikes = (comments) => {
                    return comments.map(comment => {
                        if (comment.id === commentId) {
                            return {
                                ...comment,
                                likesCount: comment.likesCount + (isLiked ? -1 : 1)
                            }
                        }
                        if (comment.replies && comment.replies.length > 0) {
                            return {
                                ...comment,
                                replies: updateLikes(comment.replies)
                            }
                        }
                        return comment
                    })
                }

                const updatedComments = {}
                Object.keys(state.comments).forEach(postId => {
                    updatedComments[postId] = updateLikes(state.comments[postId])
                })

                return {
                    likedComments: {
                        ...state.likedComments,
                        [commentId]: !isLiked
                    },
                    comments: updatedComments
                }
            })
        }),
        {
            name: 'comments-storage'
        }
    )
)

export default useCommentsStore

