
import { AuroraBackground } from "@/components/ui/aurora-background";
import { motion } from "framer-motion";
import LoanCalculator from "@/components/LoanCalculator";

const Index = () => {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4 w-full"
      >
        <div className="text-3xl md:text-7xl font-bold dark:text-white text-center">
          Loan Calculator
        </div>
        <div className="font-extralight text-base md:text-4xl dark:text-neutral-200 py-4">
          Understand your payments in seconds
        </div>
        <motion.button 
          className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-4 py-2 mb-8 hover:scale-105 transition-transform"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Calculating
        </motion.button>
        <LoanCalculator />
      </motion.div>
    </AuroraBackground>
  );
};

export default Index;
