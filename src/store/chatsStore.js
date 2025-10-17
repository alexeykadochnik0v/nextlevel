import { create } from 'zustand'

const useChatsStore = create((set) => ({
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
    }))
}))

export default useChatsStore

