"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { format } from "date-fns"
import withAuth from '@/components/withAuth';

import { 
  FileText, AlertCircle, Info, Calendar as CalendarIcon,
  Activity, Flag, Tag, Lightbulb, Zap, Coins, ArrowLeft, Rocket, CheckCircle,
  Plus, ChevronLeft, X, Loader2 // Added Plus, ChevronLeft, X, and Loader2
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { useUserStore } from "@/store/store"

function NewProjectPage() {
  const {SetAiLimit} = useUserStore();

  const user = { name: "John Doe" } // Replace with actual user data fetching logic
  const isLoading = false // Replace with actual loading state logic
  const router = useRouter()
  const generateTasks = async (title, description, dueDate,projectId) => {
    toast.loading("Generating tasks with AI...");
    let token = localStorage.getItem("token")
    const req = await fetch("/api/ai/generate-tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({projectTitle: title, projectDescription: description, dueDate: dueDate, projectId: projectId }),
    })

    const res = await req.json()

    if (res.type === "success") {
      toast.dismiss()
      toast.success(res.message)
      SetAiLimit(res.remainingLimit)
      router.push(`/projects/${projectId}`)
    }
    else {
      toast.dismiss()
      toast.error(res.message || "Failed to create tasks")
      router.push(`/projects/${projectId}`) // Redirect to project page even if task generation fails
    }
  }
  const addProject = async (project) => {
    toast.loading("Creating project...");

    let token = localStorage.getItem("token")
    const req = await fetch("/api/project/add-project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(project),
    })

    const res = await req.json()

    if (res.type === "success") {
      toast.dismiss()
      toast.success(res.message)
      console.log(res)
      if (useAITasks) {
        generateTasks(project.title, project.description, project.dueDate, res.project._id)
      } else {
        // Redirect to the project page after successful creation
        router.push(`/projects/${res.project._id}`)
      }
    }
    else {
      toast.dismiss()
      toast.error(res.message || "Failed to create project")

    }
  }

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState(new Date())
  const [status, setStatus] = useState("not-started")
  const [priority, setPriority] = useState("medium")
  const [progress, setProgress] = useState(0)
  const [tags, setTags] = useState([])
  const [newTag, setNewTag] = useState("")

  const [useAITasks, setUseAITasks] = useState(false)


  // Form validation
  const [errors, setErrors] = useState({})

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const validateForm = () => {
    const newErrors = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    } else if (title.length > 100) {
      newErrors.title = "Title must be less than 100 characters"
    }

    if (!description.trim()) {
      newErrors.description = "Description is required"
    } else if (description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const newProject = {
        id: `project-${Date.now()}`,
        title,
        description,
        dueDate: dueDate,
        status,
        priority,
        progress,
        tags,
        useAITasks
      }


      addProject(newProject)
    } catch (error) {
      console.error("Failed to create project:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

if (!user) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <div className="flex flex-col items-center gap-6 p-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
          <Loader2 className="relative h-16 w-16 animate-spin text-primary drop-shadow-lg" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Loading your workspace...
          </p>
          <p className="text-sm text-muted-foreground">Please wait while we prepare everything</p>
        </div>
      </div>
    </div>
  )
}

