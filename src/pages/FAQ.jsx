import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { faqData } from '../data/faq'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function FAQ() {
    const [openId, setOpenId] = useState(null)

    const toggleQuestion = (id) => {
        setOpenId(openId === id ? null : id)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl">
                <div className="flex items-center justify-center mb-6">
                    <HelpCircle className="w-12 h-12 text-indigo-600 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900">
                        Часто задаваемые вопросы
                    </h1>
                </div>

                <div className="space-y-4 mb-8">
                    {faqData.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => toggleQuestion(item.id)}
                                className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                                <span className="font-semibold text-left text-gray-900">
                                    {item.question}
                                </span>
                                {openId === item.id ? (
                                    <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0 ml-4" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0 ml-4" />
                                )}
                            </button>

                            {openId === item.id && (
                                <div className="px-6 py-4 bg-white">
                                    <p className="text-gray-700 whitespace-pre-line">
                                        {item.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex space-x-4">
                    <Link to="/login" className="flex-1">
                        <Button variant="outline" className="w-full">
                            Вход
                        </Button>
                    </Link>
                    <Link to="/register" className="flex-1">
                        <Button className="w-full">
                            Регистрация
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    )
}

