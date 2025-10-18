import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Upload, CheckCircle, XCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { storage, db } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Toast from '../components/Toast'

export default function Verification() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [userVerification, setUserVerification] = useState({
        student: { status: 'none' },
        employer: { status: 'none' }
    })

    const [uploading, setUploading] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [profileUser, setProfileUser] = useState(null)

    // Форма для студента
    const [studentForm, setStudentForm] = useState({
        university: '',
        studentId: '',
        docFile: null
    })

    // Форма для работодателя
    const [employerForm, setEmployerForm] = useState({
        companyName: '',
        inn: '',
        position: '',
        docFile: null
    })

    // Загружаем актуальные данные о верификации из Firestore
    useEffect(() => {
        const loadVerificationStatus = async () => {
            if (!user) {
                navigate('/login')
                return
            }

            try {
                const userDoc = await getDoc(doc(db, 'users', user.uid))
                if (userDoc.exists()) {
                    const userData = userDoc.data()
                    setProfileUser(userData)
                    if (userData.verification) {
                        setUserVerification(userData.verification)
                    }
                }
            } catch (error) {
                console.error('Error loading verification status:', error)
            } finally {
                setLoading(false)
            }
        }

        loadVerificationStatus()
    }, [user, navigate])

    if (!user) {
        return null
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p className="text-center text-gray-600">Загрузка...</p>
                </div>
            </div>
        )
    }

    const handleStudentFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setToastMessage('Файл не должен превышать 10 МБ')
                setShowToast(true)
                return
            }
            if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                setToastMessage('Допустимые форматы: PDF, JPG, PNG')
                setShowToast(true)
                return
            }
            setStudentForm(prev => ({ ...prev, docFile: file }))
        }
    }

    const handleEmployerFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setToastMessage('Файл не должен превышать 10 МБ')
                setShowToast(true)
                return
            }
            if (!['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                setToastMessage('Допустимые форматы: PDF, JPG, PNG')
                setShowToast(true)
                return
            }
            setEmployerForm(prev => ({ ...prev, docFile: file }))
        }
    }

    const handleStudentSubmit = async (e) => {
        e.preventDefault()

        if (!studentForm.docFile) {
            setToastMessage('Загрузите справку об обучении')
            setShowToast(true)
            return
        }

        setUploading(true)
        try {
            // Загружаем файл в Storage
            const fileExt = studentForm.docFile.name.split('.').pop()
            const filePath = `verification/${user.uid}/student-proof.${fileExt}`
            const storageRef = ref(storage, filePath)

            await uploadBytes(storageRef, studentForm.docFile)
            const docUrl = await getDownloadURL(storageRef)

            // Сохраняем в Firestore
            const verificationData = {
                type: 'student',
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || user.email,
                university: studentForm.university,
                studentId: studentForm.studentId,
                docUrl,
                docFileName: studentForm.docFile.name,
                status: 'pending',
                createdAt: new Date().toISOString()
            }

            await setDoc(doc(db, 'verificationsQueue', `student-${user.uid}`), verificationData)

            // Обновляем локальное состояние
            setUserVerification(prev => ({
                ...prev,
                student: {
                    status: 'pending',
                    university: studentForm.university,
                    studentId: studentForm.studentId,
                    docUrl
                }
            }))

            setToastMessage('Заявка отправлена на проверку!')
            setShowToast(true)
            setStudentForm({ university: '', studentId: '', docFile: null })
        } catch (error) {
            console.error('Error submitting verification:', error)
            setToastMessage('Ошибка при отправке заявки')
            setShowToast(true)
        } finally {
            setUploading(false)
        }
    }

    const handleEmployerSubmit = async (e) => {
        e.preventDefault()

        if (!employerForm.docFile) {
            setToastMessage('Загрузите документ о праве представлять компанию')
            setShowToast(true)
            return
        }

        setUploading(true)
        try {
            // Загружаем файл в Storage
            const fileExt = employerForm.docFile.name.split('.').pop()
            const filePath = `verification/${user.uid}/employer-proof.${fileExt}`
            const storageRef = ref(storage, filePath)

            await uploadBytes(storageRef, employerForm.docFile)
            const docUrl = await getDownloadURL(storageRef)

            // Сохраняем в Firestore
            const verificationData = {
                type: 'employer',
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || user.email,
                companyName: employerForm.companyName,
                inn: employerForm.inn,
                position: employerForm.position,
                docUrl,
                docFileName: employerForm.docFile.name,
                status: 'pending',
                createdAt: new Date().toISOString()
            }

            await setDoc(doc(db, 'verificationsQueue', `employer-${user.uid}`), verificationData)

            // Обновляем локальное состояние
            setUserVerification(prev => ({
                ...prev,
                employer: {
                    status: 'pending',
                    companyName: employerForm.companyName,
                    inn: employerForm.inn,
                    position: employerForm.position,
                    communityId: employerForm.communityId,
                    docUrl
                }
            }))

            setToastMessage('Заявка отправлена на проверку!')
            setShowToast(true)
            setEmployerForm({ companyName: '', inn: '', position: '', docFile: null })
        } catch (error) {
            console.error('Error submitting verification:', error)
            setToastMessage('Ошибка при отправке заявки')
            setShowToast(true)
        } finally {
            setUploading(false)
        }
    }

    const statusConfig = {
        none: { label: 'Не подана', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50' },
        pending: { label: 'На проверке', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        approved: { label: 'Подтверждено', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        rejected: { label: 'Отклонено', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' }
    }

    const studentStatus = userVerification.student.status
    const employerStatus = userVerification.employer.status
    const StudentStatusIcon = statusConfig[studentStatus]?.icon || AlertCircle
    const EmployerStatusIcon = statusConfig[employerStatus]?.icon || AlertCircle

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Link
                    to={`/profile/${user.uid}`}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад к профилю
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Верификация</h1>
                    <p className="text-gray-600">
                        {profileUser?.role === 'employer'
                            ? 'Подтвердите, что вы представляете компанию'
                            : 'Подтвердите свой статус студента'
                        }
                    </p>
                </div>

                {/* Верификация студента - только для студентов */}
                {(profileUser?.role === 'user' || !profileUser?.role) && (
                    <Card>
                        <div className={`flex items-center justify-between p-4 rounded-lg mb-6 ${statusConfig[studentStatus]?.bg}`}>
                            <div className="flex items-center space-x-3">
                                <StudentStatusIcon className={`w-6 h-6 ${statusConfig[studentStatus]?.color}`} />
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Статус: {statusConfig[studentStatus]?.label}
                                    </p>
                                    {studentStatus === 'rejected' && userVerification.student.reason && (
                                        <p className="text-sm text-red-600 mt-1">
                                            Причина: {userVerification.student.reason}
                                        </p>
                                    )}
                                    {studentStatus === 'approved' && (
                                        <p className="text-sm text-green-600 mt-1">
                                            ✓ Вы получили бейдж "Верифицированный студент"
                                        </p>
                                    )}
                                </div>
                            </div>
                            {studentStatus === 'approved' && (
                                <Badge variant="success">Верифицирован</Badge>
                            )}
                        </div>

                        {(studentStatus === 'none' || studentStatus === 'rejected') && (
                            <form onSubmit={handleStudentSubmit} className="space-y-4">
                                <Input
                                    label="Учебное заведение"
                                    value={studentForm.university}
                                    onChange={(e) => setStudentForm(prev => ({ ...prev, university: e.target.value }))}
                                    placeholder="Московский государственный университет"
                                    required
                                />

                                <Input
                                    label="Номер студенческого билета (необязательно)"
                                    value={studentForm.studentId}
                                    onChange={(e) => setStudentForm(prev => ({ ...prev, studentId: e.target.value }))}
                                    placeholder="123456"
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Справка об обучении
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleStudentFileChange}
                                            className="hidden"
                                            id="student-file"
                                        />
                                        <label htmlFor="student-file" className="cursor-pointer">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 mb-1">
                                                {studentForm.docFile ? studentForm.docFile.name : 'Нажмите для загрузки'}
                                            </p>
                                            <p className="text-xs text-gray-500">PDF, JPG или PNG (макс. 10 МБ)</p>
                                        </label>
                                    </div>
                                </div>

                                <Button type="submit" disabled={uploading} className="w-full">
                                    {uploading ? 'Отправка...' : 'Отправить на проверку'}
                                </Button>
                            </form>
                        )}

                        {studentStatus === 'pending' && (
                            <div className="text-center py-8">
                                <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-900 mb-2">
                                    Заявка на рассмотрении
                                </p>
                                <p className="text-gray-600">
                                    Мы проверим ваши документы в течение 1-3 рабочих дней
                                </p>
                            </div>
                        )}
                    </Card>
                )}

                {/* Верификация работодателя - только для работодателей */}
                {profileUser?.role === 'employer' && (
                    <Card>
                        <div className={`flex items-center justify-between p-4 rounded-lg mb-6 ${statusConfig[employerStatus]?.bg}`}>
                            <div className="flex items-center space-x-3">
                                <EmployerStatusIcon className={`w-6 h-6 ${statusConfig[employerStatus]?.color}`} />
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Статус: {statusConfig[employerStatus]?.label}
                                    </p>
                                    {employerStatus === 'rejected' && userVerification.employer.reason && (
                                        <p className="text-sm text-red-600 mt-1">
                                            Причина: {userVerification.employer.reason}
                                        </p>
                                    )}
                                    {employerStatus === 'approved' && (
                                        <p className="text-sm text-green-600 mt-1">
                                            ✓ Вы получили бейдж "Верифицированный работодатель"
                                        </p>
                                    )}
                                </div>
                            </div>
                            {employerStatus === 'approved' && (
                                <Badge variant="success">Верифицирован</Badge>
                            )}
                        </div>

                        {(employerStatus === 'none' || employerStatus === 'rejected') && (
                            <form onSubmit={handleEmployerSubmit} className="space-y-4">
                                <Input
                                    label="Название компании"
                                    value={employerForm.companyName}
                                    onChange={(e) => setEmployerForm(prev => ({ ...prev, companyName: e.target.value }))}
                                    placeholder="ООО «Пример»"
                                    required
                                />

                                <Input
                                    label="ИНН компании"
                                    value={employerForm.inn}
                                    onChange={(e) => setEmployerForm(prev => ({ ...prev, inn: e.target.value }))}
                                    placeholder="1234567890"
                                />

                                <Input
                                    label="Ваша должность"
                                    value={employerForm.position}
                                    onChange={(e) => setEmployerForm(prev => ({ ...prev, position: e.target.value }))}
                                    placeholder="HR-менеджер"
                                    required
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Документ о праве представлять компанию
                                    </label>
                                    <p className="text-sm text-gray-500 mb-2">
                                        Приказ о назначении, доверенность или выписка из ЕГРЮЛ
                                    </p>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer">
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleEmployerFileChange}
                                            className="hidden"
                                            id="employer-file"
                                        />
                                        <label htmlFor="employer-file" className="cursor-pointer">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 mb-1">
                                                {employerForm.docFile ? employerForm.docFile.name : 'Нажмите для загрузки'}
                                            </p>
                                            <p className="text-xs text-gray-500">PDF, JPG или PNG (макс. 10 МБ)</p>
                                        </label>
                                    </div>
                                </div>

                                <Button type="submit" disabled={uploading} className="w-full">
                                    {uploading ? 'Отправка...' : 'Отправить на проверку'}
                                </Button>
                            </form>
                        )}

                        {employerStatus === 'pending' && (
                            <div className="text-center py-8">
                                <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-900 mb-2">
                                    Заявка на рассмотрении
                                </p>
                                <p className="text-gray-600">
                                    Мы проверим ваши документы в течение 1-3 рабочих дней
                                </p>
                            </div>
                        )}
                    </Card>
                )}
            </div>

            <Toast
                message={toastMessage}
                show={showToast}
                onClose={() => setShowToast(false)}
            />
        </div>
    )
}

