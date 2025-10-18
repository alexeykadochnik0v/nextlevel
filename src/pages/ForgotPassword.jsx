import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { resetPassword } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await resetPassword(email)
            setSuccess(true)
        } catch (err) {
            setError('Ошибка отправки письма. Проверьте email')
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
                    Восстановление пароля
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    Введите email для сброса пароля
                </p>

                {success ? (
                    <div className="text-center space-y-4">
                        <p className="text-green-600">
                            Письмо со ссылкой для сброса пароля отправлено на ваш email
                        </p>
                        <Link to="/login">
                            <Button className="w-full">
                                Вернуться к входу
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
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
                            {loading ? 'Отправка...' : 'Отправить'}
                        </Button>

                        <Link to="/login" className="block text-center">
                            <Button variant="ghost" className="w-full">
                                Вернуться к входу
                            </Button>
                        </Link>
                    </form>
                )}
            </Card>
        </div>
    )
}

