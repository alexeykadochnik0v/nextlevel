import { useEffect } from 'react'
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import useAuthStore from '../store/authStore'
import useVerificationStore from '../store/verificationStore'

export function useAuth() {
    const { user, setUser, logout, updateProfile: updateAuthStore } = useAuthStore()
    const { setVerification } = useVerificationStore()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
                const userData = userDoc.exists() ? userDoc.data() : {}

                // Загружаем данные верификации из Firestore
                if (userData.verification) {
                    setVerification(userData.verification)
                }

                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    ...userData
                })
            } else {
                setUser(null)
            }
        })

        return unsubscribe
    }, [setUser, setVerification])

    const login = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password)
        return result.user
    }

    const register = async (email, password, userData) => {
        const result = await createUserWithEmailAndPassword(auth, email, password)

        await updateProfile(result.user, {
            displayName: userData.displayName
        })

        await setDoc(doc(db, 'users', result.user.uid), {
            ...userData,
            email: email, // Добавляем email в Firestore
            createdAt: new Date().toISOString(),
            level: 1,
            points: 0
        })

        return result.user
    }

    const resetPassword = async (email) => {
        await sendPasswordResetEmail(auth, email)
    }

    const logoutUser = async () => {
        await signOut(auth)
        logout()
    }

    const updateAvatar = async (photoURL) => {
        await updateProfile(auth.currentUser, {
            photoURL: photoURL
        })
        // Обновляем локальное состояние в Zustand store
        updateAuthStore({ photoURL })
    }

    return {
        user,
        login,
        register,
        resetPassword,
        logout: logoutUser,
        updateAvatar
    }
}

