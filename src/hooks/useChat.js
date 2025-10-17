import { useEffect, useState } from 'react'
import { getSocket, initSocket } from '../services/socket'
import useChatsStore from '../store/chatsStore'
import { useAuth } from './useAuth'

export function useChat(chatId) {
    const { user } = useAuth()
    const { messages, addMessage, setMessages } = useChatsStore()
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        if (!user || !chatId) return

        const socket = initSocket(user.uid)

        socket.on('connect', () => {
            setConnected(true)
            socket.emit('join_chat', chatId)
        })

        socket.on('disconnect', () => {
            setConnected(false)
        })

        socket.on('message', (message) => {
            addMessage(chatId, message)
        })

        socket.on('chat_history', (history) => {
            setMessages(chatId, history)
        })

        return () => {
            socket.emit('leave_chat', chatId)
            socket.off('message')
            socket.off('chat_history')
        }
    }, [user, chatId, addMessage, setMessages])

    const sendMessage = (text, attachments = []) => {
        const socket = getSocket()
        if (socket && connected) {
            socket.emit('send_message', {
                chatId,
                text,
                attachments,
                author: {
                    uid: user.uid,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                }
            })
        }
    }

    return {
        messages: messages[chatId] || [],
        sendMessage,
        connected
    }
}

