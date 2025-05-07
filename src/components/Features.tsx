import React from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, 
  Globe, 
  ShieldCheck, 
  Rocket, 
  Lock, 
  Wrench 
} from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: <Bot />,
      title: "Automated Withdrawal",
      description: "Advanced AI-driven withdrawal system with precision parameter control.",
      gradient: "from-[#6a3de3] to-[#2D1B4A]"
    },
    {
      icon: <Globe />,
      title: "Web-Native Platform",
      description: "Seamless browser-based solution, zero downloads or extensions required.",
      gradient: "from-[#6a3de3] to-[#2D1B4A]"
    },
    {
      icon: <ShieldCheck />,
      title: "CAPTCHA Intelligence",
      description: "Machine learning-powered CAPTCHA bypass for uninterrupted trading.",
      gradient: "from-[#6a3de3] to-[#2D1B4A]"
    },
    {
      icon: <Rocket />,
      title: "High-Performance Servers",
      description: "Ultra-low latency trading infrastructure with global edge networks.",
      gradient: "from-[#6a3de3] to-[#2D1B4A]"
    },
    {
      icon: <Lock />,
      title: "Privacy First",
      description: "Military-grade encryption and strict no-data-sharing policy.",
      gradient: "from-[#6a3de3] to-[#2D1B4A]"
    },
    {
      icon: <Wrench />,
      title: "Trader-Centric Design",
      description: "Custom-built WebSocket architecture for CSGORoll ecosystem.",
      gradient: "from-[#6a3de3] to-[#2D1B4A]"
    }
  ]

  return (
    <section 
      className="py-16 bg-[#04011C] pt-20"
      id="features"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-[28px] sm:text-4xl font-bold mb-4 
            text-transparent bg-clip-text 
            bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
            Advanced Trading Features
          </h2>
          <p className="text-[16px] sm:text-xl text-gray-400 max-w-2xl mx-auto">
            Cutting-edge technology designed to elevate your trading experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 1, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut" 
              }}
              viewport={{ once: true }}
              className={`
                bg-gradient-to-br ${feature.gradient} 
                rounded-2xl p-4 sm:p-6 
                transform transition-all duration-300 
                hover:scale-105 hover:shadow-2xl
                relative overflow-hidden
                group
              `}
            >
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              
              <div className="flex justify-center mb-3 sm:mb-4 relative z-10">
                {React.cloneElement(feature.icon, {
                  className: "w-8 h-8 sm:w-12 sm:h-12 text-white/90"
                })}
              </div>
              
              <h3 className="text-[16px] sm:text-xl font-semibold mb-2 sm:mb-4 text-center text-white relative z-10">
                {feature.title}
              </h3>
              
              <p className="text-[14px] text-sm lg:text-base text-white/80 text-center relative z-10">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
