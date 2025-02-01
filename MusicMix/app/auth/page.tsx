import AuthForm from './form'
export default function AuthPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center">Login or Sign up</h3>
        <AuthForm />
      </div>
    </div>
  )
}

