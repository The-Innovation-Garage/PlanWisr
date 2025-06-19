"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import toast from "react-hot-toast"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from "date-fns"

import { PieChart, Pie, Cell, Legend } from 'recharts'

import { Badge } from "@/components/ui/badge"
import { Edit, Sparkles, DollarSign, Receipt, AlertCircle, Clock } from "lucide-react"
import { useUserStore } from "@/store/store"

export default function DashboardPage() {
  const [tasks, setTasks] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState(null)
  const [taskTitle, setTaskTitle] = useState("")
  const [taskDescription, setTaskDescription] = useState("")
  const [taskProject, setTaskProject] = useState("")
  const [taskDate, setTaskDate] = useState("")
  const [projects, setProjects] = useState([])
  const [hoursData, setHoursData] = useState([])

  // State for projects data for pie chart of time spend per project
  const [projectsData, setProjectsData] = useState([])

  // State for today's tasks
  const [todayTasks, setTodayTasks] = useState([])

  // State for invoice analytics
  const [invoiceData, setInvoiceData] = useState({
    totalInvoices: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    overdueCount: 0,
    overdueTotal: 0
  })


  const [totalTime, setTotalTime] = useState({
    minutes: 0,
    hours: 0,
    remainingMinutes: 0,
    formatted: '0h 0m'
  });

  const {SetAiLimit} = useUserStore()

  const router = useRouter()

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Fetch invoice analytics data
  const getInvoiceData = async () => {
    try {
      const req = await fetch("/api/analytics/get-invoices-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const res = await req.json()
      
      if (res.type === "success") {
        setInvoiceData({
          totalInvoices: res.totalInvoices || 0,
          totalEarnings: res.totalEarnings || 0,
          pendingEarnings: res.pendingEarnings || 0,
          overdueCount: res.overdueCount || 0,
          overdueTotal: res.overdueTotal || 0
        })
      } else {
        console.error("Failed to fetch invoice data:", res.message)
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error)
    }
  }

  const getTodayTasks = async() => {
    try {
      const req = await fetch("/api/task/get-today-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const res = await req.json();

      if (res.type === "success") {
        setTodayTasks(res.tasks)
        console.log(`Today's tasks fetched successfully:`, res.tasks)
      }
      else {
        toast.error(res.message || "Failed to load today's tasks")
      }

    } catch (error) {
      console.error("Error fetching tasks:", error)
      toast.error("Failed to load tasks")
    }
  }

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

  const getHoursData = async() => {
    try {
      const req = await fetch("/api/analytics/get-hours-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
  
      const res = await req.json();
      
      if (res.type === 'success' && res.entries?.length > 0) {
        // Calculate total minutes from all entries
        const totalMinutesOverall = res.entries.reduce((total, entry) => {
          return total + entry.totalMinutes;
        }, 0);
  
        // Convert to hours and minutes for display
        const totalHours = Math.floor(totalMinutesOverall / 60);
        const remainingMinutes = Math.round(totalMinutesOverall % 60);
        
        // Store the total time
        setTotalTime({
          minutes: totalMinutesOverall,
          hours: totalHours,
          remainingMinutes: remainingMinutes,
          formatted: `${totalHours}h ${remainingMinutes}m`
        });
  
        // Get current month's start and end dates
        const dates = res.entries.map(entry => new Date(entry._id));
        const now = new Date();
        const minDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const maxDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); //current day
  
        // Create an array of all dates in the month
        const allDates = [];
        const currentDate = new Date(minDate);
        
        while (currentDate <= maxDate) {
          allDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
  
        // Create a map of existing entries with the date string as key
        const entriesMap = new Map(
          res.entries.map(entry => [
            entry._id, // Use the _id directly since it's already in YYYY-MM-DD format
            entry
          ])
        );
  
        // Format data with zero values for missing dates
        const formattedData = allDates.map(date => {
          const dateKey = format(date, 'yyyy-MM-dd'); // Format to match API's _id format
          const entry = entriesMap.get(dateKey);
  
          if (entry) {
            const totalMinutes = Number(entry.totalMinutes.toFixed(2));
            return {
              date: format(date, 'MMM d'),
              minutes: totalMinutes,
              hours: Math.floor(totalMinutes / 60),
              remainingMinutes: Math.round(totalMinutes % 60)
            };
          }
  
          return {
            date: format(date, 'MMM d'),
            minutes: 0,
            hours: 0,
            remainingMinutes: 0
          };
        });
        
        console.log('Formatted Data with zero values:', formattedData);
        console.log('Total Time Overall:', `${totalHours}h ${remainingMinutes}m`);
        setHoursData(formattedData);
      } else {
        // Set zero values when no data
        setTotalTime({
          minutes: 0,
          hours: 0,
          remainingMinutes: 0,
          formatted: '0h 0m'
        });
      }
    } catch (error) {
      console.error('Error fetching hours data:', error);
      setTotalTime({
        minutes: 0,
        hours: 0,
        remainingMinutes: 0,
        formatted: '0h 0m'
      });
    }
  };

  // Add this custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const { hours, remainingMinutes } = payload[0].payload
      return (
        <div className="bg-background border rounded-lg p-4 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            {hours > 0 ? `${hours}h ` : ''}{remainingMinutes}m
          </p>
        </div>
      )
    }
    return null
  }

  const getProjectsData = async () => {
    try {
      const req = await fetch("/api/analytics/get-projects-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const res = await req.json()
      if (res.type === "success") {
        // Format the data for the pie chart
        const formattedData = res.entries.map(entry => ({
          name: entry.projectName,
          value: Number(entry.totalMinutes.toFixed(2))
        }))
        setProjectsData(formattedData)
      } else {
        toast.error(res.message || "Failed to load projects data")
      }
    } catch (error) {
      console.error("Error fetching projects data:", error)
      toast.error("Failed to load projects data")
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchProjects()
    getHoursData()
    getProjectsData()
    getTodayTasks()
    getInvoiceData() // Add this line
  }, [])

  const taskPrioritize = async () => {
    try {
      toast.loading("Prioritizing tasks with AI...")
      const req = await fetch("/api/ai/prioritize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ tasks: todayTasks }),
      })

      const res = await req.json()
      toast.dismiss()
      if (res.type === "success") {
        toast.success("Tasks prioritized successfully")
        setTodayTasks(res.tasks)
        SetAiLimit(res.remainingLimit)
        console.log("Tasks prioritized successfully:", res.tasks)
        console.log("Remaining AI Limit:", res.remainingLimit)
      } else {
        toast.error(res.message || "Failed to prioritize tasks")
      }
    } catch (error) {
      console.error("Error prioritizing tasks:", error)
      toast.error("Failed to prioritize tasks")
    }
  }

  return (
    <main className="flex-1 py-8">
      <div className="container px-4 md:px-6">
        <h1 style={{
          margin: "40px 0px"
        }} className="my-10 text-center my-10 font-bold text-3xl">Dashboard Overview</h1>
        
        {/* Invoice Analytics Cards */}
        <div className=" grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoiceData.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                All invoices created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(invoiceData.totalEarnings)}
              </div>
              <p className="text-xs text-muted-foreground">
                From paid invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(invoiceData.pendingEarnings)}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{invoiceData.overdueCount}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(invoiceData.overdueTotal)} overdue
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-center my-10 font-bold text-2xl">Your Tasks</h2>
        
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

      {/* Add after the existing bar chart Card */}
      <div style={{
        margin: "20px 0px"
      }} className="container px-4 md:px-6 mt-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Today's Tasks Card */}
          <Card style={{
            maxHeight: "500px",
            minHeight: "500px",
          }} className="overflow-y-auto overflow-x-hidden ">
            <CardContent className="pt-6">
              <div className=" flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Today's Tasks</h2>
                <Button
                  onClick={taskPrioritize}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Prioritize
                </Button>
              </div>
              <div className="h-[400px] overflow-auto">
                {todayTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>No tasks due today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayTasks.map((task) => (
                      <div
                        key={task._id}
                        className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                              </p>
                            )}
                            <Badge className="mt-2" variant="secondary">
                              {task.project ? task.project.title : "No Project"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                              {task.status === 'completed' ? 'Done' : 'Pending'}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setCurrentTask(task);
                                setTaskTitle(task.title);
                                setTaskDescription(task.description);
                                setTaskProject(task.project);
                                setTaskDate(new Date(task.dueDate).toISOString().split('T')[0]);
                                setIsDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Projects Time Distribution Card */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Time Distribution by Project</h2>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={projectsData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        value,
                        name
                      }) => {
                        const RADIAN = Math.PI / 180
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                        const x = cx + radius * Math.cos(-midAngle * RADIAN)
                        const y = cy + radius * Math.sin(-midAngle * RADIAN)

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="currentColor"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                          >
                            {`${name} (${value.toFixed(0)}m)`}
                          </text>
                        )
                      }}
                    >
                      {projectsData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={`hsl(${index * (360 / projectsData.length)}, 70%, 50%)`}
                        />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <h2 className="text-center my-10 font-bold text-2xl">Analytics</h2>

   
    {/* Graph */}
<div className="container px-4 md:px-6">
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Time Tracking Overview</h2>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Time This Month</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
{totalTime.formatted}</p>
        </div>
      </div>
      <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height={400}>
  <BarChart
    data={hoursData}
    margin={{ top: 20, right: 30, left: 40, bottom: 20 }}
  >
    <defs>
  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#4f46e5" />
    <stop offset="100%" stopColor="#9333ea" />
  </linearGradient>
</defs>
    <XAxis 
      dataKey="date"
      tick={{ fill: 'currentColor' }}
    />
    <YAxis 
      tick={{ fill: 'currentColor' }}
      label={{ 
        value: 'Minutes', 
        angle: -90, 
        position: 'insideLeft',
        fill: 'currentColor'
      }}
    />
    <Tooltip content={<CustomTooltip />} />
    <Bar 
      dataKey="minutes" 
      fill="url(#barGradient)"
      radius={[4, 4, 0, 0]}
      name="Time Spent"
    />
  </BarChart>
</ResponsiveContainer>
      </div>
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