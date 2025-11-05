import React from 'react'
import { Link } from 'react-router-dom'
import { SparklesIcon, ArrowRightIcon } from '@heroicons/react/24/solid'

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center text-center px-6 py-16 relative overflow-hidden">
      {/* glowing background orbs */}
      <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-60 -right-60 w-[32rem] h-[32rem] bg-purple-600/30 rounded-full blur-3xl animate-pulse" />

      <div className="max-w-3xl z-10">
        <SparklesIcon className="w-14 h-14 text-indigo-400 mx-auto mb-4" />
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-300 via-sky-400 to-purple-400 text-transparent bg-clip-text">
          Smarter Roads. Safer Cities.
        </h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          RoadVision AI detects potholes, cracks, and unpaved surfaces from images using cutting-edge deep learning.
          Empower city planners and citizens with instant, AI-driven insights.
        </p>
        <Link
          to="/detect"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold text-white hover:opacity-90 transition"
        >
          Try the Detector <ArrowRightIcon className="w-5 h-5" />
        </Link>
      </div>

      {/* feature cards */}
      <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-5xl">
        {[
          {
            title: 'AI-Powered Analysis',
            text: 'Trained on thousands of road images to detect anomalies with high precision.'
          },
          {
            title: 'Instant Results',
            text: 'Upload an image and get detections in seconds with confidence scores.'
          },
          {
            title: 'Smart Insights',
            text: 'Designed for infrastructure planning, research, and safety applications.'
          }
        ].map((f, i) => (
          <div
            key={i}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-xl hover:scale-[1.02] transition-transform"
          >
            <h3 className="text-xl font-semibold mb-2 text-indigo-300">{f.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{f.text}</p>
          </div>
        ))}
      </div>

      {/* footer */}
      <p className="mt-20 text-gray-500 text-xs">© 2025 RoadVision AI | Built by Ansh Sehgal, Shrishti Bajpai, Swarnima Singh and Anshika Srivastava</p>
    </section>
  )
}
