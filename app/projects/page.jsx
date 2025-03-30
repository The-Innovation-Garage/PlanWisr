"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
} from "lucide-react"
import { format } from "date-fns"
import { Navbar } from "@/components/navbar"

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

export default function ProjectsPage() {


  const user = { name: "John Doe" } // Replace with actual user data fetching logic
  const isLoading = false // Replace with actual loading state logic
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("dueDate")
  const [sortOrder, setSortOrder] = useState("asc")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)

    const [projects, setProjects] = useState([
    {
      id: 1,
      title: "Project 1",
      description: "Description for project 1",
      dueDate: new Date(),
      status: "in-progress",
      priority: "high",
      team: ["User 1", "User 2"],
      tags: ["Tag 1", "Tag 2"],
      progress: 50,
    },
    {
      id: 2,
      title: "Project 2",
      description: "Description for project 2",
      dueDate: new Date(),
      status: "completed",
      priority: "medium",
    }]);



  const addProject = (project) => {
    // Add project logic here
  }

    const updateProject = (project) => {
    // Update project logic here
    }

    const deleteProject = (id) => {
    // Delete project logic here
    }


  useEffect(() => {
    if ( !user) {
      router.push("/login")
    }
  }, [user, router])

  const handleCreateProject = (project) => {
    addProject(project)
    setIsCreateDialogOpen(false)
  }

  const handleUpdateProject = (project) => {
    updateProject(project)
    setEditingProject(null)
  }

  const handleDeleteProject = (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProject(id)
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    const matchesPriority = priorityFilter === "all" || project.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "dueDate") {
      const dateA = new Date(a.dueDate).getTime()
      const dateB = new Date(b.dueDate).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    } else if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityA = priorityOrder[a.priority]
      const priorityB = priorityOrder[b.priority]
      return sortOrder === "asc" ? priorityA - priorityB : priorityB - priorityA
    } else if (sortBy === "title") {
      return sortOrder === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    }
    return 0
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-500 text-white"
      case "in-progress":
        return "bg-primary text-white"
      case "on-hold":
        return "bg-yellow-500 text-white"
      case "cancelled":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return <Flag className="h-4 w-4 text-red-500" />
      case "medium":
        return <Flag className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Flag className="h-4 w-4 text-green-500" />
      default:
        return <Flag className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-primary" />
      case "not-started":
        return <Circle className="h-4 w-4 text-gray-500" />
      case "on-hold":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <p className="text-muted-foreground">Manage and track all your projects in one place.</p>
              </div>

              <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateDialogOpen(true)} asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto_auto]">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
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
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-[160px]">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort by
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("dueDate")
                      setSortOrder("asc")
                    }}
                  >
                    Due Date (Earliest)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("dueDate")
                      setSortOrder("desc")
                    }}
                  >
                    Due Date (Latest)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("priority")
                      setSortOrder("desc")
                    }}
                  >
                    Priority (Highest)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("priority")
                      setSortOrder("asc")
                    }}
                  >
                    Priority (Lowest)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("title")
                      setSortOrder("asc")
                    }}
                  >
                    Title (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("title")
                      setSortOrder("desc")
                    }}
                  >
                    Title (Z-A)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Tabs defaultValue="grid" className="w-full">
              <div className="flex justify-end mb-4">
                <TabsList>
                  <TabsTrigger value="grid">Grid</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="grid" className="mt-0">
                {sortedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                      <Search className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No projects found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                        ? "Try adjusting your filters or search query."
                        : "Create your first project to get started."}
                    </p>
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Project
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedProjects.map((project) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                          <CardContent className="p-0">
                            <div className={`h-2 w-full ${getStatusColor(project.status)}`} />
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">Open menu</span>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setEditingProject(project)}>Edit</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteProject(project.id)}
                                      className="text-red-600"
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.description}</p>

                              <div className="space-y-3">
                                <div className="flex items-center text-sm">
                                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>Due: {format(new Date(project.dueDate), "MMM d, yyyy")}</span>
                                </div>

                                <div className="flex items-center text-sm">
                                  {getStatusIcon(project.status)}
                                  <span className="ml-2 capitalize">{project.status.replace("-", " ")}</span>
                                </div>

                                <div className="flex items-center text-sm">
                                  {getPriorityIcon(project.priority)}
                                  <span className="ml-2 capitalize">{project.priority}</span>
                                </div>

                                {project.team && project.team.length > 0 && (
                                  <div className="flex items-center text-sm">
                                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>
                                      {project.team.length} team member{project.team.length !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 flex flex-wrap gap-2">
                                {project.tags &&
                                  project.tags.map((tag, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                              </div>

                              {project.progress !== undefined && (
                                <div className="mt-4">
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                      className="bg-primary h-2 rounded-full"
                                      style={{ width: `${project.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="list" className="mt-0">
                {sortedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-6 mb-4">
                      <Search className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No projects found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                        ? "Try adjusting your filters or search query."
                        : "Create your first project to get started."}
                    </p>
                    <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Project
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-medium">Project</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Priority</th>
                          <th className="text-left py-3 px-4 font-medium">Due Date</th>
                          <th className="text-left py-3 px-4 font-medium">Progress</th>
                          <th className="text-right py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedProjects.map((project) => (
                          <tr key={project.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{project.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {getStatusIcon(project.status)}
                                <span className="ml-2 capitalize">{project.status.replace("-", " ")}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {getPriorityIcon(project.priority)}
                                <span className="ml-2 capitalize">{project.priority}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">{format(new Date(project.dueDate), "MMM d, yyyy")}</td>
                            <td className="py-3 px-4">
                              {project.progress !== undefined ? (
                                <div>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span>{project.progress}%</span>
                                  </div>
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                      className="bg-primary h-2 rounded-full"
                                      style={{ width: `${project.progress}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span>-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setEditingProject(project)}>Edit</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteProject(project.id)}
                                    className="text-red-600"
                                  >
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      {/* Create Project Dialog */}
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
    </div>
  )
}

