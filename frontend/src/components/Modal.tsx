import { XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop with blur effect */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-fade-in"
          onClick={onClose}
        />

        {/* Modal with premium dark theme */}
        <div className="relative w-full max-w-2xl transform transition-all opacity-0 animate-fade-in-up sm:w-full" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
          {/* Outer Glow */}
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-20 blur-xl" />

          {/* Modal Content */}
          <div className="relative bg-[#0a0a10] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
                <h2 className="text-xl font-bold text-white">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all hover:rotate-90 duration-300"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
