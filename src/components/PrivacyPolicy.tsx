import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Lock, 
  Shield, 
  Database, 
  Eye, 
  ArrowLeft, 
  UserCheck, 
  Globe, 
  MessageCircle 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'


const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate()


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const pageVariants = {
    initial: { opacity: 1, y: 50 },
    in: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    },
    out: { 
      opacity: 1, 
      y: 50,
      transition: {
        duration: 0.5,
        ease: 'easeIn'
      }
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  const privacySection = [
    {
      icon: <UserCheck className="w-6 h-6 text-[#8a4fff]" />,
      title: "1. Information Collection",
      description: "We collect essential information including email, account preferences, and usage data to provide and improve our service. We do not collect unnecessary personal information."
    },
    {
      icon: <Shield className="w-6 h-6 text-green-500" />,
      title: "2. Data Protection",
      description: "All user data is encrypted using industry-standard security protocols. We implement multi-layered security measures to protect your information from unauthorized access."
    },
    {
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      title: "3. Data Usage",
      description: "Your data is used solely for service improvement, personalization, and communication. We never sell or share personal information with third-party marketers."
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-purple-500" />,
      title: "4. User Communication",
      description: "We may send important service-related notifications. Users can opt-out of non-essential communications at any time through account settings."
    }
  ]

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="min-h-screen bg-[#0a0415] text-white py-8 sm:py-16 px-4"
    >
      {/* Back to Home Button */}
      <div className="container mx-auto max-w-4xl pt-4 mb-6 sm:mb-8 mt-6 sm:mt-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBackToHome}
          className="flex items-center text-gray-300 hover:text-[#8a4fff] transition-colors"
        >
          <ArrowLeft className="mr-2 w-5 h-5 sm:w-6 sm:h-6" /> 
          <span className="text-[14px] sm:text-base">Back to Home</span>
        </motion.button>
      </div>

      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-[#8a4fff]/20 p-3 sm:p-4 rounded-full">
              <Lock className="w-8 h-8 sm:w-12 sm:h-12 text-[#8a4fff]" />
            </div>
          </div>
          <h1 className="text-[28px] sm:text-4xl font-bold mb-3 sm:mb-4 
            text-transparent bg-clip-text 
            bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
            Privacy Policy
          </h1>
          <p className="text-[14px] sm:text-base text-gray-400 max-w-2xl mx-auto">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-[#1a0b2e] rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-8">
          {privacySection.map((section, index) => (
            <div 
              key={index} 
              className="flex items-start space-x-3 sm:space-x-4 bg-[#2c1b4a] p-4 sm:p-6 rounded-xl"
            >
              <div className="mt-1">{React.cloneElement(section.icon, { 
                className: "w-5 h-5 sm:w-6 sm:h-6" 
              })}</div>
              <div>
                <h2 className="text-[16px] sm:text-xl font-semibold text-[#8a4fff] mb-2 sm:mb-3">
                  {section.title}
                </h2>
                <p className="text-[14px] sm:text-base text-gray-300">
                  {section.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <div className="flex justify-center mb-3 sm:mb-4">
            <Eye className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" />
          </div>
          <p className="text-[14px] sm:text-base text-gray-400 max-w-2xl mx-auto">
            We are committed to maintaining the highest standards of privacy and data protection.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default PrivacyPolicy
