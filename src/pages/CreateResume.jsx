import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { db, storage } from '../lib/firebase'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import Header from '../components/Header'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Toast from '../components/Toast'
import { ArrowLeft, Upload, X, Plus, Briefcase, GraduationCap, FileText } from 'lucide-react'

const SKILLS_OPTIONS = [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'Java', 'C++', 'Go',
    'SQL', 'MongoDB', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
    'Machine Learning', 'Data Science', 'UI/UX Design', 'Figma', 'Photoshop',
    'Project Management', 'Agile', 'Scrum', 'Marketing', 'SEO', 'Content Writing'
]

export default function CreateResume() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [uploading, setUploading] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')

    const [formData, setFormData] = useState({
        position: '',
        summary: '',
        skills: [],
        experiences: [],
        projects: [],
        education: [],
        resumeFile: null,
        workFormat: 'hybrid',
        relocation: false,
        visibility: 'public'
    })

    const [newExperience, setNewExperience] = useState({
        company: '',
        title: '',
        from: '',
        to: '',
        description: ''
    })

    const [newProject, setNewProject] = useState({
        name: '',
        link: '',
        description: ''
    })

    const [newEducation, setNewEducation] = useState({
        organization: '',
        faculty: '',
        from: '',
        to: ''
    })

    useEffect(() => {
        if (!user) {
            navigate('/login')
        }
    }, [user, navigate])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSkillToggle = (skill) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : prev.skills.length < 10
                    ? [...prev.skills, skill]
                    : prev.skills
        }))
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Проверка размера (10 МБ)
        if (file.size > 10 * 1024 * 1024) {
            setToastMessage('Файл слишком большой. Максимум 10 МБ')
            setShowToast(true)
            return
        }

        // Проверка типа
        if (!file.type.includes('pdf')) {
            setToastMessage('Поддерживается только PDF формат')
            setShowToast(true)
            return
        }

        handleInputChange('resumeFile', file)
    }

    const addExperience = () => {
        if (!newExperience.company || !newExperience.title) return

        setFormData(prev => ({
            ...prev,
            experiences: [...prev.experiences, { ...newExperience }]
        }))

        setNewExperience({
            company: '',
            title: '',
            from: '',
            to: '',
            description: ''
        })
    }

    const removeExperience = (index) => {
        setFormData(prev => ({
            ...prev,
            experiences: prev.experiences.filter((_, i) => i !== index)
        }))
    }

    const addProject = () => {
        if (!newProject.name) return

        setFormData(prev => ({
            ...prev,
            projects: [...prev.projects, { ...newProject }]
        }))

        setNewProject({
            name: '',
            link: '',
            description: ''
        })
    }

    const removeProject = (index) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }))
    }

    const addEducation = () => {
        if (!newEducation.organization) return

        setFormData(prev => ({
            ...prev,
            education: [...prev.education, { ...newEducation }]
        }))

        setNewEducation({
            organization: '',
            faculty: '',
            from: '',
            to: ''
        })
    }

    const removeEducation = (index) => {
        setFormData(prev => ({
            ...prev,
            education: prev.education.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e, isDraft = false) => {
        e.preventDefault()

        if (!formData.position || !formData.summary || formData.skills.length < 3) {
            setToastMessage('Заполните все обязательные поля и укажите минимум 3 навыка')
            setShowToast(true)
            return
        }

        setUploading(true)

        try {
            let resumeUrl = null

            // Загрузка файла резюме
            if (formData.resumeFile) {
                const fileRef = ref(storage, `resumes/${user.uid}/${Date.now()}_${formData.resumeFile.name}`)
                await uploadBytes(fileRef, formData.resumeFile)
                resumeUrl = await getDownloadURL(fileRef)
            }

            // Сохранение резюме в профиле пользователя
            const resumeData = {
                position: formData.position,
                summary: formData.summary,
                skills: formData.skills,
                experiences: formData.experiences,
                projects: formData.projects,
                education: formData.education,
                resumeUrl,
                workFormat: formData.workFormat,
                relocation: formData.relocation,
                visibility: formData.visibility,
                status: isDraft ? 'draft' : 'published',
                updatedAt: serverTimestamp()
            }

            await setDoc(doc(db, 'users', user.uid), {
                resume: resumeData
            }, { merge: true })

            setToastMessage(isDraft ? 'Резюме сохранено как черновик' : 'Резюме успешно опубликовано!')
            setShowToast(true)

            setTimeout(() => {
                navigate(`/profile/${user.uid}`)
            }, 1500)

        } catch (error) {
            console.error('Error creating resume:', error)
            setToastMessage('Ошибка при создании резюме')
            setShowToast(true)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Назад
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Создать резюме</h1>
                    <p className="text-gray-600">
                        Заполните информацию о себе, чтобы работодатели могли найти вас
                    </p>
                </div>

                <form onSubmit={(e) => handleSubmit(e, false)}>
                    <Card className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Основная информация</h2>

                        <div className="space-y-6">
                            {/* Желаемая позиция */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Желаемая позиция *
                                </label>
                                <Input
                                    value={formData.position}
                                    onChange={(e) => handleInputChange('position', e.target.value)}
                                    placeholder="Например: Frontend Developer"
                                    required
                                />
                            </div>

                            {/* О себе */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    О себе *
                                </label>
                                <Textarea
                                    value={formData.summary}
                                    onChange={(e) => handleInputChange('summary', e.target.value)}
                                    placeholder="Расскажите о себе, своих целях и достижениях..."
                                    rows={4}
                                    required
                                />
                            </div>

                            {/* Навыки */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Навыки (минимум 3, максимум 10) *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SKILLS_OPTIONS.map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => handleSkillToggle(skill)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.skills.includes(skill)
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Выбрано: {formData.skills.length}/10
                                </p>
                            </div>

                            {/* Формат работы */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Формат работы
                                </label>
                                <div className="flex gap-4">
                                    {[
                                        { value: 'office', label: 'Офис' },
                                        { value: 'remote', label: 'Удаленно' },
                                        { value: 'hybrid', label: 'Гибрид' }
                                    ].map(option => (
                                        <label key={option.value} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="workFormat"
                                                value={option.value}
                                                checked={formData.workFormat === option.value}
                                                onChange={(e) => handleInputChange('workFormat', e.target.value)}
                                                className="mr-2"
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Готовность к переезду */}
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={formData.relocation}
                                        onChange={(e) => handleInputChange('relocation', e.target.checked)}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">Готов к переезду</span>
                                </label>
                            </div>
                        </div>
                    </Card>

                    {/* Опыт работы */}
                    <Card className="mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <Briefcase className="w-5 h-5 mr-2" />
                                Опыт работы
                            </h2>
                        </div>

                        {formData.experiences.map((exp, index) => (
                            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-gray-900">{exp.title}</p>
                                        <p className="text-sm text-gray-600">{exp.company}</p>
                                        <p className="text-xs text-gray-500">{exp.from} - {exp.to || 'Настоящее время'}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeExperience(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {exp.description && (
                                    <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                                )}
                            </div>
                        ))}

                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    value={newExperience.company}
                                    onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                                    placeholder="Компания"
                                />
                                <Input
                                    value={newExperience.title}
                                    onChange={(e) => setNewExperience(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Должность"
                                />
                                <Input
                                    type="month"
                                    value={newExperience.from}
                                    onChange={(e) => setNewExperience(prev => ({ ...prev, from: e.target.value }))}
                                    placeholder="С"
                                />
                                <Input
                                    type="month"
                                    value={newExperience.to}
                                    onChange={(e) => setNewExperience(prev => ({ ...prev, to: e.target.value }))}
                                    placeholder="По"
                                />
                            </div>
                            <Textarea
                                value={newExperience.description}
                                onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Описание обязанностей и достижений"
                                rows={3}
                            />
                            <Button
                                type="button"
                                onClick={addExperience}
                                variant="outline"
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Добавить опыт
                            </Button>
                        </div>
                    </Card>

                    {/* Проекты */}
                    <Card className="mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <FileText className="w-5 h-5 mr-2" />
                                Проекты
                            </h2>
                        </div>

                        {formData.projects.map((project, index) => (
                            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-gray-900">{project.name}</p>
                                        {project.link && (
                                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                                                {project.link}
                                            </a>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeProject(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                {project.description && (
                                    <p className="text-sm text-gray-700 mt-2">{project.description}</p>
                                )}
                            </div>
                        ))}

                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <Input
                                value={newProject.name}
                                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Название проекта"
                            />
                            <Input
                                value={newProject.link}
                                onChange={(e) => setNewProject(prev => ({ ...prev, link: e.target.value }))}
                                placeholder="Ссылка на проект (необязательно)"
                            />
                            <Textarea
                                value={newProject.description}
                                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Описание проекта"
                                rows={3}
                            />
                            <Button
                                type="button"
                                onClick={addProject}
                                variant="outline"
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Добавить проект
                            </Button>
                        </div>
                    </Card>

                    {/* Образование */}
                    <Card className="mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                <GraduationCap className="w-5 h-5 mr-2" />
                                Образование
                            </h2>
                        </div>

                        {formData.education.map((edu, index) => (
                            <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <p className="font-medium text-gray-900">{edu.organization}</p>
                                        {edu.faculty && <p className="text-sm text-gray-600">{edu.faculty}</p>}
                                        <p className="text-xs text-gray-500">{edu.from} - {edu.to || 'Настоящее время'}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeEducation(index)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <Input
                                value={newEducation.organization}
                                onChange={(e) => setNewEducation(prev => ({ ...prev, organization: e.target.value }))}
                                placeholder="Учебное заведение"
                            />
                            <Input
                                value={newEducation.faculty}
                                onChange={(e) => setNewEducation(prev => ({ ...prev, faculty: e.target.value }))}
                                placeholder="Факультет/специальность"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    type="month"
                                    value={newEducation.from}
                                    onChange={(e) => setNewEducation(prev => ({ ...prev, from: e.target.value }))}
                                    placeholder="С"
                                />
                                <Input
                                    type="month"
                                    value={newEducation.to}
                                    onChange={(e) => setNewEducation(prev => ({ ...prev, to: e.target.value }))}
                                    placeholder="По"
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={addEducation}
                                variant="outline"
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Добавить образование
                            </Button>
                        </div>
                    </Card>

                    {/* Файл резюме */}
                    <Card className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Файл резюме (необязательно)</h2>

                        <div>
                            <label className="cursor-pointer">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
                                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-sm text-gray-600 mb-2">
                                        {formData.resumeFile ? formData.resumeFile.name : 'Загрузите PDF файл резюме'}
                                    </p>
                                    <p className="text-xs text-gray-500">Максимум 10 МБ</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </Card>

                    {/* Видимость */}
                    <Card className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Видимость</h2>

                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="public"
                                    checked={formData.visibility === 'public'}
                                    onChange={(e) => handleInputChange('visibility', e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">Публичное (видно всем)</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="private"
                                    checked={formData.visibility === 'private'}
                                    onChange={(e) => handleInputChange('visibility', e.target.value)}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">Приватное (только по ссылке)</span>
                            </label>
                        </div>
                    </Card>

                    {/* Кнопки */}
                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            disabled={uploading}
                            className="flex-1"
                        >
                            {uploading ? 'Публикация...' : 'Опубликовать резюме'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => handleSubmit(e, true)}
                            disabled={uploading}
                        >
                            Сохранить черновик
                        </Button>
                    </div>
                </form>
            </div>

            {showToast && (
                <Toast
                    message={toastMessage}
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    )
}

