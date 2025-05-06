import React from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  ShieldCheck, 
  ArrowLeft, 
  Lock, 
  Globe, 
  Users, 
  AlertTriangle 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TermsOfService: React.FC = () => {
  const navigate = useNavigate()

  const pageVariants = {
    initial: { opacity: 0, y: 50 },
    in: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    },
    out: { 
      opacity: 0, 
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

  const termsSection = [
    {
      icon: <Globe className="w-6 h-6 text-[#8a4fff]" />,
      title: "1. Acceptance of Terms",
      description: "By accessing and using RollWithdraw, you agree to be bound by these Terms of Service. Continued use of our platform constitutes acceptance of these terms."
    },
    {
      icon: <Lock className="w-6 h-6 text-green-500" />,
      title: "2. User Responsibilities",
      description: "Users are responsible for maintaining the confidentiality of their account, providing accurate information, and using the service in compliance with all applicable laws."
    },
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: "3. Account Conduct",
      description: "Prohibited activities include fraudulent behavior, sharing account credentials, automated scraping, and any actions that may disrupt the service or violate CSGORoll's terms."
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      title: "4. Limitation of Liability",
      description: "RollWithdraw is not liable for any financial losses, trading outcomes, or damages arising from the use of our service. Trading involves inherent risks."
    }
  ]

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="min-h-screen bg-[#0a0415] text-white py-16 px-4"
    >
      {/* Back to Home Button */}
      <div className="container mx-auto max-w-4xl mb-8 mt-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBackToHome}
          className="flex items-center text-gray-300 hover:text-[#8a4fff] transition-colors"
        >
          <ArrowLeft className="mr-2 w-5 h-5" /> Back to Home
        </motion.button>
      </div>

      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-[#8a4fff]/20 p-4 rounded-full">
              <FileText className="w-12 h-12 text-[#8a4fff]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 
            text-transparent bg-clip-text 
            bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
            Terms of Service
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-[#1a0b2e] rounded-2xl p-8 space-y-8">
          {termsSection.map((section, index) => (
            <div 
              key={index} 
              className="flex items-start space-x-4 bg-[#2c1b4a] p-6 rounded-xl"
            >
              <div className="mt-1">{section.icon}</div>
              <div>
                <h2 className="text-xl font-semibold text-[#8a4fff] mb-3">
                  {section.title}
                </h2>
                <p className="text-gray-300">
                  {section.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="w-12 h-12 text-green-500" />
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            By using RollWithdraw, you acknowledge and agree to these Terms of Service.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default TermsOfService
