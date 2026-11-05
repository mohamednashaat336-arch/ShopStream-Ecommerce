import { useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import './adminModal.css'

export function AdminModal({ title, subtitle, onClose, children, footer, className = '', backdropClassName = '' }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  return <div className={`admin-modal-backdrop ${backdropClassName}`} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section className={`admin-modal ${className}`} role="dialog" aria-modal="true" aria-label={title}>
      <header className="admin-modal-header">
        <div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
        <button type="button" className="admin-modal-close" onClick={onClose} aria-label="Close dialog"><FaTimes /></button>
      </header>
      <div className="admin-modal-content">{children}</div>
      {footer && <footer className="admin-modal-footer">{footer}</footer>}
    </section>
  </div>
}
