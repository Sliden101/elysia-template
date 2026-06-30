'use client'

import { motion } from 'motion/react'
import { Trophy, Sparkles, Zap, Star } from 'lucide-react'
import Image from 'next/image'
import cfccLogo from "../assets/CFCC.png"

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-orange-500 flex items-center justify-center p-6">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
               
        <Image src={cfccLogo} alt="CFCC" />

        </motion.div>

        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.8 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0], y: [0, -10, 0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Trophy className="w-32 h-32 text-orange-400 fill-orange-400 drop-shadow-2xl mx-auto" />
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute -top-4 -right-4"
            >
              <Sparkles className="w-12 h-12 text-orange-300" />
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-2 -left-4"
            >
              <Star className="w-10 h-10 text-orange-300 fill-orange-300" />
            </motion.div>

            <motion.div
              animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 -left-8"
            >
              <Zap className="w-8 h-8 text-orange-200" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">
            Get Ready!
          </h1>
          <p className="text-2xl font-bold text-orange-200 mb-8">
            Loading your leaderboard...
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex justify-center gap-3"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                backgroundColor: ['#fed7aa', '#fb923c', '#fed7aa']
              }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
              className="w-4 h-4 rounded-full bg-orange-200"
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-12"
        >
          <div className="bg-white/20 backdrop-blur-sm rounded-3xl px-8 py-4 inline-block border-2 border-orange-300">
            <p className="text-white font-bold text-lg">
              🏆 Time to see who&apos;s on top!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
