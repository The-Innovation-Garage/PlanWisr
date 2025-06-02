"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { format } from "date-fns"
import { Calendar, Clock, Flag, MoreHorizontal, Plus, Users, ChevronLeft, CheckCircle2, Circle, Loader2, AlertCircle, BarChart, Edit, Trash2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ProjectTimer } from "@/components/project-timer"
import { TimeEntriesList } from "@/components/time-entries-list"
import toast from "react-hot-toast"
// Define the task statuses for the Kanban board
const taskStatuses = ["not-started", "in-progress", "done"]

// Define the task status labels
const taskStatusLabels = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  "done": "Done"
}

// Define the task priority colors
const priorityColors = {
  "low": "bg-green-500",
  "medium": "bg-yellow-500",
  "high": "bg-red-500"
}

export default function ProjectDetailPage({ params }) {
  const { projectId } = use(params)
  const user = {
    name: "psycho"
  }
  const isAuthLoading = false;
  const router = useRouter()

  const updateProject = async (project) => {
    console.log("Project updated:", project)
  }


  const [timeEntries, setTimeEntries] = useState([])

  const handleSaveTimeEntry = (timeEntryData) => {
    if (project) {
      const newTimeEntry = {
        ...timeEntryData,
        id: `time-${Date.now()}`,
        createdAt: new Date().toISOString(),
      }

      const updatedTimeEntries = [...timeEntries, newTimeEntry]
      setTimeEntries(updatedTimeEntries)

      const updatedProject = {
        ...project,
        timeEntries: updatedTimeEntries,
        updatedAt: new Date().toISOString(),
      }

      setProject(updatedProject)
      updateProject(updatedProject)
    }
  }

  const handleDeleteTimeEntry = (id) => {
    if (window.confirm("Are you sure you want to delete this time entry?")) {
      const updatedTimeEntries = timeEntries.filter((entry) => entry.id !== id)
      setTimeEntries(updatedTimeEntries)

      if (project) {
        const updatedProject = {
          ...project,
          timeEntries: updatedTimeEntries,
          updatedAt: new Date().toISOString(),
        }

        setProject(updatedProject)
        updateProject(updatedProject)
      }
    }
  }

  const handleUpdateTimeEntry = (updatedEntry) => {
    const updatedTimeEntries = timeEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))

    setTimeEntries(updatedTimeEntries)

    if (project) {
      const updatedProject = {
        ...project,
        timeEntries: updatedTimeEntries,
        updatedAt: new Date().toISOString(),
      }

      setProject(updatedProject)
      updateProject(updatedProject)
    }
  }


  // Replace your project state initialization with this:
  const [dueState, setDueState] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [project, setProject] = useState({
    id: projectId,
    title: "Marketing Campaign Q2",
    description: "Comprehensive marketing campaign for second quarter product launch",
    status: "in-progress",
    priority: "high",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    progress: 40,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [
      {
        id: "1",
        title: "Design social media graphics",
        description: "Create eye-catching graphics for Instagram, Twitter and Facebook",
        status: "done",
        priority: "medium",
        assignee: "Alex Wong",
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        title: "Write press release",
        description: "Draft press release for product launch announcement",
        status: "review",
        priority: "high",
        assignee: "Jamie Smith",
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        title: "Finalize budget allocation",
        description: "Review and approve final marketing budget for all channels",
        status: "in-progress",
        priority: "high",
        assignee: "Robin Chen",
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "4",
        title: "Schedule social media posts",
        description: "Plan content calendar and schedule posts across all platforms",
        status: "todo",
        priority: "medium",
        assignee: "Alex Wong",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "5",
        title: "Coordinate with sales team",
        description: "Align marketing messaging with sales strategies",
        status: "todo",
        priority: "low",
        assignee: "Taylor Kim",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "6",
        title: "Create email campaign",
        description: "Design and write email sequence for product announcement",
        status: "in-progress",
        priority: "high",
        assignee: "Jamie Smith",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  });
  useEffect(() => {
    // Initialize tasks from project.tasks
    if (project && project.tasks) {
      // setTasks(project.tasks);

      // Calculate stats
      setTotalTasks(project.tasks.length);
      setCompletedTasks(project.tasks.filter(task => task.status === "done").length);
    }
  }, [project]);
  const [tasks, setTasks] = useState([])
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [isNewTask, setIsNewTask] = useState(false);

  const [projectDetails, setProjectDetails] = useState({
    dueDate: new Date()
  });

  // Task form state
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskStatus, setTaskStatus] = useState("todo")
  const [taskPriority, setTaskPriority] = useState("medium")
  const [taskAssignee, setTaskAssignee] = useState("")
  const [taskDueDate, setTaskDueDate] = useState("")
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Stats
  const [completedTasks, setCompletedTasks] = useState(0)
  const [totalTasks, setTotalTasks] = useState(0)

  const [projects, setProjects] = useState({});


  const getProjectTasks = async () => {
    const req = await fetch("/api/task/get-project-tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ projectId }),
    })

    const res = await req.json();

    console.log("Tasks: ", res.tasks)
    setTasks(res.tasks || [])
  }

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  const getProjectDetails = async () => {
    const req = await fetch("/api/project/get-project-details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ projectId }),
    })

    const res = await req.json();

    console.log(res.project)
    setProjectDetails(res.project)
  }

  useEffect(() => {
    getProjectDetails();
    getProjectTasks();
  }, [])

  //   useEffect(() => {
  //     if (projects.length > 0) {
  //       const foundProject = projects.find(p => p.id === params.id)
  //       if (foundProject) {
  //         setProject(foundProject)

  //         // Initialize tasks from project or create empty array
  //         const projectTasks = foundProject.tasks || []
  //         setTasks(projectTasks)

  //         // Calculate stats
  //         setTotalTasks(projectTasks.length)
  //         setCompletedTasks(projectTasks.filter(task => task.status === "done").length)
  //       } else {
  //         router.push("/projects")
  //       }
  //     }
  //   }, [projects, params.id, router])

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const { source, destination } = result

    // If dropped in a different column
    if (source.droppableId !== destination.droppableId) {
      const updatedTasks = [...tasks]
      const taskIndex = updatedTasks.findIndex(task => task._id === result.draggableId)
      console.log(updatedTasks, taskIndex, result.draggableId)



      if (taskIndex !== -1) {
        // Update the task status
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          status: destination.droppableId
        }

        setTasks(updatedTasks)
        saveTasksToProject(updatedTasks)
        const task = updatedTasks[taskIndex];
        const req = await fetch("/api/task/update-task-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            projectId,
            taskId: task._id,
            status: destination.droppableId
          }),
        })
        const res = await req.json();
        if (res.type == "success") {
          toast.success(res.message);

        }
        else {
          toast.error(res.message)
        }

        // Update stats if moved to/from done
        if (destination.droppableId === "done") {
          setCompletedTasks(prev => prev + 1)
        } else if (source.droppableId === "done") {
          setCompletedTasks(prev => prev - 1)
        }
      }


    }
    // If reordered within the same column
    else if (source.index !== destination.index) {
      // For now, we're not implementing reordering within columns
      // This would require adding a position/order field to tasks
    }
  }

  const openTaskDialog = (task = null) => {
    if (task) {
      setCurrentTask(task)
      setTaskTitle(task.title)
      setTaskDescription(task.description || "")
      setTaskStatus(task.status)
      setTaskPriority(task.priority)
      setTaskAssignee(task.assignee || "")
      setTaskDueDate(task.dueDate || "")
      setIsNewTask(false)
    } else {
      setCurrentTask(null)
      setTaskTitle("")
      setTaskDescription("")
      setTaskStatus("todo")
      setTaskPriority("medium")
      setTaskAssignee("")
      setTaskDueDate("")
      setIsNewTask(true)
    }
    setErrors({})
    setIsTaskDialogOpen(true)
  }

  const validateTaskForm = () => {
    const newErrors = {}

    if (!taskTitle.trim()) {
      newErrors.title = "Task title is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTaskSubmit = async () => {
    if (!validateTaskForm()) return

    setIsSubmitting(true)

    try {
      const updatedTasks = [...tasks]

      if (isNewTask) {
        // Create new task
        const newTask = {
          id: `task-${Date.now()}`,
          title: taskTitle,
          description: taskDescription,
          status: taskStatus,
          priority: taskPriority,
          dueDate: taskDueDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          project: projectId
        }

        console.log(newTask);
        let token = localStorage.getItem("token")
        const req = await fetch("/api/task/add-task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newTask),
        })

        const res = await req.json();
          newtask._id = res.taskId
          updatedTasks.push(newTask)
          setTotalTasks(prev => prev + 1)
          if (taskStatus === "done") {
            setCompletedTasks(prev => prev + 1)
          }
        
        
      
         
      }
      else if (currentTask) {
        // Update existing task
        const taskIndex = updatedTasks.findIndex(t => t._id === currentTask._id)
        console.log("Current task:", currentTask,taskIndex)

        if (taskIndex !== -1) {
          const wasCompleted = updatedTasks[taskIndex].status === "done"
          const isNowCompleted = taskStatus === "done"

          const updatedProject = {
            ...updatedTasks[taskIndex],
            title: taskTitle,
            description: taskDescription,
            status: taskStatus,
            priority: taskPriority,
            dueDate: taskDueDate || undefined,
          }

          let taskId = currentTask._id;

          const req = await fetch("/api/task/update-task", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ project: updatedProject, taskId })
          })

          const res = await req.json();

          if (res.type === "success") {
            toast.success(res.message)
            setTasks(updatedTasks)
            saveTasksToProject(updatedTasks)
            updatedTasks[taskIndex] = updatedProject

            // Update completion stats if status changed
            if (!wasCompleted && isNowCompleted) {
              setCompletedTasks(prev => prev + 1)
            } else if (wasCompleted && !isNowCompleted) {
              setCompletedTasks(prev => prev - 1)
            }
          }
          else {
            toast.error(res.message)
          }         
        }
      }  
      setIsTaskDialogOpen(false)
      
    } catch (error) {
      console.error("Failed to save task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const taskToDelete = tasks.find(t => t._id === taskId)
      const updatedTasks = tasks.filter(t => t._id !== taskId)
      console.log(taskId)
      const req = await fetch("/api/task/delete-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ taskId }),
      })
      const res = await req.json();
      if (res.type === "success") {
        toast.success(res.message)

        setTasks(updatedTasks)
        saveTasksToProject(updatedTasks)
        setTotalTasks(prev => prev - 1)

        if (taskToDelete && taskToDelete.status === "done") {
          setCompletedTasks(prev => prev - 1)
        }

        if (isTaskDialogOpen) {
          setIsTaskDialogOpen(false)
        }
      }
      else {
        toast.error(res.message);
      }
    }
  }

  const saveTasksToProject = (updatedTasks) => {
    if (project) {
      const updatedProject = {
        ...project,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      }

      // Calculate progress based on completed tasks
      if (updatedTasks.length > 0) {
        const completedCount = updatedTasks.filter(t => t.status === "done").length
        updatedProject.progress = Math.round((completedCount / updatedTasks.length) * 100)
      } else {
        updatedProject.progress = 0
      }

      setProject(updatedProject)
      updateProject(updatedProject)
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

  if (!project) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8"
          >
            {/* Breadcrumb and Header */}
            <div className="flex flex-col gap-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/projects/${projectDetails._id}`}>{projectDetails.title}</BreadcrumbLink>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{projectDetails.title}</h1>
                  <p className="text-muted-foreground">{projectDetails.description}</p>
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

            {/* Project Info Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    {getStatusIcon(projectDetails.status)}
                    <span className="ml-2 capitalize text-lg font-medium">
                      {project.status.replace("-", " ")}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    {getPriorityIcon(projectDetails.priority)}
                    <span className="ml-2 capitalize text-lg font-medium">
                      {projectDetails.priority}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Due Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-lg font-medium">
                        {format(new Date(dueState || projectDetails.dueDate), "MMM d, yyyy")}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDatePickerOpen(true)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit due date</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>


              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-medium">{project.progress || 0}%</span>
                      <span className="text-muted-foreground text-sm">
                        {completedTasks} of {totalTasks} tasks
                      </span>
                    </div>
                    <Progress value={project.progress || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timer Section */}
            <div className="grid gap-6 md:grid-cols-2">
              <ProjectTimer projectId={project._id} onSaveTimeEntry={handleSaveTimeEntry} />

              <TimeEntriesList
                timeEntries={timeEntries}
                onDeleteTimeEntry={handleDeleteTimeEntry}
                onUpdateTimeEntry={handleUpdateTimeEntry}
              />
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="board" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="board">Board</TabsTrigger>
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                </TabsList>

                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => openTaskDialog()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </div>

              {/* Kanban Board View */}
              <TabsContent value="board" className="mt-0">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {taskStatuses.map((status) => (
                      <div key={status} className="flex flex-col">
                        <div className="flex items-center justify-between mb-2 px-2">
                          <h3 className="font-medium">{taskStatusLabels[status]}</h3>
                          <Badge variant="outline">
                            {tasks.filter(task => task.status === status).length}
                          </Badge>
                        </div>

                        <Droppable droppableId={status} isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="bg-muted/50 rounded-lg p-2 flex-1 min-h-[300px]"
                            >
                              {tasks
                                .filter(task => task.status === status)
                                .map((task, index) => (
                                  <Draggable key={task._id} draggableId={task._id} index={index}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="mb-2"
                                      >
                                        {/* Rest of your Card content */}
                                        <Card className="hover:shadow-md transition-shadow">
                                          <CardHeader className="p-2">
                                            <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
                                            <p className="text-xs text-muted-foreground">{task.description}</p>
                                          </CardHeader>
                                          <CardContent className="p-2">
                                            <div className="flex items-center justify-between">
                                              <Badge variant="outline" className={`${priorityColors[task.priority]} text-white`}>
                                                {task.priority}
                                              </Badge>
                                              <span className="text-xs text-muted-foreground">
                                                {task.assignee ? task.assignee : "Unassigned"}
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                              <span className="text-xs text-muted-foreground">
                                                {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date"}
                                              </span>
                                              <Button variant="ghost" size="icon" onClick={() => openTaskDialog(task)}>
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </CardContent>
                                          <CardFooter className="p-2">
                                            <Progress value={task.progress || 0} className="h-2" />
                                          </CardFooter>

                                        </Card>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              {provided.placeholder}

                              {tasks.filter(task => task.status === status).length === 0 && (
                                <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                                  No tasks
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    ))}
                  </div>
                </DragDropContext>
              </TabsContent>

              {/* List View */}
              <TabsContent value="list" className="mt-0">
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Task</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Priority</th>
                            <th className="text-left py-3 px-4 font-medium">Assignee</th>
                            <th className="text-left py-3 px-4 font-medium">Due Date</th>
                            <th className="text-right py-3 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tasks.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-muted-foreground">
                                No tasks found. Click "Add Task" to create your first task.
                              </td>
                            </tr>
                          ) : (
                            tasks.map((task) => (
                              <tr key={task.id} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-4">
                                  <div>
                                    <p className="font-medium">{task.title}</p>
                                    {task.description && (
                                      <p className="text-sm text-muted-foreground line-clamp-1">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant="outline">
                                    {taskStatusLabels[task.status]}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge
                                    variant="outline"
                                    className={`${priorityColors[task.priority]} text-white`}
                                  >
                                    {task.priority}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  {task.assignee ? (
                                    <div className="flex items-center">
                                      <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee}`} />
                                        <AvatarFallback>{task.assignee[0]}</AvatarFallback>
                                      </Avatar>
                                      <span>{task.assignee}</span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">Unassigned</span>
                                  )}
                                </td>
                                <td className="py-3 px-4">
                                  {task.dueDate ? (
                                    format(new Date(task.dueDate), "MMM d, yyyy")
                                  ) : (
                                    <span className="text-muted-foreground">No due date</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Task menu</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => openTaskDialog(task)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteTask(task._id)}
                                        className="text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Stats View */}
              <TabsContent value="stats" className="mt-0">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Task Status Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {taskStatuses.map(status => {
                          const count = tasks.filter(t => t.status === status).length
                          const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0

                          return (
                            <div key={status} className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">{taskStatusLabels[status]}</span>
                                <span className="text-sm text-muted-foreground">
                                  {count} tasks ({percentage}%)
                                </span>
                              </div>
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Task Priority Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {["high", "medium", "low"].map(priority => {
                          const count = tasks.filter(t => t.priority === priority).length
                          const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0

                          return (
                            <div key={priority} className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium capitalize">{priority}</span>
                                <span className="text-sm text-muted-foreground">
                                  {count} tasks ({percentage}%)
                                </span>
                              </div>
                              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${priorityColors[priority]}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                          <BarChart className="h-8 w-8 text-primary mb-2" />
                          <span className="text-2xl font-bold">{totalTasks}</span>
                          <span className="text-sm text-muted-foreground">Total Tasks</span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                          <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                          <span className="text-2xl font-bold">{completedTasks}</span>
                          <span className="text-sm text-muted-foreground">Completed Tasks</span>
                        </div>

                        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                          <Flag className="h-8 w-8 text-red-500 mb-2" />
                          <span className="text-2xl font-bold">
                            {tasks.filter(t => t.priority === "high").length}
                          </span>
                          <span className="text-sm text-muted-foreground">High Priority Tasks</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isNewTask ? "Add New Task" : "Edit Task"}</DialogTitle>

          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm font-medium text-red-500">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Optional task description"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={taskStatus}
                  onValueChange={(value) => setTaskStatus(value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {taskStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {taskStatusLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={taskPriority}
                  onValueChange={(value) => setTaskPriority(value)}
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Input
                  id="assignee"
                  value={taskAssignee}
                  onChange={(e) => setTaskAssignee(e.target.value)}
                  placeholder="Optional assignee name"
                />
              </div> */}

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            {!isNewTask && (
              <Button
                variant="destructive"
                onClick={() => currentTask && handleDeleteTask(currentTask._id)}
                type="button"
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleTaskSubmit}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isNewTask ? "Creating..." : "Updating..."}
                  </>
                ) : (
                  isNewTask ? "Create Task" : "Update Task"
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Due Date</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="projectDueDate">Due Date</Label>
            <Input
              id="projectDueDate"
              type="date"
              value={dueState ? format(new Date(dueState), "yyyy-MM-dd") : format(new Date(project.dueDate), "yyyy-MM-dd")}
              onChange={(e) => setDueState(new Date(e.target.value).toISOString())}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDatePickerOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const updatedProject = {
                  ...project,
                  dueDate: dueState,
                  updatedAt: new Date().toISOString()
                };
                setProject(updatedProject);
                updateProject(updatedProject);
                setIsDatePickerOpen(false);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
