import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Zap, Shield, Globe, Cpu } from 'lucide-react';
import VideoPlayer from './VideoPlayer';

interface SynapseHeroProps {
  children?: React.ReactNode;
  headline?: React.ReactNode;
  subtext?: React.ReactNode;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const marqueeLogos = [
  { name: 'Google', icon: <Globe className="w-6 h-6" /> },
  { name: 'Nvidia', icon: <Cpu className="w-6 h-6" /> },
  { name: 'OpenAI', icon: <Sparkles className="w-6 h-6" /> },
  { name: 'Microsoft', icon: <Zap className="w-6 h-6" /> },
  { name: 'Meta', icon: <Shield className="w-6 h-6" /> },
  { name: 'Apple', icon: <Globe className="w-6 h-6" /> },
];

const SynapseHero: React.FC<SynapseHeroProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-white overflow-hidden font-sans flex items-center justify-center">
      {/* Background Video */}
      <div className="absolute top-0 right-0 w-full h-full opacity-40 z-0 select-none pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
        <VideoPlayer 
          src="https://customer-v6m97o2uncl96898.cloudflarestream.com/669d04588df857313054cfcb2514ddb0/manifest/video.m3u8"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Top Left Branding */}
      <div className="absolute top-8 left-8 z-50">
        <span className="text-xl font-bold tracking-tighter text-white uppercase italic opacity-40">Synapse</span>
      </div>

      {/* Centered Content */}
      <motion.div 
        className="relative z-10 w-full max-w-5xl px-8 py-20 flex flex-col items-center text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SynapseHero;
