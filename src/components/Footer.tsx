import React from 'react'
import { 
  Gamepad2, 
  ShieldCheck, 
  BookOpen, 
  Lock, 
  Send,
  Mail,
  Server,
  CreditCard,
  ChevronRight,
  Star
} from 'lucide-react'
import { 
  SiEthereum, 
  SiTether,
  SiDiscord,
  SiGithub 
} from 'react-icons/si'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

// Add USDC Icon component
const UsdcIcon = ({ className }: { className?: string }) => (
  <img 
    src="https://icones.pro/wp-content/uploads/2024/04/blue-usdc-icon-symbol-logo.png"
    alt="USDC"
    className={className}
  />
)

const Footer = () => {
  const navigate = useNavigate()

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, scrollTo: string) => {
    e.preventDefault()
    const element = document.querySelector(scrollTo)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navigationLinks = [
    { name: 'Home', href: '#hero', scrollTo: '#hero' },
    { name: 'How It Works', href: '#how-it-works', scrollTo: '#how-it-works' },
    { name: 'Pricing', href: '#products', scrollTo: '#products' },
    { name: 'Refferals', href: '#refferals', scrollTo: '#refferals' },
    { name: 'FAQ', href: '#faq', scrollTo: '#faq' }
  ]

  const legalLinks = [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },

  ]

  const cryptoPayments = [
    { 
      icon: <UsdcIcon className="w-6 h-6 sm:w-8 sm:h-8" />, 
      name: "USDC",
      code: "USDC"
    },
    { 
      icon: <SiEthereum className="w-6 h-6 sm:w-8 sm:h-8 text-[#627EEA]" />, 
      name: "Ethereum",
      code: "ETH"
    },
    { 
      icon: <SiTether className="w-6 h-6 sm:w-8 sm:h-8 text-[#26A17B]" />, 
      name: "Tether",
      code: "USDT"
    }
  ]

  

  return (
    <footer className="bg-[#1a0b2e] text-white py-8 sm:py-16 relative overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0415] via-[#1a0b2e] to-[#2c1b4a] opacity-70" />

      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] 
          [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid md:grid-cols-5 gap-8 sm:gap-12">
          {/* Brand & Trustpilot Reviews */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-5">
              <img src="logo.png" alt="RollWithdraw Logo" className="w-10 h-10 sm:w-10 sm:h-10 md:w-12 md:h-12" />
              <span className="text-[24px] sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8a4fff] to-[#6E42DB]">
                RollWithdraw
              </span>
            </div>
            <p className="text-[14px] sm:text-base text-gray-300 mb-4 sm:mb-6">
              Revolutionizing trading with intelligent, automated withdrawal solutions for CSGORoll enthusiasts.
            </p>
            
            {/* Trustpilot Reviews Button */}
            <a 
              href="https://www.trustpilot.com/review/rollwithdraw.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#2c1b4a] rounded-xl p-2 sm:p-3 flex items-center hover:bg-[#3a2b5c] transition-colors"
            >
              <Star className="text-[#00DA8D] mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[14px] sm:text-base text-white flex-grow">
                Check Our Trustpilot Reviews
              </span>
              <div className="bg-[#00DA8D] p-1.5 sm:p-2 rounded-lg hover:bg-[#7a3ddf] transition-colors w-8 sm:w-10 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 sm:mb-6 text-[#8a4fff] text-[16px] sm:text-lg">Navigation</h4>
            <ul className="space-y-2 sm:space-y-3">
              {navigationLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    onClick={(e) => handleScroll(e, link.scrollTo)}
                    className="text-[14px] sm:text-base text-gray-300 hover:text-[#8a4fff] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4 sm:mb-6 text-[#8a4fff] text-[16px] sm:text-lg">Legal</h4>
            <ul className="space-y-2 sm:space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-[14px] sm:text-base text-gray-300 hover:text-[#8a4fff] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community & Payments */}
          <div>
            {/* Discord Community */}
            <div className="mb-4 sm:mb-6">
              <h4 className="font-semibold mb-3 sm:mb-4 text-[#8a4fff] text-[16px] sm:text-lg flex items-center">
                <Server className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Community
              </h4>
              <a 
                href="https://discord.gg/XxHsYT4m" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center bg-[#5865F2]/10 p-2 sm:p-3 rounded-lg hover:bg-[#5865F2]/20 transition-colors"
              >
                <SiDiscord className="w-5 h-5 sm:w-6 sm:h-6 text-[#5865F2] mr-2 sm:mr-3" />
                <span className="text-[14px] sm:text-base text-gray-300">Join Our Discord</span>
              </a>
            </div>

            {/* Crypto Payments */}
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-[#8a4fff] text-[16px] sm:text-lg flex items-center">
                <CreditCard className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> Payment Methods
              </h4>
              <div className="flex space-x-3 sm:space-x-4">
                {cryptoPayments.map((crypto, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center group cursor-pointer"
                    title={`${crypto.name} (${crypto.code})`}
                  >
                    {crypto.icon}
                    <span className="text-[10px] sm:text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {crypto.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-6 sm:my-8"></div>

        {/* Legal & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-500">
          <div className="flex space-x-4 sm:space-x-6 mb-4 md:mb-0">
            {legalLinks.map((link, index) => (
              <Link 
                key={index}
                to={link.href} 
                className="text-[12px] sm:text-sm hover:text-[#8a4fff] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="text-[12px] sm:text-sm mt-4 md:mt-0">
            © {new Date().getFullYear()} RollWithdraw. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
