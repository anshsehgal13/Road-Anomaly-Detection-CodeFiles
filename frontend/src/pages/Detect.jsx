import React, { useState, useRef } from 'react'
import { CloudArrowUpIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/solid'

const API_URL = 'http://127.0.0.1:5000'

export default function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const dropRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
  }

  const handleInputChange = (e) => handleFile(e.target.files[0])

  const handleDrop = (e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
    dropRef.current.classList.remove('border-indigo-400', 'bg-white/10')
  }

  const handleDragOver = (e) => e.preventDefault()
  const handleDragEnter = () => dropRef.current.classList.add('border-indigo-400', 'bg-white/10')
  const handleDragLeave = () => dropRef.current.classList.remove('border-indigo-400', 'bg-white/10')

  const handleUpload = async () => {
    if (!file) return alert('Please choose an image first!')
    setLoading(true)
    const fd = new FormData()
    fd.append('image', file)

    try {
      const res = await fetch(`${API_URL}/predict`, { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) setResult(data)
      else alert(data.error || 'Prediction failed')
    } catch (err) {
      alert('Server error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-950 via-indigo-950 to-slate-900 text-white px-6 py-8 font-[Poppins] relative overflow-hidden">
      {/* glowing background orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-[28rem] h-[28rem] bg-purple-600/20 rounded-full blur-3xl animate-pulse" />

      {/* header */}
      <div className="text-center mb-10 z-10">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-300 via-sky-400 to-purple-400 text-transparent bg-clip-text">
          Road Anomaly Detector
        </h1>
        <p className="mt-3 text-gray-300 text-sm md:text-base">
          AI-powered detection for potholes, cracks, and unpaved surfaces
        </p>
      </div>

      {/* upload area */}
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className="w-full max-w-3xl rounded-2xl border-2 border-dashed border-white/20 backdrop-blur-lg bg-white/5 p-8 text-center transition-all hover:border-indigo-400"
      >
        {!preview ? (
          <div className="flex flex-col items-center justify-center gap-4 text-gray-300">
            <CloudArrowUpIcon className="w-16 h-16 text-indigo-400" />
            <p className="text-lg font-medium">Drag & drop road image here</p>
            <p className="text-sm opacity-60">or</p>
            <label
              htmlFor="fileInput"
              className="cursor-pointer px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition"
            >
              Browse Files
            </label>
            <input id="fileInput" type="file" accept="image/*" onChange={handleInputChange} className="hidden" />
          </div>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto max-h-80 rounded-xl object-cover shadow-lg border border-white/10"
            />
            <button
              onClick={() => {
                setPreview(null)
                setFile(null)
                setResult(null)
              }}
              className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white text-xs px-3 py-1 rounded-lg"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* predict button */}
      {preview && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="mt-8 px-8 py-3 rounded-xl font-semibold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 shadow-lg transition-all disabled:opacity-60"
        >
          {loading ? 'Analyzing...' : 'Detect Anomaly'}
        </button>
      )}

      {/* loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white">
          <div className="w-16 h-16 border-4 border-t-transparent border-indigo-400 rounded-full animate-spin mb-4" />
          <p className="text-lg tracking-wide text-indigo-200">Analyzing road image...</p>
        </div>
      )}

      {/* result card */}
      {result && !loading && (
        <div className="mt-10 w-full max-w-md text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl animate-fadeIn">
          <SparklesIcon className="w-10 h-10 mx-auto text-indigo-400 mb-3" />
          <p className="text-gray-300 text-sm">Detected Anomaly</p>
          <h2 className="text-3xl font-bold mt-1 bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">
            {result.label}
          </h2>
          <p className="mt-2 text-gray-400 text-sm">Confidence: {(result.confidence * 100).toFixed(2)}%</p>
        </div>
      )}

      {/* footer */}
      <p className="mt-12 text-gray-500 text-xs text-center">
        Built by <span className="text-indigo-400 font-medium">Ansh Sehgal, Shrishti Bajpai, Swarnima Singh and Anshika Srivastava</span>
      </p>
    </div>
  )
}
