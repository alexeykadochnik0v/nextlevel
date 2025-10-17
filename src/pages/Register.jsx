import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'

export default function Register() {
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        confirmPassword: '',
        birthDate: '',
        role: 'user'
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { register } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают')
            return
        }

        if (formData.password.length < 6) {
            setError('Пароль должен быть не менее 6 символов')
            return
        }

        setLoading(true)

        try {
            await register(formData.email, formData.password, {
                displayName: formData.displayName,
                birthDate: formData.birthDate,
                role: formData.role
            })
            navigate('/')
        } catch (err) {
            setError('Ошибка регистрации. Попробуйте другой email')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                    Регистрация
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    Присоединяйтесь к NextLevel
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="ФИО"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        placeholder="Иван Иванов"
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                    />

                    <Input
                        label="Дата рождения"
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleChange}
                        required
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Роль
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                            <option value="user">Студент</option>
                            <option value="mentor">Наставник</option>
                            <option value="employer">Представитель предприятия</option>
                        </select>
                    </div>

                    <Input
                        label="Пароль"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                    />

                    <Input
                        label="Подтвердите пароль"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
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
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </Button>
                </form>

                <div className="mt-6 text-center space-y-2">
                    <Link
                        to="/login"
                        className="block text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        Уже есть аккаунт? Войдите
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
