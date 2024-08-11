'use client'

import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { GoogleGenerativeAI } from '@google/generative-ai'
import ReactMarkdown from 'react-markdown'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const formatAnalysisResult = (text: string) => {
  let formattedText = text.replace(/^[*#\s]+/gm, '');
  formattedText = formattedText.replace(/^(.+)$/m, '**$1**\n');

  const categories = ['Kondisi Gigi:', 'Kesehatan Gusi:', 'Temuan Lainnya:', 'Saran Perawatan:', 'Tips Menjaga Kesehatan Gigi:', 'Solusi Obat Apotek:', 'Solusi Obat Herbal:'];
  categories.forEach(category => {
    formattedText = formattedText.replace(new RegExp(`^${category}`, 'm'), `\n**${category}**\n`);
  });

  formattedText = formattedText.replace(/^[-•]\s*(.+)$/gm, '- $1');

  const importantPhrases = ['karies', 'plak', 'karang gigi', 'gingivitis', 'periodontitis'];
  importantPhrases.forEach(phrase => {
    formattedText = formattedText.replace(new RegExp(phrase, 'gi'), `**${phrase}**`);
  });

  return formattedText;
};

export function DentalAnalyzer() {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dentalComplaint, setDentalComplaint] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleComplaintChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDentalComplaint(e.target.value)
  }

  const analyzeImage = async () => {
    if (!image) return
    try {
      const imageData = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(image)
      })

      let promptText = `Analisis gambar gigi ini dan berikan penilaian terinci tentang kesehatan mulut.`
      if (dentalComplaint) {
        promptText += ` Pasien memiliki keluhan: "${dentalComplaint}".`
      }
      promptText += ` Berikan jawaban dalam format berikut tanpa menggunakan simbol pagar atau bintang:

Hasil Analisis Gigi

Kondisi Gigi:
- [deskripsi kondisi gigi]

Kesehatan Gusi:
- [deskripsi kesehatan gusi]

Temuan Lainnya:
- [temuan lain jika ada]

Saran Perawatan:
- [saran-saran perawatan]

Tips Menjaga Kesehatan Gigi:
- [berikan 3-5 tips menjaga kesehatan gigi]

Solusi Obat Apotek:
- [2-3 rekomendasi obat apotek]

Solusi Obat Herbal:
- [2-3 rekomendasi obat herbal]

Berikan jawaban dalam bahasa Indonesia.`

      const result = await model.generateContent([
        promptText,
        { inlineData: { data: imageData.split(',')[1], mimeType: "image/jpeg" } },
      ]);
      const response = await result.response;
      const text = response.text();
      setResult(formatAnalysisResult(text))
      setError(null)
    } catch (error) {
      console.error('Error menganalisis gambar:', error)
      setError('Terjadi kesalahan saat menganalisis gambar. Silakan coba lagi.')
      setResult(null)
    }
  }

  const startAnalysis = async () => {
    if (!image) return
    setIsAnalyzing(true)
    setResult(null)
    setError(null)
    await analyzeImage()
    setIsAnalyzing(false)
    setShowResult(true)
  }

  const resetAnalysis = () => {
    setImage(null)
    setImagePreview(null)
    setResult(null)
    setDentalComplaint('')
    setShowResult(false)
    setError(null)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (showResult && (result || error)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-100 to-pink-200 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Hasil Analisis Gigi</h2>
          {error ? (
            <p className="text-red-500 text-center mb-4">{error}</p>
          ) : (
            result && result.split('\n\n').map((section, index) => (
              <div key={index} className="mb-4 p-4 bg-pink-50 rounded-xl">
                <ReactMarkdown>{section}</ReactMarkdown>
              </div>
            ))
          )}
          <button
            onClick={resetAnalysis}
            className="w-full px-6 py-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition duration-300 ease-in-out text-lg font-semibold shadow-md"
          >
            Analisis Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-pink-200 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold tracking-tight text-center mb-5 text-gray-800">Analisa Kesehatan Gigi</h1>
        <div className="mb-5">
          <label htmlFor="" className="block text-lg font-medium tracking-tight text-gray-700 mb-3 text-center">
            Unggah Gambar Gigi
          </label>
          <div className="flex justify-center">
            <div
              onClick={triggerFileInput}
              className="w-64 h-64 border-2 border-dashed border-pink-300 rounded-2xl flex items-center justify-center cursor-pointer hover:border-pink-500 transition duration-300 ease-in-out overflow-hidden relative"
            >
              {imagePreview ? (
                <Image src={imagePreview} alt="Uploaded tooth" layout="fill" objectFit="cover" />
              ) : (
              
                <span className="text-gray-500 text-center px-4">Klik untuk unggah gambar</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        <div className='mb-3'>
          <h3 className="font-bold mb-2 font-light">Panduan Pengambilan Gambar:</h3>
          <ul className="list-disc list-inside text-xs font-light">
            <li>Pastikan pencahayaan yang cukup</li>
            <li>Fokuskan pada area gigi yang bermasalah</li>
            <li>Gunakan flash jika pencahayaan kurang terang</li>
          </ul>
        </div>


        <div className="mb-8">
          <label htmlFor="dental-complaint" className="block text-lg font-medium tracking-tight text-gray-700 mb-3">
            Keluhan Gigi (Opsional)
          </label>
          <textarea
            id="dental-complaint"
            value={dentalComplaint}
            onChange={handleComplaintChange}
            className="w-full px-4 py-3 text-gray-700 border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition duration-300 ease-in-out"
            rows={4}
            placeholder="Ceritakan keluhan gigi Anda di sini (opsional)..."
          ></textarea>
        </div>
        <button
          onClick={startAnalysis}
          disabled={!image || isAnalyzing}
          className="w-full px-6 py-3 bg-pink-600 text-white rounded-full hover:bg-pink-700 disabled:bg-pink-300 transition duration-300 ease-in-out text-lg font-semibold shadow-md"
        >
          {isAnalyzing ? 'Menganalisa gigi Anda...' : 'Mulai Analisis'}
        </button>
      </div>
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl flex flex-col items-center">
            <p className="text-xl font-semibold mb-6 text-gray-800">Menganalisa gigi Anda...</p>
            <div className="w-24 h-24 rounded-full border-4 border-pink-500 border-t-transparent animate-spin"></div>
          </div>
        </div>
      )}
    </div>
  )
}