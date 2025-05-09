import React from 'react'
import { motion } from 'framer-motion'
import { 
  Link2, 
  Settings, 
  Target,
  Zap,
  Shield,
  TrendingUp,
  Stars,
  BellRing,
  ShieldCheck,
  Globe,
  ServerCrash,
  SlidersHorizontal,
  Workflow,
  Bot
} from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: <Bot />, // Better represents setting parameters
      title: "Full Trade Automation",
      description: "You set the minimum and maximum price of the item, the maximum percentage markup, the blacklisted items, and the bot will automatically withdraw items based on those parameters.",
      color: "bg-[#8a4fff]"
    },
    {
      icon: <ServerCrash />, // Represents server speed and performance
      title: "Fastest Servers",
      description: "Our high-speed servers handle trade execution ensuring peak performance, eliminating the need for traders to acquire additional hosting solutions.",
      color: "bg-[#8a4fff]"
    },
    {
      icon: <Globe />, // Represents browser-based access
      title: "Browser Based",
      description: "RollWithdraw can be configured directly on our site, without the need to download any additional programs, ensuring an easy user experience.",
      color: "bg-[#8a4fff]"
    },
    {
      icon: <ShieldCheck />, // Represents CAPTCHA handling and protection
      title: "CAPTCHA Solver",
      description: "Our withdrawal bot efficiently manages CAPTCHA challenges, ensuring a seamless and hassle-free user experience with minimal need for manual input.",
      color: "bg-[#8a4fff]"
    },
    {
      icon: <Stars />, // Represents uniqueness and standout features
      title: "Unique Features",
      description: "We offer unique features, such as blacklisting all items marked as unstable and the ability to snipe expensive sticker crafts.",
      color: "bg-[#8a4fff]"
    },
    {
      icon: <BellRing />, // Notification icon
      title: "Notifications",
      description: "You can choose to receive Discord or Pushover notifications for every action performed.",
      color: "bg-[#8a4fff]"
    }
  ]

  return (
    <section 
      className="py-16 bg-[#04011C] relative overflow-hidden pt-20"
      id="how-it-works"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-[28px] sm:text-4xl font-bold mb-4 
            text-transparent bg-clip-text 
            bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
            How RollWithdraw Works
          </h2>
          <p className="text-[16px] sm:text-xl text-gray-400 max-w-2xl mx-auto">
          An efficient, automated solution for optimized withdrawals for you          </p>
        </div>

        {/* Desktop Grid Design */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 1, y: 50 }}
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
                initial={{ opacity: 1, x: 0, y: 30 }}
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
                  absolute left-[2px] top-0
                  w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                  ${step.color} shadow-xl z-10
                  border-4 border-[#04011C]
                `}>
                  {React.cloneElement(step.icon, {
                    className: "w-5 h-5 sm:w-6 sm:h-6 text-white"
                  })}
                </div>

                {/* Step Content */}
                <div className="bg-[#2c1b4a] border border-[#8a4fff]/20 rounded-2xl p-4 sm:p-5 relative">
                  <h3 className="text-[16px] sm:text-lg font-semibold mb-2 sm:mb-3 text-[#8a4fff]">
                    {step.title}
                  </h3>
                  <p className="text-[14px] sm:text-base text-gray-300">
                    {step.description}
                  </p>
                  <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b] opacity-20">
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
