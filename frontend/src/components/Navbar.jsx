import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const linkClass = (path) =>
    `px-4 py-2 rounded-md transition-all ${
      location.pathname === path
        ? 'bg-indigo-600 text-white'
        : 'text-gray-300 hover:text-white hover:bg-white/10'
    }`

  return (
    <nav className="flex justify-between items-center px-8 py-4 backdrop-blur-lg bg-white/5 border-b border-white/10 sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-sky-400 to-purple-400 bg-clip-text text-transparent">
        RoadVision AI
      </Link>
      <div className="flex gap-3 text-sm">
        <Link className={linkClass('/')} to="/">Home</Link>
        <Link className={linkClass('/detect')} to="/detect">Detector</Link>
      </div>
    </nav>
  )
}
