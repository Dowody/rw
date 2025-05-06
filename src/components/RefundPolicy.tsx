import React from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  RefreshCw, 
  ShieldCheck, 
  DollarSign, 
  ArrowLeft, 
  Clock, 
  Zap, 
  AlertTriangle 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const RefundPolicy: React.FC = () => {
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

  const refundSection = [
    {
      icon: <Clock className="w-6 h-6 text-[#8a4fff]" />,
      title: "1. Refund Window",
      description: "We offer a comprehensive 30-day money-back guarantee for all subscription plans. Refunds are processed within 5-7 business days of the request."
    },
    {
      icon: <Zap className="w-6 h-6 text-green-500" />,
      title: "2. Quick Processing",
      description: "Refund requests are handled efficiently. Once approved, the refund will be credited to the original payment method within the specified timeframe."
    },
    {
      icon: <AlertTriangle className="w-6 h-6 text-red-500" />,
      title: "3. Non-Refundable Scenarios",
      description: "Refunds are not applicable for accounts with fraudulent activity, Terms of Service violations, or subscriptions beyond the 30-day window."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-500" />,
      title: "4. Refund Guarantee",
      description: "We stand behind the quality of our service. If you're unsatisfied within the first 30 days, we'll provide a full refund, no questions asked."
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
              <DollarSign className="w-12 h-12 text-[#8a4fff]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 
            text-transparent bg-clip-text 
            bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
            Refund Policy
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Last Updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-[#1a0b2e] rounded-2xl p-8 space-y-8">
          {refundSection.map((section, index) => (
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
            <CreditCard className="w-12 h-12 text-green-500" />
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            We prioritize customer satisfaction and transparency in our refund process.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default RefundPolicy
