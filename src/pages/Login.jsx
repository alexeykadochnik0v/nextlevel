import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(email, password)
            navigate('/')
        } catch (err) {
            setError('Неверный email или пароль')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <img src="/images/logo.svg" alt="NextLevel" className="w-16 h-16" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                    Вход
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    Добро пожаловать в NextLevel
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                    />

                    <Input
                        label="Пароль"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    {error && (
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </Button>
                </form>

                <div className="mt-6 text-center space-y-2">
                    <Link
                        to="/register"
                        className="block text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        Нет аккаунта? Зарегистрируйтесь
                    </Link>
                    <Link
                        to="/forgot-password"
                        className="block text-gray-600 hover:text-gray-700 text-sm"
                    >
                        Забыли пароль?
                    </Link>
                    <Link
                        to="/faq"
                        className="block text-gray-600 hover:text-gray-700 text-sm"
                    >
                        Помощь и FAQ
                    </Link>
                </div>
            </Card>
        </div>
    )
}
