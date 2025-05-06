import React from 'react'
import { motion } from 'framer-motion'
import { 
  Link2, 
  Settings, 
  Target,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: <Link2 />,
      title: "Account Integration",
      description: "Seamlessly connect your CSGORoll account using our secure, one-click authentication process.",
      color: "bg-[#8a4fff]"
    },
    {
      icon: <Settings />,
      title: "Customized Configuration",
      description: "Set precise trading parameters, risk levels, and withdrawal strategies tailored to your preferences.",
      color: "bg-[#8a4fff]"
    },
    {
      icon: <Target />,
      title: "Intelligent Execution",
      description: "Our advanced AI algorithm executes trades with millisecond precision, maximizing your potential returns.",
      color: "bg-[#8a4fff]"
    },
    {
      icon: <Zap />,
      title: "Real-time Optimization",
      description: "Continuous machine learning adapts your strategy in real-time, responding to market dynamics.",
      color: "bg-[#8a4fff]"
    },
    {
      icon: <Shield />,
      title: "Advanced Security",
      description: "Military-grade encryption and multi-factor authentication protect your account and transactions.",
      color: "bg-[#8a4fff]"
    },
    {
      icon: <TrendingUp />,
      title: "Performance Tracking",
      description: "Detailed analytics and performance metrics help you understand and improve your trading strategy.",
      color: "bg-[#8a4fff]"
    }
  ]

  return (
    <section 
      className="py-16 bg-[#04011C] relative overflow-hidden"
      id="how-it-works"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 
            text-transparent bg-clip-text 
            bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
            How RollWithdraw Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A comprehensive, intelligent trading solution designed for maximum efficiency
          </p>
        </div>

        {/* Desktop Grid Design */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                delay: index * 0.1 
              }}
              className={`
                p-6 rounded-2xl 
                relative overflow-hidden
                transition-all duration-300
                bg-[#2c1b4a] border border-[#8a4fff]/20
                hover:border-[#8a4fff]/50
                transform hover:-translate-y-2
                shadow-lg hover:shadow-2xl
              `}
            >
              <div className="flex items-center mb-4">
                <div className={`
                  w-12 h-12 rounded-full 
                  flex items-center justify-center 
                  mr-4 
                  ${step.color}
                `}>
                  {React.cloneElement(step.icon, {
                    className: "w-6 h-6 text-white"
                  })}
                </div>
                <h3 className="text-xl font-semibold text-[#8a4fff]">
                  {step.title}
                </h3>
              </div>
              
              <p className="text-base text-gray-300 mb-4">
                {step.description}
              </p>
              
              <div className="absolute bottom-3 right-3 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b] opacity-20">
                0{index + 1}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden relative">
          {/* Vertical Line */}
          <div className="absolute left-5 top-0 bottom-0 w-1 bg-gradient-to-b from-[#8a4fff]/30 to-[#5e3c9b]/30"></div>
          
          <div className="space-y-8 relative">
            {steps.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: 0, y: 30 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  ease: "easeOut" 
                }}
                viewport={{ once: true }}
                className={`
                  relative pl-16
                  ${index % 2 === 0 ? 'pr-0 md:pr-16' : 'pl-16 md:pl-0 md:pr-16'}
                `}
              >
                {/* Step Dot */}
                <div className={`
                  absolute left-[-2px] top-0
                  w-12 h-12 rounded-full flex items-center justify-center
                  ${step.color} shadow-xl z-10
                  border-4 border-[#04011C]
                `}>
                  {React.cloneElement(step.icon, {
                    className: "w-6 h-6 text-white"
                  })}
                </div>

                {/* Step Content */}
                <div className="bg-[#2c1b4a] border border-[#8a4fff]/20 rounded-2xl p-5 relative">
                  <h3 className="text-lg font-semibold mb-3 text-[#8a4fff]">
                    {step.title}
                  </h3>
                  <p className="text-base text-gray-300">
                    {step.description}
                  </p>
                  <div className="absolute bottom-3 right-3 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b] opacity-20">
                    0{index + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
