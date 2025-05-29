"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { CalendarIcon, X, Plus, ChevronLeft, Loader2 } from 'lucide-react'
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
} from "@/components/ui/select"
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

export default function NewProjectPage() {
  const user = { name: "John Doe" } // Replace with actual user data fetching logic
  const isLoading = false // Replace with actual loading state logic
  const router = useRouter()
  const addProject = async (project) => {
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
      toast.success(res.message)
      router.push("/projects")
    }
    else {
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
  
  // Form validation
  const [errors, setErrors] = useState({})
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const validateForm = () => {
    const newErrors= {}
    
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
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return (
  
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col gap-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/projects/new">New Project</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
                  <p className="text-muted-foreground">Fill in the details to create a new project.</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/projects")}
                  className="gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Projects
                </Button>
              </div>
            </div>

            <Card className="border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <div className="space-y-2">
                        <Label htmlFor="title">Project Title</Label>
                        <Input 
                          id="title"
                          placeholder="Enter project title" 
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className={errors.title ? "border-red-500" : ""}
                        />
                        {errors.title && (
                          <p className="text-sm font-medium text-red-500">{errors.title}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description"
                          placeholder="Enter project description" 
                          className={cn("min-h-[120px]", errors.description ? "border-red-500" : "")}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          Provide a detailed description of the project goals and scope.
                        </p>
                        {errors.description && (
                          <p className="text-sm font-medium text-red-500">{errors.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="dueDate"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dueDate && "text-muted-foreground"
                            )}
                          >
                            {dueDate ? (
                              format(dueDate, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={(date) => date && setDueDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-sm text-muted-foreground">
                        When is this project due to be completed?
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={status}
                        onValueChange={(value) => setStatus(value)}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        Current status of the project.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={priority}
                        onValueChange={(value) => setPriority(value)}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        How important is this project?
                      </p>
                    </div>
                    
                    {/* <div className="md:col-span-2">
                      <div className="space-y-2">
                        <Label htmlFor="progress">Progress ({progress}%)</Label>
                        <Slider
                          id="progress"
                          min={0}
                          max={100}
                          step={1}
                          value={[progress]}
                          onValueChange={(vals) => setProgress(vals[0])}
                          className="pt-2"
                        />
                        <p className="text-sm text-muted-foreground">
                          Current completion percentage of the project.
                        </p>
                      </div>
                    </div> */}
                    
                    <div className="md:col-span-2">
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-1 hover:bg-transparent"
                                onClick={() => removeTag(tag)}
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove {tag} tag</span>
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id="tags"
                            placeholder="Add a tag"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addTag()
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={addTag}
                          >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Add tag</span>
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Add tags to categorize your project. Press Enter or click the plus button to add a tag.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <CardFooter className="mt-10 flex justify-between px-0 pb-0">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => router.push("/projects")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Project'
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
  )
}
