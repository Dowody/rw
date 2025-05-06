import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [height, setHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0)
    }
  }, [isOpen])

  return (
    <div 
      className="bg-[#2c1b4a] rounded-xl mb-4 overflow-hidden transition-all duration-300 ease-in-out"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-5 text-left focus:outline-none hover:bg-[#3a2b5c] transition-colors"
      >
        <span className="text-lg font-semibold text-[#8a4fff]">{question}</span>
        <div 
          className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <ChevronDown className="text-[#8a4fff]" />
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
          className="p-5 text-gray-300"
        >
          {answer}
        </div>
      </div>
    </div>
  )
}

const FAQ = () => {
  const faqs = [
    {
      question: "What is RollWithdraw?",
      answer: "RollWithdraw is an advanced browser-based trading bot specifically designed for CSGORoll. Our platform provides automated withdrawal strategies, custom parameter configurations, and intelligent trading algorithms to maximize your trading potential."
    },
    {
      question: "How does the withdrawal bot work?",
      answer: "Our bot connects directly to your CSGORoll account, using advanced AI algorithms to execute trades based on your predefined parameters. You can customize withdrawal strategies, set price ranges, and manage risk levels with precision."
    },
    {
      question: "Is RollWithdraw secure?",
      answer: "Security is our top priority. We use military-grade encryption, implement strict privacy protocols, and ensure your account credentials are protected. Our system follows rigorous security standards to safeguard your trading activities."
    },
    {
      question: "What platforms are supported?",
      answer: "Currently, RollWithdraw is optimized for CSGORoll. We are continuously expanding our platform support and welcome user feedback for future integrations."
    },
    {
      question: "What pricing options are available?",
      answer: "We offer flexible pricing tiers to suit different trading needs. Our plans range from basic daily case collectors (starting at €249.99) to advanced withdrawal bots with comprehensive features, with premium options up to €2,399.99."
    },
    {
      question: "Can I customize the bot's settings?",
      answer: "Absolutely! RollWithdraw provides extensive customization options. You can set minimum/maximum item prices, define markup percentages, configure trading strategies, and fine-tune risk management parameters to match your unique trading style."
    },
    {
      question: "Do you offer a trial or money-back guarantee?",
      answer: "We provide a 7-day trial for our premium plans, allowing you to experience the full capabilities of RollWithdraw. Additionally, we offer a 30-day money-back guarantee to ensure your complete satisfaction with our service."
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
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem 
              key={index} 
              question={faq.question} 
              answer={faq.answer} 
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQ
