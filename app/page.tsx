"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Check, ArrowRight, Star, Zap, Shield, Users, BarChart, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import {
  FolderKanban,
  CheckCircle,
  Timer,
  CalendarClock,
  BellRing,
  BarChart2,
  Smartphone
} from "lucide-react";


export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const features = [
    {
      icon: <FolderKanban className="text-primary w-6 h-6" />,
      title: "Project Management",
      description: "Create and organize unlimited projects, assign tasks, and define milestones in a clean visual layout."
    },
    {
      icon: <CheckCircle className="text-primary w-6 h-6" />,
      title: "Smart Task Tracking",
      description: "Prioritize tasks, set due dates, and track status with AI-generated suggestions and auto-updates."
    },
    {
      icon: <Timer className="text-primary w-6 h-6" />,
      title: "Time Tracking",
      description: "Automatically track how much time you spend on each task to improve productivity and focus."
    },
    {
      icon: <CalendarClock className="text-primary w-6 h-6" />,
      title: "AI-Powered Scheduling",
      description: "Our AI recommends optimal time slots for your tasks based on urgency, deadlines, and past habits."
    },
    {
      icon: <BellRing className="text-primary w-6 h-6" />,
      title: "Sync & Smart Reminders",
      description: "Stay on track with real-time sync across devices and intelligent reminders before important tasks."
    },
    {
      icon: <BarChart2 className="text-primary w-6 h-6" />,
      title: "Progress Insights",
      description: "Gain visual insights into your time usage, task completion, and productivity trends over time."
    },
    {
      icon: <Users className="text-primary w-6 h-6" />,
      title: "Team Collaboration (Coming Soon)",
      description: "Invite team members, assign roles, and collaborate on projects with seamless updates and comments."
    },
    {
      icon: <Smartphone className="text-primary w-6 h-6" />,
      title: "Mobile App (Upcoming)",
      description: "Take Planwise on the go with our sleek mobile app — manage tasks from anywhere, anytime."
    }
  ];

  const getPlans = () => {
    const plans = [
      {
        name: "Free Plan",
        price: 0,
        description: "Perfect for individuals and freelancers starting out.",
        features: [
          "Project management (up to 5 projects)",
          "Time tracking for each project",
          "Basic analytics for overall performance",
          "50 AI credits per month"
        ],
        link: "/signup",
        cta: "Get Started for Free",
      },
      {
        name: "Paid Plan",
        price: 15,
        description: "Ideal for growing teams and businesses.",
        features: [
          "All Free Plan features",
          "Unlimited project creation",
          "Smart AI task prioritization",
          "Advanced analytics for deeper insights",
          "500 AI credits per month",
        ],
        cta: "Buy Now",
        link: "/pro",
        popular: true,
      },
    ];
    return plans;
  };



  return (
    <div className="flex min-h-[100dvh] flex-col">

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pb-10 w-full bg-white dark:bg-black relative overflow-hidden">
          <div className="container mx-auto px-6 md:px-10 relative z-10">
            {/* Background Grid overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"
            ></div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <Badge
                className="mt-5 inline-block mb-5 rounded-full bg-white text-black px-5 py-1.5 font-semibold tracking-wide text-sm shadow-md"
                variant="secondary"
              >
                🧠 Powered by AI
              </Badge>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text mb-8">
                One Dashboard to Manage Everything You Build
              </h1>

              <p className="text-lg md:text-l max-w-3xl mx-auto text-gray-500 dark:text-gray-300 mb-12 leading-relaxed">
                Whether you're a freelancer, indie hacker, or entrepreneur — Effinova brings your projects, tasks, time, and finances into one clean, AI-powered workspace. Build smarter. Stay focused. Grow faster.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-md mx-auto">
                <Button
                  size="lg"
                  className="group rounded-full h-14 px-10 text-base font-semibold bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800
                    shadow-lg hover:shadow-xl hover:scale-[1.05] transform transition duration-400 ease-out text-white flex items-center justify-center"
                >
                  Get Started
                  <span className="ml-3 w-5 h-5 transition-transform duration-400 ease-out group-hover:translate-x-2 will-change-transform">
                    <ArrowRight />
                  </span>
                </Button>

                {/* <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-14 px-10 text-base font-semibold border-indigo-600 text-indigo-600
                    hover:bg-indigo-600 hover:text-white shadow-md hover:shadow-lg hover:scale-[1.05] transform transition duration-300 ease-in-out"
                >
                  Book a Demo
                </Button> */}
              </div>

              <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {[
                  "Built for productivity",
                  "Designed to help you scale",
                  "Your workflow, finally unified"
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-indigo-600 animate-pulse-slow" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>



          </div>
        </section>


        {/* Logos Section */}
        {/* <section className="w-full py-12 border-y bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <p className="text-sm font-medium text-muted-foreground">Trusted by innovative companies worldwide</p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Image
                    key={i}
                    src={`/placeholder-logo.svg`}
                    alt={`Company logo ${i}`}
                    width={120}
                    height={60}
                    className="h-8 w-auto opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                  />
                ))}
              </div>
            </div>
          </div>
        </section> */}

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Badge
                  className="group rounded-full px-4 py-1.5 text-sm font-medium bg-primary/90 text-white hover:text-black dark:hover:text-white shadow-md"
                  variant="secondary"
                >
                  <CheckCircle className="mr-2 h-4 w-4 group-hover:text-black dark:group-hover:text-white" />
                  Core Features
                </Badge>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-lg">
                Smart Tools for Smarter Work
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Effinova combines intelligent automation, sleek UI, and powerful insights to help you stay organized and perform at your peak.
              </p>
            </motion.div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2"
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full overflow-hidden border-border/40 bg-white/60 dark:bg-background/80 backdrop-blur-md transition-all hover:shadow-xl">
                    <CardContent className="p-6 flex flex-row gap-4 items-start">
                      <div className="min-w-[40px] mt-1">{feature.icon}</div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </section>


        {/* How It Works Section */}
        <section className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Badge
                  className="group rounded-full px-4 py-1.5 text-sm font-medium bg-primary/90 text-white hover:text-black dark:hover:text-white shadow-md"
                  variant="secondary"
                >
                  <CalendarClock className="mr-2 h-4 w-4 group-hover:text-black dark:group-hover:text-white" />
                  How it works
                </Badge>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-lg">
              From Idea to Invoice — All in One Place
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Effinova simplifies every step of your workflow — from planning tasks to getting paid. Just focus on building.

              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
              <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 z-0"></div>

              {[
                {
                  step: "01",
                  title: "Create Your Workspace",
                  description: "Sign up and instantly create your workspace — no credit card required. It's free to get started.",
                },
                {
                  step: "02",
                  title: "Manage Projects & Tasks",
                  description: "Create projects, add tasks with deadlines, and organize your workday using the built-in calendar.",
                },
                {
                  step: "03",
                  title: "Track Time & Send Invoices",
                  description: "Log your work hours, view progress insights, and generate branded invoices — all from one dashboard.",
                },
              ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="relative z-10 flex flex-col items-center text-center space-y-4"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xl font-bold shadow-lg">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        {/* <section id="testimonials" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                Testimonials
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Loved by Teams Worldwide</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                Don't just take our word for it. See what our customers have to say about their experience.
              </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  quote:
                    "SaaSify has transformed how we manage our projects. The automation features have saved us countless hours of manual work.",
                  author: "Sarah Johnson",
                  role: "Project Manager, TechCorp",
                  rating: 5,
                },
                {
                  quote:
                    "The analytics dashboard provides insights we never had access to before. It's helped us make data-driven decisions that have improved our ROI.",
                  author: "Michael Chen",
                  role: "Marketing Director, GrowthLabs",
                  rating: 5,
                },
                {
                  quote:
                    "Customer support is exceptional. Any time we've had an issue, the team has been quick to respond and resolve it. Couldn't ask for better service.",
                  author: "Emily Rodriguez",
                  role: "Operations Lead, StartupX",
                  rating: 5,
                },
                {
                  quote:
                    "We've tried several similar solutions, but none compare to the ease of use and comprehensive features of SaaSify. It's been a game-changer.",
                  author: "David Kim",
                  role: "CEO, InnovateNow",
                  rating: 5,
                },
                {
                  quote:
                    "The collaboration tools have made remote work so much easier for our team. We're more productive than ever despite being spread across different time zones.",
                  author: "Lisa Patel",
                  role: "HR Director, RemoteFirst",
                  rating: 5,
                },
                {
                  quote:
                    "Implementation was seamless, and the ROI was almost immediate. We've reduced our operational costs by 30% since switching to SaaSify.",
                  author: "James Wilson",
                  role: "COO, ScaleUp Inc",
                  rating: 5,
                },
              ].map((testimonial, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex mb-4">
                        {Array(testimonial.rating)
                          .fill(0)
                          .map((_, j) => (
                            <Star key={j} className="size-4 text-yellow-500 fill-yellow-500" />
                          ))}
                      </div>
                      <p className="text-lg mb-6 flex-grow">{testimonial.quote}</p>
                      <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
                          {testimonial.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-20 md:py-32 relative overflow-hidden">
          {/* Animated Grid Background */}
          <div className="absolute inset-0 -z-10 opacity-40"></div>

          {/* Floating Elements */}
          <div className="absolute -top-10 left-10 w-40 h-40 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-pink-400/20 rounded-full blur-2xl animate-spin-slow" />

          <div className="container px-4 md:px-6 relative">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Badge
                  className="group rounded-full px-4 py-1.5 text-sm font-medium bg-primary/90 text-white hover:text-black dark:hover:text-white shadow-md"
                  variant="secondary"
                >
                  <BarChart2 className="mr-2 h-4 w-4 group-hover:text-black dark:group-hover:text-white" />
                  Pricing
                </Badge>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-lg">
                Simple, Transparent Pricing
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Choose the plan that's right for your business. All plans include a 14-day free trial.
              </p>
            </motion.div>

            {/* Tabs */}
            <Tabs defaultValue="monthly" className="w-full">
              <div className="flex justify-center mb-10">
                <TabsList className="rounded-full p-1 bg-muted/20 backdrop-blur">
                  <TabsTrigger value="monthly" className="rounded-full px-6 text-base">Monthly</TabsTrigger>
                </TabsList>
              </div>

              {/* Cards */}
              <TabsContent value="monthly" key="monthly">
                <div className="grid gap-8 lg:grid-cols-2">
                  {getPlans().map((plan, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95, y: 30 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.15 }}
                    >
                      <Card
                        className={`relative h-full overflow-hidden border border-border/40 rounded-2xl dark:bg-black/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] ${plan.popular ? "ring-2 ring-primary" : ""
                          }`}
                      >
                        {plan.popular && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                            Most Popular
                          </div>
                        )}
                        <CardContent className="p-6 flex flex-col h-full">
                          <h3 className="text-2xl font-bold text-primary">{plan.name}</h3>
                          <div className="flex items-baseline mt-4">
                            <span className="text-4xl font-bold">${plan.price}</span>
                            <span className="text-muted-foreground ml-1">/month</span>
                          </div>
                          <p className="text-muted-foreground mt-2">{plan.description}</p>
                          <ul className="space-y-3 my-6 flex-grow text-sm">
                            {plan.features.map((feature, j) => (
                              <li key={j} className="flex items-center">
                                <Check className="mr-2 size-4 text-primary" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          <Button
                            className={`w-full mt-auto rounded-full transition-all duration-200 ${plan.popular
                              ? "bg-primary hover:scale-105"
                              : "bg-muted hover:bg-muted/80 hover:scale-105"
                            }`}
                            variant={plan.popular ? "default" : "outline"} asChild
                            >
                          <Link href={plan.link}>
                            {plan.cta}
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>


        {/* FAQ Section */}
        <section id="faq" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <Badge
                  className="group rounded-full px-4 py-1.5 text-sm font-medium bg-primary/90 text-white hover:text-black dark:hover:text-white shadow-md"
                  variant="secondary"
                >
                  <BellRing className="mr-2 h-4 w-4 group-hover:text-black dark:group-hover:text-white" />
                  FAQ
                </Badge>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-lg">
                Frequently Asked Questions
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-lg">
                Find answers to common questions about our platform.
              </p>
            </motion.div>

            <div className="mx-auto max-w-2xl space-y-4">
              <Accordion type="single" collapsible className="w-full">
                {[
                  {
                    question: "Who is Effinova for?",
                    answer:
                      "Effinova is designed for freelancers, indie hackers, entrepreneurs, and anyone who manages multiple projects — whether you're working solo or in a small team.",
                  },
                  {
                    question: "Is Effinova free to use?",
                    answer:
                      "Yes! You can get started with Effinova for free. We also offer premium features for advanced users like AI-based task scheduling, branded invoices, and more.",
                  },
                  {
                    question: "Can I track time and view progress?",
                    answer:
                      "Absolutely. Effinova includes built-in time tracking and visual insights so you can monitor your productivity and understand where your time goes.",
                  },
                  {
                    question: "Do I need to use multiple tools with Effinova?",
                    answer:
                      "Nope. Effinova is built to replace your calendar, task manager, invoice generator, and time tracker — all in one clean, unified workspace.",
                  },
                  {
                    question: "Will Effinova get more features in the future?",
                    answer:
                      "Yes! We're constantly improving Effinova based on user feedback. Expect powerful updates like mobile support, integrations, AI enhancements, and more.",
                  }
                ].map((faq, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    viewport={{ once: true }}
                    className="transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.08)",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="rounded-md border border-border/40 bg-background px-4 py-3 shadow-sm"
                    >
                      <AccordionItem value={`item-${i}`}>
                        <AccordionTrigger className="text-left font-semibold hover:no-underline transition-all duration-300">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* <section className="w-full py-20 md:py-32 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-6 text-center"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                Ready to Transform Your Workflow?
              </h2>
              <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">
                Join thousands of satisfied customers who have streamlined their processes and boosted productivity with
                our platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button size="lg" variant="secondary" className="rounded-full h-12 px-8 text-base">
                  Start Free Trial
                  <ArrowRight className="ml-2 size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-8 text-base bg-transparent border-white text-white hover:bg-white/10"
                >
                  Schedule a Demo
                </Button>
              </div>
              <p className="text-sm text-primary-foreground/80 mt-4">
                No credit card required. 14-day free trial. Cancel anytime.
              </p>
            </motion.div>
          </div>
        </section> */}
      </main>

    
    </div>
  )
}

