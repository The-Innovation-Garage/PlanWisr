"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PartyPopper, Infinity, Brain, BarChart4, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Confetti from 'react-confetti'

export default function ProSuccessPage() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [runConfetti, setRunConfetti] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // FIX: Hide horizontal scrollbar on the body
    document.body.style.overflowX = 'hidden';

    const timer = setTimeout(() => {
      setRunConfetti(false);
    }, 6000);

    // Cleanup function to restore scrollbar
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      document.body.style.overflowX = 'auto';
    };
  }, []);

  const unlockedFeatures = [
    {
      icon: <Infinity className="w-5 h-5 text-primary" />,
      title: "Unlimited Projects",
    },
    {
      icon: <Brain className="w-5 h-5 text-primary" />,
      title: "AI Task Prioritization",
    },
    {
      icon: <BarChart4 className="w-5 h-5 text-primary" />,
      title: "Advanced Analytics",
    },
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      title: "500 AI Credits Monthly",
    }
  ]

  const handleContinue = () => {
    // Redirects to the dashboard with a full page reload
    window.location.href = '/dashboard';
  };

  return (
    // Removed `overflow-hidden` as it's now handled by the useEffect hook
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={runConfetti}
        numberOfPieces={runConfetti ? 200 : 0}
        gravity={0.1}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card className="w-full max-w-md shadow-2xl z-10">
          <CardHeader className="text-center items-center">
            <PartyPopper className="w-14 h-14 text-primary mb-4" />
            <CardTitle className="text-3xl font-bold">Congratulations!</CardTitle>
            <CardDescription className="text-md pt-1">
              You've successfully upgraded to PlanWisr Pro.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">You've unlocked:</h3>
              <ul className="space-y-3">
                {unlockedFeatures.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    {feature.icon}
                    <span className="font-medium">{feature.title}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              size="lg"
              className="w-full"
              onClick={handleContinue}
            >
              Continue to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}