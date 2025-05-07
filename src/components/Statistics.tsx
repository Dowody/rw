import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Zap, TrendingUp, Coins, Target } from 'lucide-react'

const StatCard = ({ 
  icon, 
  label, 
  target, 
  initialValue 
}: { 
  icon: React.ReactNode, 
  label: string, 
  target: number, 
  initialValue: number 
}) => {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const cardRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let animationFrameId: number;
    const startTime = Date.now()
    const duration = 2000 // 2 seconds

    const animate = () => {
      const currentTime = Date.now()
      const progress = Math.min((currentTime - startTime) / duration, 1)
      
      const currentCount = Math.floor(
        initialValue + (target - initialValue) * progress
      )
      
      setCount(currentCount)

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    animate()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isVisible, target, initialValue])

  return (
    <motion.div 
      ref={cardRef}
      initial={{ opacity: 1, y: 50 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-[#2c1b4a] 
        rounded-xl p-6 text-center 
        transform transition-all duration-300 
        hover:scale-105 hover:shadow-2xl"
    >
      <div className="flex justify-center mb-4">
        {React.cloneElement(icon as React.ReactElement, {
          className: "w-12 h-12 text-[#8a4fff]"
        })}
      </div>
      <h3 className="text-lg text-gray-300 mb-2">{label}</h3>
      <p className="text-3xl font-bold text-[#8a4fff]">
        {count.toLocaleString()}+
      </p>
    </motion.div>
  )
}

const Statistics: React.FC = () => {
  const statsData = [
    { 
      icon: <Zap />,
      label: "Total Users", 
      target: 3100954, 
      initialValue: 2129337
    },
    { 
      icon: <TrendingUp />,
      label: "Rounds Played", 
      target: 2542190, 
      initialValue: 1992431
    },
    { 
      icon: <Coins />,
      label: "Coins Wagered", 
      target: 1129171, 
      initialValue: 99364
    },
    { 
      icon: <Target />,
      label: "Coins Earned", 
      target: 3100954, 
      initialValue: 2876674
    }
  ]

  return (
    <section 
      className="py-16 bg-[#04011C]"
      id="statistics"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 
            text-transparent bg-clip-text 
            bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
            Live Platform Statistics
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Real-time insights into our growing community and exciting trading activities
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <StatCard 
              key={index}
              icon={stat.icon}
              label={stat.label}
              target={stat.target}
              initialValue={stat.initialValue}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Statistics
