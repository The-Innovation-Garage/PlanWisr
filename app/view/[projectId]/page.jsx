'use client'

import { useState, useEffect, use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Calendar, AlertTriangle } from "lucide-react"

// Status and priority configurations
const statusColors = {
  'not-started': 'bg-slate-500',
  'in-progress': 'bg-blue-500',
  'done': 'bg-green-500'
}

const priorityColors = {
  'low': 'bg-green-500',
  'medium': 'bg-yellow-500',
  'high': 'bg-red-500'
}

export default function ProjectViewPage({ params }) {
    const {projectId} = use(params);
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
    const [totalTasks, setTotalTasks] = useState(0)
    const [completedTasks, setCompletedTasks] = useState(0)
    const [totalProgress, setTotalProgress] = useState(0)
    const [inProgressTasks, setInProgressTasks] = useState(0)


  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch(`/api/project/client-view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ projectId: projectId })
        })
        const data = await response.json()
        
        if (data.type === 'success') {
          setProject(data.project)
          setTasks(data.tasks)
            // Calculate task statistics
  const TotalTasks = data.tasks.length
  const CompletedTasks = data.tasks.filter(task => task.status === 'done').length
  const InProgressTasks = data.tasks.filter(task => task.status === 'in-progress').length

            setTotalTasks(TotalTasks)
            setCompletedTasks(CompletedTasks)
            setInProgressTasks(InProgressTasks)

            const percentage = (CompletedTasks / TotalTasks) * 100;
            const formatted = percentage.toFixed(2);
            setTotalProgress(formatted);
        }
      } catch (error) {
        console.error('Error fetching project:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [projectId])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!project) {
    return <div className="flex items-center justify-center min-h-screen">Project not found</div>
  }



  return (
    <main className="container mx-auto py-8 px-4">
      {/* Project Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
        <p className="text-muted-foreground mb-4">{project.description}</p>
        
        <div className="flex flex-wrap gap-4 mb-6">
          <Badge variant="outline" className="text-sm">
            Due: {new Date(project.dueDate).toLocaleDateString()}
          </Badge>
          <Badge variant="outline" className="text-sm capitalize">
            Status: {project.status}
          </Badge>
          <Badge variant="outline" className="text-sm capitalize">
            Priority: {project.priority}
          </Badge>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Project Progress</span>
              <span className="text-sm font-medium">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Task Statistics */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Total Tasks</h3>
              <span className="text-2xl font-bold">{totalTasks}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">In Progress</h3>
              <span className="text-2xl font-bold">{inProgressTasks}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Completed</h3>
              <span className="text-2xl font-bold">{completedTasks}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium mb-1">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Badge variant="outline" className="capitalize">
                        {task.status}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`capitalize ${priorityColors[task.priority]}`}
                      >
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tasks have been created yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}