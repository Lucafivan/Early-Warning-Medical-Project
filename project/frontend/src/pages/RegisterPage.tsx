import React from 'react'
import '../index.css'
import Logo from '../assets/spil_logo.png'


const RegisterPage = () => {

  return (
    <div className='flex w-full min-h-screen'>

        <div className='w-1/2 bg-green-600'>
           <h4> left </h4>
        </div>

        <div className='w-full md:w-1/2 bg-gray-100 flex justify-center items-center p-8'>
         <div className="absolute top-6 right-8">
            <img src={Logo} alt="SPIL Logo" className="h-8" />
        </div>
            <div className='w-full max-w-md bg-white p-8 rounded-xl shadow-md'>

                 <h2 className="text-3xl font-bold mb-6 text-green-600">Register</h2>
                <form>
            {/* Username */}
            <div className="mb-4">
                <div className="flex justify-start">
                <label htmlFor="username" className="block text-sm font-medium text-gray-600 mb-1">
                    username
                </label>
            </div>

              
              <input
                type="text"
                id="username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Email */}
            <div className="mb-4">
                <div className='flex justify-start'>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                    email
                </label>
            </div>
              
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/*Password */}
            <div className="mb-6">
                <div className='flex justify-start'>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-1">
                        password
                    </label>
                </div>
              
              <input
                type="password"
                id="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Register */}
            <button
              type="submit"
              className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-lg hover:bg-[#327a35] transition"
            >
              Register
            </button>
          </form>

           <p className="text-center text-sm text-gray-500 mt-6">
              Sudah punya akun?{' '}
              <a href="/" className="text-blue-600 hover:underline font-medium">
                Login
              </a>
            </p>
            </div>
        </div>
    </div>
  )
}

export default RegisterPage
