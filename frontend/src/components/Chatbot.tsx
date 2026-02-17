import { useState, useRef, useEffect } from 'react'
import { ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline'
import api from '../utils/api'

interface Message {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

interface ChatStatus {
    status: 'online' | 'offline' | 'model_missing' | 'error'
    message: string
    model_available: boolean
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<ChatStatus | null>(null)
    const [checkingStatus, setCheckingStatus] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Check Ollama status when opening
    useEffect(() => {
        if (isOpen && !status) {
            checkOllamaStatus()
        }
    }, [isOpen])

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const checkOllamaStatus = async () => {
        setCheckingStatus(true)
        try {
            const response = await api.get('/chatbot/status')
            setStatus(response.data)

            // Add welcome message if online
            if (response.data.status === 'online' && messages.length === 0) {
                setMessages([{
                    role: 'assistant',
                    content: "👋 Hello! I'm your AI assistant powered by Ollama phi4. I can help you with questions about your store data - inventory, sales, customers, and finances. What would you like to know?",
                    timestamp: new Date()
                }])
            }
        } catch (error) {
            setStatus({
                status: 'offline',
                message: 'Cannot connect to chatbot service',
                model_available: false
            })
        } finally {
            setCheckingStatus(false)
        }
    }

    const sendMessage = async () => {
        if (!input.trim() || loading) return

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await api.post('/chatbot/chat', {
                message: userMessage.content,
                conversation_history: messages.slice(-10).map(m => ({
                    role: m.role,
                    content: m.content
                }))
            })

            const assistantMessage: Message = {
                role: 'assistant',
                content: response.data.response,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error: any) {
            const errorMessage = error.response?.data?.detail || 'Failed to get response. Please try again.'
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `❌ ${errorMessage}`,
                timestamp: new Date()
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: "Chat cleared! How can I help you today?",
            timestamp: new Date()
        }])
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border border-white/10 ${isOpen
                    ? 'bg-rose-600 hover:bg-rose-700 rotate-180'
                    : 'bg-gradient-to-br from-violet-600 to-fuchsia-600 hover:shadow-violet-500/50'
                    }`}
                title="AI Assistant"
            >
                {isOpen ? (
                    <XMarkIcon className="w-8 h-8 text-white" />
                ) : (
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-slideInUp">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 text-white flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/20">
                                <SparklesIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">AI Assistant</h3>
                                <div className="flex items-center gap-2 text-xs text-white/80">
                                    <span className={`w-2 h-2 rounded-full ${status?.status === 'online' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' :
                                        status?.status === 'offline' ? 'bg-rose-400' :
                                            'bg-amber-400'
                                        }`}></span>
                                    <span>{status?.status === 'online' ? 'Online' : status?.message || 'Connecting...'}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={clearChat}
                            className="text-xs bg-black/20 hover:bg-black/30 px-3 py-1 rounded-full transition border border-white/10"
                        >
                            Clear
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-transparent custom-scrollbar">
                        {checkingStatus && (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                            </div>
                        )}

                        {status?.status === 'offline' && !checkingStatus && (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
                                <p className="text-rose-400 font-semibold mb-2">⚠️ Ollama Not Running</p>
                                <p className="text-rose-300 text-sm mb-3">{status.message}</p>
                                <button
                                    onClick={checkOllamaStatus}
                                    className="px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition"
                                >
                                    Retry Connection
                                </button>
                            </div>
                        )}

                        {status?.status === 'model_missing' && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                                <p className="text-amber-400 font-semibold mb-2">⚠️ Model Not Found</p>
                                <p className="text-amber-300 text-sm mb-2">{status.message}</p>
                                <code className="text-xs bg-black/30 px-2 py-1 rounded text-amber-200 border border-amber-500/20">ollama pull phi4:14b</code>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl border ${msg.role === 'user'
                                        ? 'bg-violet-600 border-violet-500 text-white rounded-br-sm'
                                        : 'bg-white/5 border-white/10 text-gray-200 rounded-bl-sm'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/60' : 'text-gray-500'
                                        }`}>
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm p-3 max-w-[85%]">
                                    <div className="flex items-center gap-2">
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                        <span className="text-xs text-gray-400">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about your store data..."
                                disabled={loading || status?.status !== 'online'}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 text-white placeholder-gray-500 disabled:opacity-50 text-sm transition-all"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading || !input.trim() || status?.status !== 'online'}
                                className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-600 mt-2 text-center">
                            Powered by Ollama phi4:14b
                        </p>
                    </div>
                </div>
            )}

            {/* Animation styles */}
            <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideInUp {
          animation: slideInUp 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
        </>
    )
}
