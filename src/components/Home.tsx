import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Star, CheckCircle, X, ShieldCheck } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { supabase } from '../lib/supabaseClient'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'

import Hero from './Hero'
import HowItWorks from './HowItWorks'
import Products from './Pricing'
import Features from './Features'
import FAQ from './FAQ'
import Footer from './Footer'

const trustpilotReviews = [
  {
    name: "Dmitry Volkov",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
    rating: 5,
    platform: "CSGORoll",
    text: {
      en: "Incredible withdrawal script. Saved me countless hours of manual work. Absolutely worth every ruble!",
      ru: "Невероятный скрипт для вывода. Сэкономил массу времени на ручной работе. Стоит каждого рубля!"
    }
  },
  {
    name: "Ivan Petrov",
    profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 5,
    platform: "CSGORoll",
    text: {
      en: "Fast, reliable, and professional. The script works perfectly without any issues. Highly recommended for all traders!",
      ru: "Быстро, надежно и профессионально. Скрипт работает идеально, без малейших проблем. Рекомендую всем трейдерам!"
    }
  },
  {
    name: "Sergei Kuznetsov",
    profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
    rating: 4,
    platform: "CSGORoll",
    text: {
      en: "Great tool for withdrawal automation. Some initial setup complexity, but the results are definitely worth the effort.",
      ru: "Отличный инструмент для автоматизации выводов. Немного сложностей с настройкой, но результат того стоит."
    }
  },
  {
    name: "Alexei Popov",
    profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
    rating: 5,
    platform: "CSGORoll",
    text: {
      en: "Exceeded my expectations. The script works faster and more efficiently than I anticipated. Saves time and reduces stress.",
      ru: "Превзошел все мои ожидания. Скрипт работает быстрее и эффективнее, чем я думал. Экономит время и снижает стресс."
    }
  }
];


const Home: React.FC = () => {
  const location = useLocation()
  const [showCookieConsent, setShowCookieConsent] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsAuthenticated(!!session)
      
      // Only show cookie consent if user is not authenticated and hasn't made a choice before
      if (!session && !localStorage.getItem('cookieConsent')) {
        setShowCookieConsent(true)
      }
    }
    
    checkAuth()
  }, [])

  const handleCookieConsent = (accepted: boolean) => {
    localStorage.setItem('cookieConsent', accepted ? 'accepted' : 'rejected')
    setShowCookieConsent(false)
  }

  useEffect(() => {
    console.log('Home component mounted, location state:', location.state)

    // Check if there's a specific section to scroll to
    if (location.state) {
      if (location.state.scrollTo) {
        const sectionId = location.state.scrollTo
        const section = document.querySelector(sectionId)
        
        if (section) {
          section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          })
        }
      }

      // Clear the state to prevent repeated actions
      window.history.replaceState({}, document.title)
    } 
  }, [location])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <HowItWorks />
      <Products />
      
      {/* <Features /> */}
      <FAQ />
      <Footer />

      {/* Cookie Consent Popup */}
      <AnimatePresence>
        {showCookieConsent && (
          <motion.div
            initial={{ y: 100, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="relative max-w-7xl mx-auto p-4 sm:p-6">
              <div className="bg-gradient-to-br from-[#1a0b2e] to-[#2c1b4a] rounded-2xl  shadow-2xl shadow-[#8a4fff]/5">
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#8a4fff] via-[#6a2dcf] to-[#4a1daf] rounded-t-2xl"></div>
                
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8a4fff]/20 to-[#8a4fff]/5 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-[#8a4fff]" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">We value your privacy</h3>
                      </div>
                      <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                        We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. 
                        By clicking "Accept All", you consent to our use of cookies.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleCookieConsent(false)}
                        className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-[#8a4fff]/10"
                      >
                        Reject All
                      </button>
                      <button
                        onClick={() => handleCookieConsent(true)}
                        className="px-6 py-3 text-sm font-medium bg-gradient-to-r from-[#8a4fff] via-[#6a2dcf] to-[#4a1daf] text-white rounded-xl hover:from-[#7a3fff] hover:via-[#5a2dbf] hover:to-[#3a1d9f] transition-all duration-300 shadow-lg shadow-[#8a4fff]/20 active:scale-[0.98]"
                      >
                        Accept All
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .swiper-pagination-bullet {
          background-color: rgba(138, 79, 255, 0.3) !important;
        }
        .swiper-pagination-bullet-active {
          background-color: #8a4fff !important;
        }
      `}</style>
    </motion.div>
  )
}

export default Home
