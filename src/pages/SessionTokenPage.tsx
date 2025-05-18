import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Copy, CheckCircle, AlertTriangle, ChevronRight, ExternalLink, Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SiTradingview, SiSteam } from 'react-icons/si';

const SessionTokenPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const steps = [
    {
      title: "Open Developer Tools",
      description: "Right-click anywhere on the CSGORoll website, then click on 'Inspect'.",
      image: "img1.jpeg",
      alt: "Right-click menu showing Inspect option",
      link: "https://csgoroll.com"
    },
    {
      title: "Navigate to Application Tab",
      description: "In the tabs at the top, click on the arrows and go to the 'Application' tab.",
      image: "img2.jpeg",
      alt: "Developer tools showing Application tab"
    },
    {
      title: "Access Cookies",
      description: "In the left sidebar, click on 'Cookies' to expand it, then select 'https://csgoroll.com' from the list.",
      image: "img3.jpeg",
      alt: "Cookies section in Application tab"
    },
    {
      title: "Get Session Token",
      description: "Refresh the website, then find the row labeled 'session' on the right side, then click on it and copy the value shown.",
      image: "img4.jpeg",
      alt: "Session token value in cookies"
    }
  ];

  const paymentOptions = [
    {
      id: 1,
      name: "Skin Payment",
      type: "skin",
      icon: <SiTradingview className="w-6 h-6 text-[#1E73A4]" />
    },
    {
      id: 2,
      name: "Steam Payment",
      type: "steam",
      icon: <SiSteam className="w-6 h-6 text-blue-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#04011C] relative overflow-hidden pt-10">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#8a4fff]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#6a2dcf]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 1, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#8a4fff]/10 rounded-full text-[#8a4fff] text-sm mb-6">
            <Shield className="w-4 h-4" />
            <span>Session Token Guide</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Get Your Session Token
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Follow these simple steps to get your session token from CSGORoll. This token is required for the bot to function properly.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            {steps.map((_, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={() => setActiveStep(index)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    index === activeStep
                      ? 'bg-[#8a4fff] text-white scale-110'
                      : index < activeStep
                      ? 'bg-[#8a4fff]/20 text-[#8a4fff]'
                      : 'bg-[#1a0b2e] text-gray-400'
                  }`}
                >
                  {index + 1}
                </button>
                {index < steps.length - 1 && (
                  <div className="w-12 h-0.5 bg-[#1a0b2e]">
                    <motion.div
                      className="h-full bg-[#8a4fff]"
                      initial={{ width: 0 }}
                      animate={{ width: index < activeStep ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Steps */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 1, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 1, x: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-[#1a0b2e]/50 backdrop-blur-xl rounded-2xl border border-[#8a4fff]/10 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#8a4fff]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-[#8a4fff]">
                      {activeStep + 1}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                      {steps[activeStep].title}
                    </h2>
                    <p className="text-gray-400 mb-4">
                      {steps[activeStep].description}
                    </p>
                    {steps[activeStep].link && (
                      <a
                        href={steps[activeStep].link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#8a4fff]/10 text-[#8a4fff] rounded-lg hover:bg-[#8a4fff]/20 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open CSGORoll
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeStep === 0
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Previous
              </button>
              <button
                onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                disabled={activeStep === steps.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeStep === steps.length - 1
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 1, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 1, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-2xl overflow-hidden border border-[#8a4fff]/20 bg-[#1a0b2e]"
              >
                <img
                  src={steps[activeStep].image}
                  alt={steps[activeStep].alt}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a0b2e] to-transparent opacity-50" />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Important Notes */}
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-[#1a0b2e]/50 backdrop-blur-xl rounded-2xl border border-[#8a4fff]/10 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold text-white">Important Information</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: "Account Required",
                description: "Make sure you're logged into your CSGORoll account before following these steps.",
                icon: CheckCircle
              },
              {
                title: "Keep it Private",
                description: "The session token is sensitive information. Never share it with anyone.",
                icon: Shield
              },
              {
                title: "Token Expiration",
                description: "Session tokens expire after approximately 24 hours. You'll need to get a new token if you log out or if your session expires.",
                icon: AlertTriangle
              },
              {
                title: "Regular Updates",
                description: "For optimal performance, it's recommended to update your session token regularly, especially after 24 hours.",
                icon: Lock
              }
            ].map((note, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 1, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-start gap-3 p-4 bg-[#8a4fff]/5 rounded-xl"
              >
                <div className="w-8 h-8 rounded-lg bg-[#8a4fff]/10 flex items-center justify-center flex-shrink-0">
                  <note.icon className="w-4 h-4 text-[#8a4fff]" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">{note.title}</h4>
                  <p className="text-gray-400 text-sm">{note.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => navigate('/dashboard', { state: { section: 'purchases' } })}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#8a4fff] text-white rounded-lg hover:bg-[#7a3fff] transition-colors"
          >
            Continue to Bot Configuration
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>

        
      </div>
    </div>
  );
};

export default SessionTokenPage; 