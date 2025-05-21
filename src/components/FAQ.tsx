import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQItem = ({ question, answer, isOpen, onToggle }: { 
  question: string, 
  answer: string, 
  isOpen: boolean, 
  onToggle: () => void 
}) => {
  const [height, setHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0)
    }
  }, [isOpen])

  // Format the answer with proper line breaks and bullet points
  const formatAnswer = (text: string) => {
    return text.split('\n').map((line, index) => {
      if (line.trim().startsWith('•')) {
        return (
          <div key={index} className="flex items-start mb-2">
            <span className="mr-2">•</span>
            <span>{line.substring(1).trim()}</span>
          </div>
        )
      }
      if (line.trim().match(/^\d+\./)) {
        return (
          <div key={index} className="flex items-start mb-2">
            <span className="mr-2">{line.split('.')[0]}.</span>
            <span>{line.split('.').slice(1).join('.').trim()}</span>
          </div>
        )
      }
      return <div key={index} className="mb-2">{line}</div>
    })
  }

  return (
    <div 
      className="bg-[#2c1b4a] rounded-xl mb-3 sm:mb-4 overflow-hidden transition-all duration-300 ease-in-out"
    >
      <button 
        onClick={onToggle}
        className="w-full flex justify-between items-center p-3 sm:p-5 text-left focus:outline-none hover:bg-[#3a2b5c] transition-colors"
      >
        <span className="text-[16px] sm:text-lg text-[#8a4fff] mr-4">{question}</span>
        <div 
          className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#8a4fff]" />
        </div>
      </button>
      
      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ 
          height: `${height}px`,
          opacity: height > 0 ? 1 : 0
        }}
      >
        <div 
          ref={contentRef} 
          className="p-3 sm:p-5 text-[14px] sm:text-base text-gray-300"
        >
          {formatAnswer(answer)}
        </div>
      </div>
    </div>
  )
}

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  const faqs = [
    {
      question: "What is RollWithdraw?",
      answer: "RollWithdraw is an advanced browser-based trading bot specifically designed for CSGORoll. Our platform provides:\n\n• Automated withdrawal strategies\n• Custom parameter configurations\n• Intelligent trading algorithms\n\nAll designed to maximize your trading potential."
    },
    {
      question: "How do I update or change my trading parameters on RollWithdraw?",
      answer: "Updating your trading parameters is straightforward:\n\n1. Access your RollWithdraw configuration page\n2. Adjust your settings as needed\n3. Save your changes\n\nThe bot will automatically apply your new parameters."
    },
    {
      question: "What platforms are supported?",
      answer: "Currently, RollWithdraw is optimized only for CSGORoll. We focus on providing the best possible experience for CSGORoll users."
    },
    {
      question: "What makes RollWithdraw different from other CS2 trading bots?",
      answer: "RollWithdraw stands out with these unique features:\n\n• Unlimited withdrawals\n• Sticker-craft bot functionality\n• Competitive pricing\n• Integrated high-speed servers"
    },
    {
      question: "Do I need to use a VPS with RollWithdraw?",
      answer: "No, you don't need a VPS. We have our own high-speed servers already integrated with the bot, making it ready to use immediately after configuration."
    },
    {
      question: "Do I have to withdraw a skin from the marketplace every hour?",
      answer: "Yes, this is required because:\n\n• It's a protection feature from CSGORoll\n• We cannot bypass this requirement\n• You need to withdraw a skin every 30 minutes\n\nWhile we handle most CAPTCHA challenges, this hourly withdrawal is mandatory."
    },
    {
      question: "Is there a RollWithdraw community somewhere with more information?",
      answer: "Yes! Join our community:\n\n• Click the \"Join Discord\" button on our website\n• Connect with other users\n• Get support and updates\n• Share experiences and tips"
    },
    {
      question: "Can I get a free trial before purchasing a licence?",
      answer: "Yes! We offer:\n\n• 1 day free trial\n• Full access to all features\n• No restrictions during trial\n• Experience all capabilities before purchasing"
    },
    {
      question: "Is this service limited?",
      answer: "Yes, we maintain service quality through:\n\n• Limited number of active licenses\n• Priority for existing premium users\n• License extension options for active users\n• New licenses may be out of stock when limit is reached"
    },
    {
      question: "How can I snipe expensive sticker crafts?",
      answer: "To access sticker craft sniping:\n\n• Available exclusively with 12-month subscription\n• Includes both regular withdraw bot and sticker craft bot\n• Set minimum applied sticker value\n• Bot will only pick items matching your value criteria\n\nThis feature helps you focus on high-value sticker crafts."
    }
  ]

  return (
    <section 
      id="faq" 
      className="py-16"
      style={{
        backgroundColor: '#04011C'
      }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-[28px] sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index} 
              question={faq.question} 
              answer={faq.answer}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
