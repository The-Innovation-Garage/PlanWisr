"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Calendar,
  Flag,
  Clock,
  Users,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  Filter,
  Grid3X3,
  List,
  ChevronDown,
  TrendingUp,
  Target,
  Zap
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import toast from "react-hot-toast"

// Animation variants
const containerVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
}

const cardHoverVariants = {
  hover: {
    scale: 1.02,
    y: -5,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

const progressVariants = {
  initial: { scaleX: 0, originX: 0 },
  animate: (progress) => ({
    scaleX: progress / 100,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  })
};

// Constants
const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 }
const STATUS_CONFIG = {
  completed: { color: "bg-emerald-500", icon: CheckCircle2, textColor: "text-emerald-600" },
  "in-progress": { color: "bg-blue-500", icon: Clock, textColor: "text-blue-600" },
  "not-started": { color: "bg-gray-400", icon: Circle, textColor: "text-gray-600" },
  "on-hold": { color: "bg-amber-500", icon: AlertCircle, textColor: "text-amber-600" },
  cancelled: { color: "bg-red-500", icon: AlertCircle, textColor: "text-red-600" }
}

const PRIORITY_CONFIG = {
  high: { icon: Flag, color: "text-red-500", bgColor: "bg-red-50 border-red-200" },
  medium: { icon: Flag, color: "text-amber-500", bgColor: "bg-amber-50 border-amber-200" },
  low: { icon: Flag, color: "text-emerald-500", bgColor: "bg-emerald-50 border-emerald-200" }
}

export default function ProjectsPage() {
  // State management
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("dueDate")
  const [sortOrder, setSortOrder] = useState("asc")
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid")

  // Mock user data - replace with actual auth
  // const user = { name: "John Doe" }

  // API Functions
  // API Functions
  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      // Check if we're in the browser before accessing localStorage
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("No authentication token found")
        router.push("/login")
        return
      }

      const response = await fetch("/api/project/get-projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.type === "success") {
        setProjects(data.projects)
        console.log(data.projects)
      } else {
        toast.error(data.message || "Failed to fetch projects")
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("An error occurred while fetching projects")
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProject = async (id) => {
    const deletePromise = new Promise(async (resolve, reject) => {
      try {
        // Check if we're in the browser before accessing localStorage
        if (typeof window === 'undefined') {
          reject(new Error("Cannot access localStorage on server"))
          return
        }

        const token = localStorage.getItem("token")
        if (!token) {
          reject(new Error("No authentication token found"))
          return
        }

        const response = await fetch(`/api/project/delete-project`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ projectId: id }),
        })

        const result = await response.json()

        if (result.type === "success") {
          setProjects(prev => prev.filter(project => project._id !== id))
          resolve("Project deleted successfully")
        } else {
          reject(new Error(result.message || "Failed to delete project"))
        }
      } catch (error) {
        reject(error)
      }
    })

    toast.promise(deletePromise, {
      loading: "Deleting project...",
      success: "Project deleted successfully!",
      error: "Failed to delete project"
    })
  }
  // Computed values
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || project.status === statusFilter
      const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })

    return filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "dueDate":
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case "priority":
          comparison = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        default:
          return 0
      }

      return sortOrder === "asc" ? comparison : -comparison
    })
  }, [projects, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder])

  const projectStats = useMemo(() => {
    const stats = {
      total: projects.length,
      completed: projects.filter(p => p.status === "completed").length,
      inProgress: projects.filter(p => p.status === "in-progress").length,
      overdue: projects.filter(p => new Date(p.dueDate) < new Date() && p.status !== "completed").length
    }

    return {
      ...stats,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
    }
  }, [projects])

  // Helper functions
  const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG["not-started"]
  const getPriorityConfig = (priority) => PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.low

  const handleDeleteProject = (id) => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProject(id)
    }
  }

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    fetchProjects()
  }, [router])

  // Replace the user variable with this:
  const [user, setUser] = useState(null)

  // Add this useEffect to check authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token")
      if (token) {
        // You can decode the token here to get user info, or set a default user
        setUser({ name: "John Doe" }) // Replace with actual user data from token
      }
    }
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[100vh] items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-blue-400 opacity-20" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-slate-800">Loading Projects</h3>
            <p className="text-slate-600 mt-1">Setting up your workspace...</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // Stats Cards Component
  const StatsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        { label: "Total Projects", value: projectStats.total, icon: Target, color: "text-blue-600" },
        { label: "In Progress", value: projectStats.inProgress, icon: Zap, color: "text-amber-600" },
        { label: "Completed", value: projectStats.completed, icon: CheckCircle2, color: "text-emerald-600" },
        { label: "Success Rate", value: `${projectStats.completionRate}%`, icon: TrendingUp, color: "text-purple-600" }
      ].map((stat, index) => (
        <motion.div
          key={stat.label}
          variants={itemVariants}
          custom={index}
          className="relative overflow-hidden"
        >
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-slate-50 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )

  // Project Card Component
  const ProjectCard = ({ project, index }) => {
    const statusConfig = getStatusConfig(project.status)
    const priorityConfig = getPriorityConfig(project.priority)
    const StatusIcon = statusConfig.icon
    const PriorityIcon = priorityConfig.icon

    return (
      <motion.div
        variants={itemVariants}
        custom={index}
        whileHover="hover"
        className="group"
      >
        <motion.div variants={cardHoverVariants}>
          <Card className="h-full overflow-hidden border-0 shadow-sm bg-white/90 backdrop-blur-sm group-hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0">
              {/* Status indicator */}
              <div className={`h-1 w-full ${statusConfig.color}`} />

              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer">
                        <Link href={`/projects/${project._id}/edit`} className="flex items-center w-full">
                          Edit Project
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteProject(project._id)}
                        className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50"
                      >
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Project details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Due {format(new Date(project.dueDate), "MMM d, yyyy")}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <StatusIcon className={`mr-2 h-4 w-4 ${statusConfig.textColor}`} />
                      <span className="capitalize text-slate-700">
                        {project.status.replace("-", " ")}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <PriorityIcon className={`mr-2 h-4 w-4 ${priorityConfig.color}`} />
                      <span className="capitalize text-slate-700">{project.priority}</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {project.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, 3).map((tag, i) => (
                      <Badge
                        key={i}
                        variant="primary"
                        className="text-xs px-2 py-1 bg-slate-100 text-slate-700 border-0 hover:bg-slate-200 transition-colors"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs px-2 py-1 bg-slate-100 text-slate-700">
                        +{project.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Progress bar */}
                {(project.progress !== undefined && project.progress !== null) && (
                  <div className="mb-4">
                    <div style={{
                      margin: "10px 0px"
                    }} className="flex justify-between text-xs text-slate-600 mb-2">
                      <span>Progress</span>
                      <span className="font-medium">
                        {Math.round(project.progress)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                        style={{
                          transformOrigin: "left",
                          width: `${Math.max(0, Math.min(100, project.progress || 0))}%`
                        }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                {/* Action button */}
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <Link href={`/projects/${project._id}`}>
                    Open Project
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  // Empty state component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
          <Search className="h-10 w-10 text-blue-600" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <Plus className="h-4 w-4 text-white" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        {filteredAndSortedProjects.length === 0 && projects.length > 0
          ? "No projects match your filters"
          : "No projects yet"
        }
      </h3>

      <p className="text-slate-600 mb-6 max-w-md leading-relaxed">
        {filteredAndSortedProjects.length === 0 && projects.length > 0
          ? "Try adjusting your search query or filters to find what you're looking for."
          : "Create your first project to start organizing your work and tracking progress."
        }
      </p>

      <Button
        asChild
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Link href="/projects/new">
          <Plus className="mr-2 h-5 w-5" />
          Create New Project
        </Link>
      </Button>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
                  Projects
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                  Manage your projects with style and efficiency. Track progress, set priorities, and achieve your goals.
                </p>
              </div>

              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8"
              >
                <Link href="/projects/new">
                  <Plus className="mr-2 h-5 w-5" />
                  New Project
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <StatsCards />

            {/* Filters and Controls */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type="search"
                    placeholder="Search projects..."
                    className="pl-10 border-slate-200 bg-white/80 backdrop-blur-sm focus:bg-white transition-all duration-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="border-slate-200 bg-white/80 backdrop-blur-sm focus:bg-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="border-slate-200 bg-white/80 backdrop-blur-sm focus:bg-white">
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="border-slate-200 bg-white/80 backdrop-blur-sm hover:bg-white">
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Sort by
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleSortChange("dueDate", "asc")}>
                      Due Date (Earliest)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("dueDate", "desc")}>
                      Due Date (Latest)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSortChange("priority", "desc")}>
                      Priority (High to Low)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("priority", "asc")}>
                      Priority (Low to High)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleSortChange("title", "asc")}>
                      Title (A-Z)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange("title", "desc")}>
                      Title (Z-A)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* View toggle and results count */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600">
                  Showing {filteredAndSortedProjects.length} of {projects.length} projects
                </p>

                <Tabs value={viewMode} onValueChange={setViewMode} className="w-auto">
                  <TabsList className="bg-white/80 border border-slate-200">
                    <TabsTrigger value="grid" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                      <Grid3X3 className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="list" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                      <List className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </motion.div>

            {/* Projects Display */}
            <AnimatePresence mode="wait">
              {filteredAndSortedProjects.length === 0 ? (
                <EmptyState />
              ) : (
                <motion.div
                  key={viewMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {viewMode === "grid" ? (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {filteredAndSortedProjects.map((project, index) => (
                        <ProjectCard key={project._id} project={project} index={index} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                    >
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50/80 border-b border-slate-200">
                            <tr>
                              <th className="text-left py-4 px-6 font-semibold text-slate-700">Project</th>
                              <th className="text-left py-4 px-6 font-semibold text-slate-700">Status</th>
                              <th className="text-left py-4 px-6 font-semibold text-slate-700">Priority</th>
                              <th className="text-left py-4 px-6 font-semibold text-slate-700">Due Date</th>
                              <th className="text-left py-4 px-6 font-semibold text-slate-700">Progress</th>
                              <th className="text-right py-4 px-6 font-semibold text-slate-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAndSortedProjects.map((project, index) => {
                              const statusConfig = getStatusConfig(project.status)
                              const priorityConfig = getPriorityConfig(project.priority)
                              const StatusIcon = statusConfig.icon
                              const PriorityIcon = priorityConfig.icon

                              return (
                                <motion.tr
                                  key={project._id}
                                  variants={itemVariants}
                                  custom={index}
                                  className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors duration-200"
                                >
                                  <td className="py-4 px-6">
                                    <div className="space-y-1">
                                      <p className="font-medium text-slate-900">{project.title}</p>
                                      <p className="text-sm text-slate-600 truncate max-w-xs">{project.description}</p>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center">
                                      <StatusIcon className={`mr-2 h-4 w-4 ${statusConfig.textColor}`} />
                                      <span className="capitalize text-slate-700">
                                        {project.status.replace("-", " ")}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center">
                                      <PriorityIcon className={`mr-2 h-4 w-4 ${priorityConfig.color}`} />
                                      <span className="capitalize text-slate-700">{project.priority}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6 text-slate-700">
                                    {format(new Date(project.dueDate), "MMM d, yyyy")}
                                  </td>
                                  <td className="py-4 px-6">
                                    {project.progress !== undefined ? (
                                      <div className="flex items-center space-x-3">
                                        <div className="flex-1">
                                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                            <motion.div
                                              className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                                              style={{
                                                transformOrigin: "left",
                                                width: `${Math.max(0, Math.min(100, project.progress || 0))}%`
                                              }}
                                              initial={{ scaleX: 0 }}
                                              animate={{ scaleX: 1 }}
                                              transition={{ duration: 0.8, ease: "easeOut" }}
                                            />
                                          </div>
                                        </div>
                                        <span className="mx-3 text-sm font-medium text-slate-700 min-w-[3rem]">
                                          {project.progress.toFixed(0)}%
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-400">N/A</span>
                                    )}
                                  </td>
                                  <td className="py-4 px-6">
                                    <div className="flex items-center justify-end space-x-2">
                                      <Button
                                        asChild
                                        size="sm"
                                        variant="outline"
                                        className="border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                                      >
                                        <Link href={`/projects/${project._id}`}>
                                          View
                                        </Link>
                                      </Button>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem asChild className="cursor-pointer">
                                            <Link href={`/projects/${project._id}/edit`}>
                                              Edit Project
                                            </Link>
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            onClick={() => handleDeleteProject(project._id)}
                                            className="text-red-600 cursor-pointer hover:text-red-700 hover:bg-red-50"
                                          >
                                            Delete Project
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </td>
                                </motion.tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  )
}



{/* Create Project Dialog */ }
{/* <ProjectDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} onSubmit={handleCreateProject} />

      
      {editingProject && (
        <ProjectDialog
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
          project={editingProject}
          onSubmit={handleUpdateProject}
        />
      )}
       */}