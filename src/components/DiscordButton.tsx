import React from 'react';
import { motion } from 'framer-motion';
import { SiDiscord } from 'react-icons/si';

interface DiscordButtonProps {
  inviteLink?: string;
}

export default function DiscordButton({ 
  inviteLink = 'https://discord.gg/XxHsYT4m'
}: DiscordButtonProps) {
  const handleDiscordClick = () => {
    try {
      window.open(inviteLink, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Discord button error:', error);
      alert('Unable to open Discord. Please try again.');
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleDiscordClick}
      className="fixed bottom-20 right-4 md:bottom-20 md:right-4 bg-[#5865F2] text-white w-14 h-14 md:w-14 md:h-14 rounded-full shadow-2xl z-50 transition-all duration-200 flex items-center justify-center"
    >
      <SiDiscord className="w-8 h-8 md:w-8 md:h-8" />
    </motion.button>
  );
} 