return (
  <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-accent/5">
    <main className="flex-1 py-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] pointer-events-none" />
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container relative px-4 md:px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col gap-8"
        >
          {/* Header Section */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      href="/projects" 
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      Projects
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      href="/projects/new"
                      className="text-primary font-medium"
                    >
                      New Project
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </motion.div>

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
                                Create New Project
                              </Badge>
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-lg">
                              Transform your ideas into actionable projects
                            </h2>
                            {/* <p className="max-w-[700px] text-muted-foreground md:text-lg">
                              PlanWisr combines intelligent automation, sleek UI, and powerful insights to help you stay organized and perform at your peak.
                            </p> */}
                          </motion.div>
                          
            <motion.div 
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
               
              <Button
                variant="outline"
                onClick={() => router.push("/projects")}
                className="gap-2 border-border/60 hover:border-border hover:bg-accent/50 transition-all duration-200 shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Projects
              </Button>
            </motion.div>
          </div>

          {/* Main Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-border/40 bg-card/80 backdrop-blur-sm shadow-xl shadow-black/5 dark:shadow-black/20">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-lg pointer-events-none" />
              
              <CardHeader className="relative pb-8">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-semibold">Project Details</CardTitle>
                </div>
                <p className="text-muted-foreground mt-2">
                  Provide the essential information to bring your project to life
                </p>
              </CardHeader>
              
              <CardContent className="relative">
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid gap-8 md:grid-cols-2 mb-8">
                    {/* Project Title */}
                    <motion.div 
                      className="md:col-span-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="title" className="text-base font-medium">Project Title</Label>
                          <span className="text-red-500">*</span>
                        </div>
                        <Input
                          id="title"
                          placeholder="Enter a compelling project title..."
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className={cn(
                            "h-12 text-base border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200",
                            errors.title ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                          )}
                        />
                        {errors.title && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm font-medium text-destructive flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            {errors.title}
                          </motion.p>
                        )}
                      </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div 
                      className="md:col-span-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Label htmlFor="description" className="text-base font-medium">Description</Label>
                          <span className="text-red-500">*</span>
                        </div>
                        <Textarea
                          id="description"
                          placeholder="Describe your project vision, goals, and key objectives..."
                          className={cn(
                            "min-h-[140px] text-base border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none",
                            errors.description ? "border-destructive focus:border-destructive focus:ring-destructive/20" : ""
                          )}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Provide a detailed description of the project goals and scope
                        </p>
                        {errors.description && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-sm font-medium text-destructive flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            {errors.description}
                          </motion.p>
                        )}
                      </div>
                    </motion.div>

                    {/* Due Date */}
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                        <Label htmlFor="dueDate" className="text-base font-medium">Due Date</Label>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="dueDate"
                            variant="outline"
                            className={cn(
                              "w-full h-12 justify-start text-left font-normal border-border/60 hover:border-border hover:bg-accent/50 transition-all duration-200",
                              !dueDate && "text-muted-foreground"
                            )}
                          >
                            {dueDate ? (
                              <span className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-primary" />
                                {format(dueDate, "PPP")}
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 opacity-50" />
                                Pick a due date
                              </span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border-border/60 shadow-lg" align="start">
                          <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={(date) => date && setDueDate(date)}
                            initialFocus
                            className="rounded-md"
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-sm text-muted-foreground">
                        When should this project be completed?
                      </p>
                    </motion.div>

                    {/* Status */}
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-primary" />
                        <Label htmlFor="status" className="text-base font-medium">Status</Label>
                      </div>
                      <Select value={status} onValueChange={(value) => setStatus(value)}>
                        <SelectTrigger id="status" className="h-12 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select current status" />
                        </SelectTrigger>
                        <SelectContent className="border-border/60">
                          <SelectItem value="not-started" className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gray-400" />
                            Not Started
                          </SelectItem>
                          <SelectItem value="in-progress" className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            In Progress
                          </SelectItem>
                          <SelectItem value="completed" className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Completed
                          </SelectItem>
                          <SelectItem value="on-hold" className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            On Hold
                          </SelectItem>
                          <SelectItem value="cancelled" className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            Cancelled
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Current status of the project
                      </p>
                    </motion.div>

                    {/* Priority */}
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-primary" />
                        <Label htmlFor="priority" className="text-base font-medium">Priority</Label>
                      </div>
                      <Select value={priority} onValueChange={(value) => setPriority(value)}>
                        <SelectTrigger id="priority" className="h-12 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                        <SelectContent className="border-border/60">
                          <SelectItem value="low" className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            Low Priority
                          </SelectItem>
                          <SelectItem value="medium" className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                            Medium Priority
                          </SelectItem>
                          <SelectItem value="high" className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500" />
                            High Priority
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        How important is this project?
                      </p>
                    </motion.div>

                    {/* Tags */}
                    <motion.div 
                      className="md:col-span-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 }}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Plus className="h-4 w-4 text-primary" />
                          <Label htmlFor="tags" className="text-base font-medium">Tags</Label>
                        </div>
                        
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg border border-border/40">
                            {tags.map((tag, index) => (
                              <motion.div
                                key={tag}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                              >
                                <Badge 
                                  variant="secondary" 
                                  className="text-sm py-1 px-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors duration-200"
                                >
                                  {tag}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 ml-2 hover:bg-destructive/20 hover:text-destructive transition-colors duration-200"
                                    onClick={() => removeTag(tag)}
                                  >
                                    <X className="h-3 w-3" />
                                    <span className="sr-only">Remove {tag} tag</span>
                                  </Button>
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex gap-3">
                          <Input
                            id="tags"
                            placeholder="Add a tag (e.g., frontend, design, urgent)"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addTag()
                              }
                            }}
                            className="flex-1 h-11 border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={addTag}
                            className="h-11 w-11 border-border/60 hover:border-primary/60 hover:bg-primary/10 transition-all duration-200"
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Add tag</span>
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Plus className="h-4 w-4" />
                          Add tags to categorize and organize your project. Press Enter or click + to add.
                        </p>
                      </div>
                    </motion.div>
                  </div>

{/* AI Task Creation */}
                  <motion.div
  className="border-t border-border/40 pt-10"
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: 'easeOut', delay: 0.8 }}
>
  <div className="rounded-2xl bg-muted/10 p-6 border border-border shadow-md transition-all duration-300 hover:shadow-lg backdrop-blur-md">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
      {/* Left Side */}
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3">
          <div>
            <Label htmlFor="ai-tasks" className="text-2xl text-foreground font-extrabold tracking-tight text-gray-900 dark:text-white drop-shadow-lg">
              AI Task Creation
            </Label>
            <p className="text-sm text-muted-foreground">Powered by advanced AI</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          Let AI analyze your project title and description to automatically generate relevant tasks and milestones.
        </p>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
          <Plus className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            This will use <strong>2 AI credits</strong>
          </span>
        </div>
      </div>

      {/* Right Side - Toggle */}
      <div className="flex flex-col items-center gap-2">
        <Switch
          id="ai-tasks"
          checked={useAITasks}
          onCheckedChange={setUseAITasks}
          className="data-[state=checked]:bg-primary transition-all duration-300"
        />
        <span className="text-xs text-muted-foreground">
          {useAITasks ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    </div>
  </div>
</motion.div>


                  {/* Form Actions */}
                  <motion.div 
                    className="flex flex-col sm:flex-row justify-between gap-4 pt-8 border-t border-border/40"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.1 }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/projects")}
                      className="h-12 px-8 border-border/60 hover:border-border hover:bg-accent/50 transition-all duration-200"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="h-12 px-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg shadow-primary/25 transition-all duration-200"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Project...
                        </>
                      ) : (
                        <>
                          <Rocket className="mr-2 h-4 w-4" />
                          Create Project
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </main>
  </div>
)
}


export default withAuth(NewProjectPage);