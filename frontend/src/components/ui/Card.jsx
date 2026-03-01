export default function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card border border-gray-100 p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}
