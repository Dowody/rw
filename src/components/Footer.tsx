import React from 'react'
import { 
  Gamepad2, 
  ShieldCheck, 
  BookOpen, 
  Lock, 
  Send,
  Mail,
  Server,
  CreditCard
} from 'lucide-react'
import { 
  SiBitcoin, 
  SiEthereum, 
  SiTether,
  SiDiscord,
  SiGithub 
} from 'react-icons/si'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Footer = () => {
  const navigationLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#products" },
    { name: "Contact", href: "#contact" }
  ]

  const legalLinks = [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Refund Policy", href: "/refund" }
  ]

  const cryptoPayments = [
    { 
      icon: <SiBitcoin className="w-8 h-8 text-[#F7931A] transform rotate-[-12deg]" />, 
      name: "Bitcoin",
      code: "BTC"
    },
    { 
      icon: <SiEthereum className="w-8 h-8 text-[#627EEA]" />, 
      name: "Ethereum",
      code: "ETH"
    },
    { 
      icon: <SiTether className="w-8 h-8 text-[#26A17B]" />, 
      name: "Tether",
      code: "USDT"
    }
  ]

  return (
    <footer className="bg-[#1a0b2e] text-white py-16 relative overflow-hidden">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0415] via-[#1a0b2e] to-[#2c1b4a] opacity-70" />

      {/* Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-grid-slate-900/[0.04] 
          [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))]"></div>
      </div>


      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-5 gap-12">
          {/* Brand & Newsletter */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-6">
              <Gamepad2 className="text-[#8a4fff] mr-3 w-10 h-10" />
              <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8a4fff] to-[#5e3c9b]">
                RollWithdraw
              </h4>
            </div>
            <p className="text-gray-300 mb-6">
              Revolutionizing trading with intelligent, automated withdrawal solutions for CSGORoll enthusiasts.
            </p>
            
            {/* Newsletter Signup */}
            <div className="bg-[#2c1b4a] rounded-xl p-3 flex items-center">
              <Mail className="text-[#8a4fff] mr-3 w-6 h-6" />
              <input 
                type="email" 
                placeholder="Subscribe for updates" 
                className="bg-transparent text-white placeholder-gray-400 outline-none flex-grow"
              />
              <button className="bg-[#8a4fff] p-2 rounded-lg hover:bg-[#7a3ddf] transition-colors w-10">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-6 text-[#8a4fff] text-lg">Navigation</h4>
            <ul className="space-y-3">
              {navigationLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-300 hover:text-[#8a4fff] transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-6 text-[#8a4fff] text-lg">Legal</h4>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-gray-300 hover:text-[#8a4fff] transition-colors"
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
            <div className="mb-6">
              <h4 className="font-semibold mb-4 text-[#8a4fff] text-lg flex items-center">
                <Server className="mr-2 w-5 h-5" /> Community
              </h4>
              <a 
                href="https://discord.gg/rollwithdraw" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center bg-[#5865F2]/10 p-3 rounded-lg hover:bg-[#5865F2]/20 transition-colors"
              >
                <SiDiscord className="w-6 h-6 text-[#5865F2] mr-3" />
                <span className="text-gray-300">Join Our Discord</span>
              </a>
            </div>

            {/* Crypto Payments */}
            <div>
              <h4 className="font-semibold mb-4 text-[#8a4fff] text-lg flex items-center">
                <CreditCard className="mr-2 w-5 h-5" /> Payment Methods
              </h4>
              <div className="flex space-x-4">
                {cryptoPayments.map((crypto, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center group cursor-pointer"
                    title={`${crypto.name} (${crypto.code})`}
                  >
                    {crypto.icon}
                    <span className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {crypto.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Legal & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-500">
          <div className="flex space-x-6 mb-4 md:mb-0">
            {legalLinks.map((link, index) => (
              <Link 
                key={index}
                to={link.href} 
                className="hover:text-[#8a4fff] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="mt-4 md:mt-0">
            © {new Date().getFullYear()} RollWithdraw. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
