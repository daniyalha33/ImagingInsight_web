import { motion } from 'motion/react';
import { Activity } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-white flex items-center justify-center pt-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30"
        >
          <Activity className="w-10 h-10 text-white" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-blue-900"
        >
          Imaging Insight
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-1.5"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15
              }}
              className="w-2 h-2 bg-blue-600 rounded-full"
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
