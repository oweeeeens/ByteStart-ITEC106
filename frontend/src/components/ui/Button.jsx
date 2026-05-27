export default function Button({ variant = 'primary', className = '', children, ...props }) {
  const styles = {
    primary:   'bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200',
    danger:    'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg',
    success:   'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg',
  }
  return (
    <button
      className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-200 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant] || styles.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
