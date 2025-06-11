"use client"

import { motion } from "framer-motion"
import { CheckCircle, Zap, Infinity, Brain, BarChart4, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function ProPage() {
  const router = useRouter()

  const features = [
    {
      icon: <Infinity className="w-6 h-6 text-primary" />,
      title: "Unlimited Projects",
      description: "Create and manage as many projects as you need without any restrictions."
    },
    {
      icon: <Brain className="w-6 h-6 text-primary" />,
      title: "AI Task Prioritization",
      description: "Let our AI help you prioritize tasks for maximum productivity and efficiency."
    },
    {
      icon: <BarChart4 className="w-6 h-6 text-primary" />,
      title: "Advanced Analytics",
      description: "Gain deeper insights into your productivity with detailed reports and trends."
    },
    {
      icon: <Clock className="w-6 h-6 text-primary" />,
      title: "500 AI Credits Monthly",
      description: "Get more AI-powered features with increased monthly credits."
    }
  ]

  const handleBuySubscription = () => {

    window.openPocketsflowCheckout({
      type: "subscription",
      subscriptionId: "68499ec889fe16276c40b820",
      subdomain: "psychocoder",
      isDarkMode: true,
      onSuccess: (data) => {
        console.log("success", data);
      }
    });

  }

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold tracking-tighter sm:text-5xl"
          >
            Upgrade to Pro
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-[700px] text-muted-foreground"
          >
            Take your productivity to the next level with advanced features and unlimited access.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 3) }}
              className="flex flex-col items-center p-6 bg-card rounded-xl border shadow-sm"
            >
              <div className="p-3 bg-primary/10 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground text-center">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-[400px] py-10 mx-auto bg-card border rounded-xl p-8 text-center"
        >
          <div className="mb-4">
            <span className="text-3xl font-bold">$15</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>All Free Plan Features</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Unlimited Projects</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>AI Task Prioritization</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>Advanced Analytics</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <span>500 AI Credits Monthly</span>
            </li>
          </ul>

          <Button size="lg"
            className="w-full bg-primary hover:bg-primary/90" onClick={handleBuySubscription}>
            Buy Subscription
          </Button>

        </motion.div>
      </div>
    </div >
  )
}