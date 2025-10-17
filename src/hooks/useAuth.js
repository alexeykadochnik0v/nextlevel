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

export function useAuth() {
    const { user, setUser, logout } = useAuthStore()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
                const userData = userDoc.exists() ? userDoc.data() : {}

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
    }, [setUser])

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

    return {
        user,
        login,
        register,
        resetPassword,
        logout: logoutUser
    }
}

