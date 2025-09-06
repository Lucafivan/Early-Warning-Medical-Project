import React from 'react'
import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className='h-screen bg-gray-800 flex flex-col justify-center items-center space-y-4'>
      <h1 className='text-red-500 text-6xl font-bold'>404</h1>
      <h2 className='text-red-500 text-2xl'>Halaman Tidak Ditemukan</h2>

      <Link to="/dashboard">
        <button className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded'>
          Kembali
        </button>
      </Link>
    </div>
  )
}

export default NotFoundPage

