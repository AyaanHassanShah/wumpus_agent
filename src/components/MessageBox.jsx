// src/components/MessageBox.jsx

export default function MessageBox({ message, type = 'info' }) {
  return (
    <div className={`msg-box ${type}`}>
      {message || 'Configure rows & columns, then click ⚡ INITIALIZE AGENT.'}
    </div>
  )
}
