"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function DashboardPage() {
  const [tasks, setTasks] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskProject, setTaskProject] = useState("")
  const [taskDate, setTaskDate] = useState("")
  const [projects, setProjects] = useState([])
  const router = useRouter()

  useEffect(() => {
    fetchTasks()
    fetchProjects()
  }, [])

  const fetchTasks = async () => {
    try {
      const req = await fetch("/api/task/get-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const res = await req.json()

      const calendarTasks = res.tasks.map((task) => ({
        id: task._id,
        title: task.title,
        start: task.dueDate,
        extendedProps: {
          description: task.description,
          project: task.project,
          status: task.status,
          priority: task.priority
        },
      }))

      setTasks(calendarTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Failed to load tasks")
    }
  }

  const fetchProjects = async () => {
    try {
      const req = await fetch("/api/project/get-projects", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      })
      const res = await req.json()
      setProjects(res.projects)
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("Failed to load projects")
    }
  }

  const handleDateClick = (arg) => {
    setCurrentTask(null)
    setTaskTitle("")
    setTaskDescription("")
    setTaskProject("")
    setTaskDate(arg.dateStr)
    setIsDialogOpen(true)
  }

  const handleEventClick = (arg) => {
    const task = arg.event
    setCurrentTask(task)
    setTaskTitle(task.title)
    setTaskDescription(task.extendedProps.description)
    setTaskProject(task.extendedProps.project)
    setTaskDate(task.start.toISOString().split('T')[0])
    setIsDialogOpen(true)
  }

  const handleEventDrop = async (arg) => {
    try {
      const req = await fetch("/api/task/update-task-dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          taskId: arg.event.id,
          dueDate: arg.event.start.toISOString(),
        }),
      })

      const res = await req.json()
      if (res.type === "success") {
        toast.success("Task updated successfully")
        fetchTasks()
      } else {
        arg.revert()
        toast.error("Failed to update task")
      }
    } catch (error) {
      console.error("Error updating task:", error)
      arg.revert()
      toast.error("Failed to update task")
    }
  }

  const handleTaskSubmit = async () => {
    if (!taskTitle || !taskProject || !taskDate) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const endpoint = currentTask ? "/api/task/update-task" : "/api/task/add-task"
      const payload = {
        title: taskTitle,
        description: taskDescription,
        project: taskProject,
        dueDate: new Date(taskDate).toISOString(),
        status: "not-started",
        priority: "medium"
      }

      if (currentTask) {
        payload.taskId = currentTask.id
      }

      const req = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      })

      const res = await req.json()
      if (res.type === "success") {
        toast.success(currentTask ? "Task updated successfully" : "Task created successfully")
        fetchTasks()
        setIsDialogOpen(false)
        resetForm()
      } else {
        toast.error(res.message || "Failed to save task")
      }
    } catch (error) {
      console.error("Error saving task:", error)
      toast.error("Failed to save task")
    }
  }

  const resetForm = () => {
    setCurrentTask(null)
    setTaskTitle("")
    setTaskDescription("")
    setTaskProject("")
    setTaskDate("")
  }

  return (
    <main className="flex-1 py-8">
      <div className="container px-4 md:px-6">
        <Card>
          <CardContent className="p-6">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={tasks}
              editable={true}
              selectable={true}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              height="80vh"
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentTask ? "Edit Task" : "Create Task"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Task description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project">Project *</Label>
              <select
                id="project"
                value={taskProject}
                onChange={(e) => setTaskProject(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Due Date *</Label>
              <Input
                id="date"
                type="date"
                value={taskDate}
                onChange={(e) => setTaskDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleTaskSubmit}>
              {currentTask ? "Update Task" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}