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
    },
    {
      name: "★ StatTrak™ M9 Bayonet ★",
      type: "Crimson Web",
      condition: "FN",
      price: "3,764.50",
      image: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czxb49KzgL-DjsjjNrnCqWdY781lxLqWptvx2w3nr0s5Nj_7dY6VdlM4aQvU8lC2xe7ph5C66Z_AyyEy7iE8pSGKRb-3fB0/360fx360f"
    },
    {
      name: "★ Desert Eagle ★",
      type: "Blaze",
      condition: "FN",
      price: "1,293.45",
      image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_deagle_aa_flames_light_large.dd140c3b359c16ccd8e918ca6ad0b2628151fe1c.png"
    },
    {
      name: "★ AK-47 ★",
      type: "Fire Serpent",
      condition: "FN",
      price: "7,112.67",
      image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_ak47_cu_fireserpent_ak47_bravo_light_large.9390e7fd091ea8a0434fd2143e0acf0d5d1bbc97.png"
    },
    {
      name: "★ Butterfly Knife ★",
      type: "Fade",
      condition: "FN",
      price: "5,231.80",
      image: "https://steamcdn-a.akamaihd.net/apps/730/icons/econ/default_generated/weapon_knife_butterfly_aa_fade_light_large.b1ab5fb3ed08185a266334b6488a364bb3f220f8.png"
    },
    {
      name: "★ Gut Knife ★",
      type: "Slaughter",
      condition: "FN",
      price: "2,500.00",
      image: "https://community.fastly.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1ObcTjxP08azlpKKqPv9NLPF2DwGupYjju-Q8dyl2A2x_RBqaz_wINedIQNoMAnY81Tsw-zojJO6uMzXiSw0TBKzcR8/360fx360f"
    },
    {
      name: "★ Bowie Knife ★",
      type: "Forest DDPAT",
      condition: "FN",
      price: "2,030.15",
      image: "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwObaZzRU7dCJlo-cnvLLO6Lukm9B6dFOhuDG_Zi73AW3rkI4Yz37Jo_HJlBrYlHY8lPvyershZK57Z-YwHZj7nEktyrVyQv3309AwMWh8A"
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
          initial={{ x: '600%', opacity: 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-600%'}}
          transition={{ duration: 0.5 }}
          className="feather-mask flex flex-col items-center text-center"
        >
          <div className="w-48 h-48 sm:w-64 sm:h-64 mb-3 sm:mb-4 flex items-center justify-center">
            <motion.img 
              src={tradeItems[currentSlide].image} 
              alt={tradeItems[currentSlide].name} 
              className="max-w-full max-h-full object-contain 
                transform transition-transform duration-300 
                hover:scale-110"
            />
          </div>
          
          <div>
            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">
              {tradeItems[currentSlide].condition}
            </p>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">
              {tradeItems[currentSlide].name}
            </h3>
            <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-2">
              {tradeItems[currentSlide].type}
            </p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#8a4fff]">
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
      title: "Automated Withdrawals",
      description: "Scripted for effortless withdrawals"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "High-Speed Execution",
      description: "Instant CSGORoll transactions"
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
      backgroundImage: 'url(/rw/hero_bg.jpg)',
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
        initial={{ opacity: 1 }}
        animate={{ 
          opacity: [0.2, 0.4, 0.2],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="absolute top-[1000px]  lg:top-1/2 lg:right-[300px] transform -translate-y-1/2 
        w-[500px] h-[500px] bg-[#8a4fff] rounded-full opacity-10 blur-3xl"
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 1, x: 0, y: 0 }}
            animate={{ opacity: 1, x: 0, y:0 }}
            transition={{ duration: 0.1 }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 mt-10 sm:mb-6 leading-tight pt-16 sm:pt-32 lg:pt-0">
              Intelligent <br />
              <span className="text-transparent bg-clip-text 
                bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
                Withdrawal Bot
              </span>
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-xl mb-6 sm:mb-10 leading-relaxed">
            Revolutionize your trading with our CSGORoll Withdraw Bot designed for maximum efficiency and precision.            </p>
            
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-10">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 1, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: index * 0.1,
                    duration: 0.2,
                    ease: "easeInOut"
                  }}
                  className="bg-[#2c1b4a]/50 backdrop-blur-sm p-3 sm:p-4 rounded-lg 
                  flex flex-col items-center text-center border border-[#8a4fff]/20 
                  hover:border-[#8a4fff]/50 transition-all"
                >
                  <div className="mb-2 sm:mb-3 text-[#8a4fff]">
                    {React.cloneElement(feature.icon, {
                      className: "w-4 h-4 sm:w-5 sm:h-5"
                    })}
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-white mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-300">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 md:space-x-6 
              justify-center md:justify-start">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGetStarted}
                className="bg-[#8a4fff] text-white px-6 sm:px-10 w-full sm:w-80 py-3 sm:py-5 
                  rounded-lg hover:bg-[#7a3ddf] flex items-center justify-center 
                  transform transition-transform duration-300 text-sm sm:text-base md:text-lg 
                  relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-white opacity-0 
                  group-hover:opacity-10 transition-opacity"></span>
                <Gamepad2 className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5" /> Get Started
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLearnMoreClick}
                className="bg-transparent w-full sm:w-80 border border-[#8a4fff] 
                  text-[#8a4fff] px-6 sm:px-10 py-3 sm:py-5 rounded-lg 
                  hover:bg-[#8a4fff]/10 flex items-center justify-center 
                  transform transition-transform duration-300 text-sm sm:text-base md:text-lg"
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>

          {/* Right Side - Trade Slider */}
          <motion.div 
            initial={{ opacity: 1, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="feather-mask hidden md:flex justify-center items-center"
          >
            <TradeSlider />
          </motion.div>
        </div>

        {/* Mobile Trade Slider */}
        <motion.div 
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="feather-mask max-w-xl mx-auto md:hidden mb-8 sm:mb-12"
        >
          <TradeSlider />
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
