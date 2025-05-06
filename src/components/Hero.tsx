import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gamepad2, Code, Zap, Target, Check, Star } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const TradeSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  
  const tradeItems = [
    {
      name: "★ M9 Bayonet ★ ",
      type: "Tiger Tooth",
      condition: "FN",
      price: "1,553.43",
      image: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-KmcjgOrzUhFRe-sR_jez--YXygED6_0Y-Ym-icoORcVA9NFuF81W2k7i-g5G96ZucyXViuCEh7XuOnkPjiAYMMLKWpdxQng/360fx360f"
    },
    {
      name: "★ Karambit ★ ",
      type: "Marble Fade", 
      condition: "FN",
      price: "2,104.05",
      image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20mvbmMbfUqW1Q7MBOhuDG_Zi7jQGw-xVoZGigd4LEI1I2NQyE_ATqlOrtjMfq6ZWanXA3siBx5CyLnQv3309Lv_QKkg"
    },
    {
      name: "★ Butterfly ★ ",
      type: "Gamma Doppler", 
      condition: "FN",
      price: "4,081.21",
      image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_knife_butterfly_am_emerald_marbleized_light_large.92ea85ebc4ef4af38ea480c332353a31ec8947fd.png"
    },
    {
      name: "★ AWP ★ ",
      type: "Dragon Lore", 
      condition: "FN",
      price: "18,233.62",
      image: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17P7NdTRH-t26q4SZlvD7PYTQgXtu5Mx2gv2PrdSijAWwqkVtN272JIGdJw46YVrYqVO3xLy-gJC9u5vByCBh6ygi7WGdwUKTYdRD8A/360fx360f"
    },
    {
      name: "★ M4A4 ★ ",
      type: "Howl", 
      condition: "FN",
      price: "3,291.01",
      image: "https://lh7-rt.googleusercontent.com/docsz/AD_4nXcD2tVnFdKh_aUUxo7wAdHUHiFV3xWRFu6WCmo3_7q3MFrgI5s9ZviTiyiS-Km2dwKvn24-MdJpljy_lQMPB6_PKRw_ElR8chA767Ckk1Kw-ZBsmdXHmYar4YUCouq-HEvuE3VCroXQGG6oAzMTBACP9OTD=w1200-h630-p-k-no-nu?key=ywbVHT2wtlimK55UlFtvlQ"
    }
  ]

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % tradeItems.length)
    }, 5000)

    return () => clearInterval(slideInterval)
  }, [tradeItems.length])

  return (
    <div className="relative w-full max-w-md mx-auto overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentSlide}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ 
            type: "tween",
            duration: 0.5
          }}
          className="flex flex-col items-center text-center"
        >
          <div className="w-64 h-64 mb-4 flex items-center justify-center">
            <motion.img 
              src={tradeItems[currentSlide].image} 
              alt={tradeItems[currentSlide].name} 
              className="max-w-full max-h-full object-contain 
                transform transition-transform duration-300 
                hover:scale-110"
            />
          </div>
          
          <div>
            <p className="text-sm text-gray-400 uppercase tracking-wider">
              {tradeItems[currentSlide].condition}
            </p>
            <h3 className="text-2xl font-bold text-white mb-1">
              {tradeItems[currentSlide].name}
            </h3>
            <p className="text-lg text-gray-300 mb-2">
              {tradeItems[currentSlide].type}
            </p>
            <p className="text-2xl font-bold text-[#8a4fff]">
              ${tradeItems[currentSlide].price}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

const Hero: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleGetStarted = () => {
    if (location.pathname === '/') {
      const section = document.querySelector('#products')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      navigate('/', {
        state: {
          scrollTo: '#products',
          timestamp: Date.now()
        }
      })
    }
  }

  const handleLearnMoreClick = () => {
    if (location.pathname === '/') {
      const section = document.querySelector('#how-it-works')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } else {
      navigate('/', {
        state: {
          scrollTo: '#how-it-works',
          timestamp: Date.now()
        }
      })
    }
  }

  const features = [
    {
      icon: <Star className="w-6 h-6" />,
      title: "Unlimited Use",
      description: "No Withdrawal Limits"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Advanced Algorithms",
      description: "AI-powered trading strategies"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "High-Speed Execution",
      description: "Millisecond-level trade precision"
    }
    
  ]

  return (
    <section 
      className="relative  flex items-center justify-center overflow-hidden lg:h-[100vh]"
      id='hero'
    >
     {/* Background Image */}
<div className="absolute inset-0">
  <div
    style={{
      backgroundImage: 'url(/hero_bg.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      width: '100%',
      height: '100%',
      opacity: 1,
    }}
  />
  
  Black Overlay
  <div
    style={{
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // adjust opacity as needed
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}
  />
</div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0415] via-[#1a0b2e] to-[#2c1b4a] opacity-70" />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] 
          [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]"></div>
      </div>

      {/* Glowing Accent */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: [0.2, 0.4, 0.2],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="absolute top-[1200px]  lg:top-1/2 lg:right-[320px] transform -translate-y-1/2 
        w-[500px] h-[500px] bg-[#8a4fff] rounded-full opacity-10 blur-3xl"
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: 0, y: 0 }}
            animate={{ opacity: 1, x: 0, y:0 }}
            transition={{ duration: 0.1 }}
            className="text-center md:text-left"
          >
            <h1 className="text-5xl pt-32 md:text-6xl font-bold text-white mb-6 leading-tight lg:pt-0">
              Intelligent <br />
              <span className="text-transparent bg-clip-text 
                bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
                Withdrawal Bot
              </span>
            </h1>
            
            <p className="text-lg text-gray-300 max-w-xl mb-10 leading-relaxed">
              Revolutionize your trading with cutting-edge AI-driven withdrawal strategies 
              designed for maximum efficiency and precision.
            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.2,
                    duration: 0.6
                  }}
                  className="bg-[#2c1b4a]/50 backdrop-blur-sm p-4 rounded-lg 
                  flex flex-col items-center text-center border border-[#8a4fff]/20 
                  hover:border-[#8a4fff]/50 transition-all"
                >
                  <div className="mb-3 text-[#8a4fff]">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 
              justify-center md:justify-start">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="bg-[#8a4fff] text-white px-10 w-full sm:w-80 py-5 
                  rounded-lg hover:bg-[#7a3ddf] flex items-center justify-center 
                  transform transition-transform duration-300 text-lg 
                  relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-white opacity-0 
                  group-hover:opacity-10 transition-opacity"></span>
                <Gamepad2 className="mr-3 w-6 h-6" /> Get Started
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLearnMoreClick}
                className="bg-transparent w-full sm:w-80 border border-[#8a4fff] 
                  text-[#8a4fff] px-10 py-5 rounded-lg 
                  hover:bg-[#8a4fff]/10 flex items-center justify-center 
                  transform transition-transform duration-300 text-lg"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>

          {/* Right Side - Trade Slider */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden md:flex justify-center items-center"
          >
            <TradeSlider />
          </motion.div>
        </div>

        {/* Mobile Trade Slider */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto md:hidden mb-12"
        >
          <TradeSlider />
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
