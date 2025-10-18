import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { collection, addDoc, getDocs, getDoc, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { mockComments } from '../data/mockComments'
import usePostsStore from './postsStore'

const useCommentsStore = create(
    persist(
        (set, get) => ({
            comments: {},
            likes: {},
            loading: false,

            // Загрузить комментарии для поста
            loadComments: async (postId) => {
                set({ loading: true })
                try {
                    const commentsRef = collection(db, 'comments')
                    // Упрощенный запрос без orderBy для избежания проблем с индексами
                    const q = query(
                        commentsRef,
                        where('postId', '==', postId)
                    )
                    const querySnapshot = await getDocs(q)

                    const comments = []
                    querySnapshot.forEach((doc) => {
                        comments.push({ id: doc.id, ...doc.data() })
                    })

                    // Если нет комментариев в Firebase, используем моковые данные
                    if (comments.length === 0 && mockComments[postId]) {
                        comments.push(...mockComments[postId])
                    }

                    // Сортируем вручную по дате создания
                    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

                    set((state) => ({
                        comments: {
                            ...state.comments,
                            [postId]: comments
                        },
                        loading: false
                    }))

                    // Обновляем счетчик комментариев в postsStore
                    usePostsStore.getState().updateCommentsCount(postId, comments.length)
                } catch (error) {
                    console.error('Error loading comments:', error)
                    // В случае ошибки, используем моковые данные
                    if (mockComments[postId]) {
                        set((state) => ({
                            comments: {
                                ...state.comments,
                                [postId]: mockComments[postId]
                            },
                            loading: false
                        }))
                        // Обновляем счетчик комментариев в postsStore
                        usePostsStore.getState().updateCommentsCount(postId, mockComments[postId].length)
                    } else {
                        set({ loading: false })
                    }
                }
            },

            // Добавить комментарий
            addComment: async (postId, content, user) => {
                try {
                    const commentData = {
                        postId,
                        content: content.trim(),
                        userId: user.uid,
                        userDisplayName: user.displayName || 'Пользователь',
                        userPhotoURL: user.photoURL || null,
                        userEmail: user.email,
                        likesCount: 0,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }

                    const docRef = await addDoc(collection(db, 'comments'), commentData)

                    const newComment = {
                        id: docRef.id,
                        ...commentData
                    }

                    set((state) => ({
                        comments: {
                            ...state.comments,
                            [postId]: [newComment, ...(state.comments[postId] || [])]
                        }
                    }))

                    // Обновляем счетчик комментариев в postsStore
                    const currentComments = get().comments[postId] || []
                    usePostsStore.getState().updateCommentsCount(postId, currentComments.length)

                    return newComment
                } catch (error) {
                    console.error('Error adding comment:', error)
                    throw error
                }
            },

            // Удалить комментарий
            deleteComment: async (commentId, postId) => {
                try {
                    await deleteDoc(doc(db, 'comments', commentId))

                    set((state) => ({
                        comments: {
                            ...state.comments,
                            [postId]: (state.comments[postId] || []).filter(comment => comment.id !== commentId)
                        }
                    }))

                    // Обновляем счетчик комментариев в postsStore
                    const currentComments = get().comments[postId] || []
                    usePostsStore.getState().updateCommentsCount(postId, currentComments.length)
                } catch (error) {
                    console.error('Error deleting comment:', error)
                    throw error
                }
            },

            // Загрузить лайки для комментария
            loadCommentLikes: async (commentId) => {
                try {
                    const likesRef = collection(db, 'commentLikes')
                    const q = query(likesRef, where('commentId', '==', commentId))
                    const querySnapshot = await getDocs(q)

                    const likes = []
                    querySnapshot.forEach((doc) => {
                        likes.push({ id: doc.id, ...doc.data() })
                    })

                    set((state) => ({
                        likes: {
                            ...state.likes,
                            [commentId]: likes
                        }
                    }))

                    return likes.length
                } catch (error) {
                    console.error('Error loading comment likes:', error)
                    return 0
                }
            },

            // Поставить/убрать лайк комментарию
            toggleCommentLike: async (commentId, userId, postId) => {
                try {
                    const currentComments = get().comments[postId] || []
                    const comment = currentComments.find(c => c.id === commentId)

                    if (!comment) {
                        console.error('Comment not found:', commentId)
                        return false
                    }

                    // Проверяем, является ли это моковым комментарием
                    const isMockComment = comment.userId && comment.userId.startsWith('mock-user-')

                    if (isMockComment) {
                        // Для моковых комментариев работаем только с локальным состоянием
                        const isLiked = comment.likes && comment.likes.includes(userId)

                        set((state) => ({
                            comments: {
                                ...state.comments,
                                [postId]: state.comments[postId]?.map(comment =>
                                    comment.id === commentId
                                        ? {
                                            ...comment,
                                            likes: isLiked
                                                ? (comment.likes || []).filter(id => id !== userId)
                                                : [...(comment.likes || []), userId],
                                            likesCount: isLiked
                                                ? Math.max(0, comment.likesCount - 1)
                                                : comment.likesCount + 1
                                        }
                                        : comment
                                ) || []
                            }
                        }))

                        return !isLiked
                    } else {
                        // Для реальных комментариев работаем с Firebase
                        // Проверяем существование комментария в Firebase
                        const commentRef = doc(db, 'comments', commentId)
                        const commentDoc = await getDoc(commentRef)
                        
                        if (!commentDoc.exists()) {
                            // Комментарий не существует в Firebase, работаем локально
                            const isLiked = comment.likes && comment.likes.includes(userId)

                            set((state) => ({
                                comments: {
                                    ...state.comments,
                                    [postId]: state.comments[postId]?.map(comment =>
                                        comment.id === commentId
                                            ? {
                                                ...comment,
                                                likes: isLiked
                                                    ? (comment.likes || []).filter(id => id !== userId)
                                                    : [...(comment.likes || []), userId],
                                                likesCount: isLiked
                                                    ? Math.max(0, comment.likesCount - 1)
                                                    : comment.likesCount + 1
                                            }
                                            : comment
                                    ) || []
                                }
                            }))

                            return !isLiked
                        }
                        
                        const likesRef = collection(db, 'commentLikes')
                        const q = query(
                            likesRef,
                            where('commentId', '==', commentId),
                            where('userId', '==', userId)
                        )
                        const querySnapshot = await getDocs(q)

                        if (!querySnapshot.empty) {
                            // Убираем лайк
                            const likeDoc = querySnapshot.docs[0]
                            await deleteDoc(likeDoc.ref)

                            // Обновляем счетчик лайков
                            await updateDoc(commentRef, {
                                likesCount: Math.max(0, comment.likesCount - 1)
                            })

                            // Обновляем локальное состояние
                            set((state) => ({
                                likes: {
                                    ...state.likes,
                                    [commentId]: (state.likes[commentId] || []).filter(like => like.userId !== userId)
                                },
                                comments: {
                                    ...state.comments,
                                    [postId]: state.comments[postId]?.map(comment =>
                                        comment.id === commentId
                                            ? { ...comment, likesCount: Math.max(0, comment.likesCount - 1) }
                                            : comment
                                    ) || []
                                }
                            }))

                            return false // Лайк убран
                        } else {
                            // Добавляем лайк
                            const likeData = {
                                commentId,
                                userId,
                                createdAt: new Date().toISOString()
                            }

                            await addDoc(likesRef, likeData)

                            // Обновляем счетчик лайков
                            await updateDoc(commentRef, {
                                likesCount: comment.likesCount + 1
                            })

                            // Обновляем локальное состояние
                            const newLike = {
                                id: Date.now().toString(),
                                ...likeData
                            }

                            set((state) => ({
                                likes: {
                                    ...state.likes,
                                    [commentId]: [...(state.likes[commentId] || []), newLike]
                                },
                                comments: {
                                    ...state.comments,
                                    [postId]: state.comments[postId]?.map(comment =>
                                        comment.id === commentId
                                            ? { ...comment, likesCount: comment.likesCount + 1 }
                                            : comment
                                    ) || []
                                }
                            }))

                            return true // Лайк добавлен
                        }
                    }
                } catch (error) {
                    console.error('Error toggling comment like:', error)
                    throw error
                }
            },

            // Проверить, лайкнул ли пользователь комментарий
            isCommentLiked: (commentId, userId) => {
                // Сначала проверяем в локальном состоянии
                const likes = get().likes[commentId] || []
                if (likes.some(like => like.userId === userId)) {
                    return true
                }

                // Затем проверяем в комментариях (для моковых данных)
                const allComments = get().comments
                for (const postId in allComments) {
                    const comments = allComments[postId]
                    const comment = comments.find(c => c.id === commentId)
                    if (comment && comment.likes && comment.likes.includes(userId)) {
                        return true
                    }
                }

                return false
            },

            // Очистить комментарии для поста
            clearComments: (postId) => {
                set((state) => {
                    const newComments = { ...state.comments }
                    delete newComments[postId]
                    return { comments: newComments }
                })
            }
        }),
        {
            name: 'comments-storage',
            partialize: (state) => ({
                comments: state.comments,
                likes: state.likes
            })
        }
    )
)

export default useCommentsStore