import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useChatsStore = create(
  persist(
    (set) => ({
      chats: [],
      activeChat: null,
      messages: {},

      setChats: (chats) => set({ chats }),

      setActiveChat: (chatId) => set({ activeChat: chatId }),

      addChat: (chat) => set((state) => ({
        chats: [...state.chats, chat]
      })),

      setMessages: (chatId, messages) => set((state) => ({
        messages: { ...state.messages, [chatId]: messages }
      })),

      addMessage: (chatId, message) => set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: [...(state.messages[chatId] || []), message]
        }
      })),

      deleteMessage: (chatId, messageId) => set((state) => ({
        messages: {
          ...state.messages,
          [chatId]: (state.messages[chatId] || []).filter(msg => msg.id !== messageId)
        }
      }))
    }),
    {
      name: 'chats-storage',
      partialize: (state) => ({
        messages: state.messages,
        chats: state.chats
      })
    }
  )
)

export default useChatsStore

