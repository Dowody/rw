import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Lock, 
  Shield, 
  FileText, 
  ArrowLeft, 
  Globe, 
  Users, 
  AlertTriangle,
  CreditCard,
  UserCheck,
  MessageCircle,
  Eye,
  ShieldCheck,
  Clock,
  Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type PolicyType = 'privacy' | 'terms' 

const PolicyPage: React.FC = () => {
  const navigate = useNavigate()
  const [activePolicy, setActivePolicy] = useState<PolicyType>('privacy')

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

  const handleBackToCheckout = () => {
    navigate('/checkout')
  }

  const policyData = {
    privacy: {
      title: "Privacy Policy",
      icon: <Lock className="w-12 h-12 text-[#8a4fff]" />,
      sections: [
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
    },
    terms: {
      title: "Terms of Service",
      icon: <FileText className="w-12 h-12 text-[#8a4fff]" />,
      sections: [
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
    }
  }

  const currentPolicy = policyData[activePolicy]

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
          onClick={handleBackToCheckout}
          className="flex items-center text-gray-300 hover:text-[#8a4fff] transition-colors"
        >
          <ArrowLeft className="mr-2 w-5 h-5 sm:w-6 sm:h-6" /> 
          <span className="text-[14px] sm:text-base">Back to Checkout</span>
        </motion.button>
      </div>

      <div className="container mx-auto max-w-4xl">
        {/* Policy Navigation */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {(Object.keys(policyData) as PolicyType[]).map((policy) => (
            <button
              key={policy}
              onClick={() => setActivePolicy(policy)}
              className={`
                px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all duration-300 text-[14px] sm:text-base
                ${activePolicy === policy 
                  ? 'bg-[#8a4fff] text-white' 
                  : 'bg-transparent text-gray-400 hover:bg-[#8a4fff]/10 hover:text-[#8a4fff]'}
              `}
            >
              {policy.charAt(0).toUpperCase() + policy.slice(1)} Policy
            </button>
          ))}
        </div>

        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-[#8a4fff]/20 p-3 sm:p-4 rounded-full">
              {React.cloneElement(currentPolicy.icon, { 
                className: "w-8 h-8 sm:w-12 sm:h-12 text-[#8a4fff]" 
              })}
            </div>
          </div>
          <h1 className="text-[28px] sm:text-4xl font-bold mb-3 sm:mb-4 
            text-transparent bg-clip-text 
            bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
            {currentPolicy.title}
          </h1>
          <p className="text-[14px] sm:text-base text-gray-400 max-w-2xl mx-auto">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#210746] to-[#2C095D] rounded-2xl p-4 sm:p-8 space-y-4 sm:space-y-8">
          {currentPolicy.sections.map((section, index) => (
            <div 
              key={index} 
              className="flex items-start space-x-3 sm:space-x-4 bg-gradient-to-br from-[#8a4fff]/20 to-[#8a4fff]/5 p-4 sm:p-6 rounded-xl"
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
            {activePolicy === 'privacy' && <Eye className="w-8 h-8 sm:w-12 sm:h-12 text-blue-500" />}
            {activePolicy === 'terms' && <ShieldCheck className="w-8 h-8 sm:w-12 sm:h-12 text-green-500" />}
          </div>
          <p className="text-[14px] sm:text-base text-gray-400 max-w-2xl mx-auto">
            {activePolicy === 'privacy' && "We are committed to maintaining the highest standards of privacy and data protection."}
            {activePolicy === 'terms' && "By using RollWithdraw, you acknowledge and agree to these Terms of Service."}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default PolicyPage
