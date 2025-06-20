"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, StopCircle, RotateCcw, Clock, TimerIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function ProjectTimer({ projectId, taskId, onSaveTimeEntry }) {
  // Timer state
  const [isRunning, setIsRunning] = useState(false)
  const [timerMode, setTimerMode] = useState("stopwatch")
  const [elapsedTime, setElapsedTime] = useState(0)
  const [countdownTime, setCountdownTime] = useState(25 * 60) // Default 25 minutes
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [description, setDescription] = useState("")

  // Refs
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const originalTitleRef = useRef(null)
  const [startTime, setStartTime] = useState(null)
  const [pausedTime, setPausedTime] = useState(0)

  const [pauseStartTime, setPauseStartTime] = useState(null)
  const [totalPauseDuration, setTotalPauseDuration] = useState(0)

  // Store original title on mount
  useEffect(() => {
    originalTitleRef.current = document.title
    return () => {
      // Restore original title on unmount
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current
      }
    }
  }, [])

  // Update document title when timer is running
  useEffect(() => {
    if (isRunning) {
      const updateTitle = () => {
        const currentTime = timerMode === "stopwatch" ? elapsedTime : countdownTime
        const timeString = formatTime(currentTime)
        const status = timerMode === "stopwatch" ? "Recording" : "Countdown"
        document.title = `⏱️ ${status}: ${timeString} - PlanWisr`
      }
      
      // Update immediately
      updateTitle()
      
      // Update every second while running
      const titleInterval = setInterval(updateTitle, 1000)
      
      return () => clearInterval(titleInterval)
    } else {
      // Restore original title when not running
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current
      }
    }
  }, [isRunning, elapsedTime, countdownTime, timerMode])

  // Format time as HH:MM:SS
  const formatTime = (timeInSeconds) => {
    const hrs = Math.floor(timeInSeconds / 3600)
    const mins = Math.floor((timeInSeconds % 3600) / 60)
    const secs = timeInSeconds % 60

    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Update the startTimer function to handle resume after pause
  const startTimer = () => {
    if (!isRunning) {
      const now = new Date()
      
      // If this is a resume after pause, calculate pause duration
      if (pauseStartTime) {
        const pauseDuration = Math.floor((now - pauseStartTime) / 1000)
        setTotalPauseDuration(prev => prev + pauseDuration)
        setPauseStartTime(null)
      }

      startTimeRef.current = startTimeRef.current || now
      setStartTime(now)
      setIsRunning(true)

      timerRef.current = setInterval(() => {
        if (timerMode === "stopwatch") {
          const currentTime = new Date()
          const timeDiff = Math.floor((currentTime - now) / 1000) + pausedTime
          setElapsedTime(timeDiff)
        } else {
          setCountdownTime((prev) => {
            if (prev <= 1) {
              stopTimer()
              return 0
            }
            return prev - 1
          })
        }
      }, 1000)
    }
  }

  // Update the pauseTimer function
  const pauseTimer = () => {
    if (isRunning && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
      setIsRunning(false)
      setPauseStartTime(new Date()) // Record when we paused
      setPausedTime(elapsedTime)
    }
  }

  // Stop the timer and open dialog
  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setIsRunning(false)
    setIsDialogOpen(true)
  }

  // Update the resetTimer function
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setIsRunning(false)
    setStartTime(null)
    setPausedTime(0)
    startTimeRef.current = null
    setPauseStartTime(null)
    setTotalPauseDuration(0)
    
    if (timerMode === "stopwatch") {
      setElapsedTime(0)
    } else {
      const totalSeconds = hours * 3600 + minutes * 60 + seconds
      setCountdownTime(totalSeconds > 0 ? totalSeconds : 25 * 60)
    }
  }

  // Update the saveTimeEntry function
  const saveTimeEntry = () => {
    if (!startTimeRef.current) return;

    const endTime = new Date();
    let duration;

    if (timerMode === "stopwatch") {
      // Calculate duration excluding pause time
      duration = Math.floor((endTime - startTimeRef.current) / 1000) - totalPauseDuration;
    } else {
      // For countdown, use the set time minus remaining time
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      const remainingTime = countdownTime;
      duration = totalSeconds - remainingTime;
    }

    const timeEntry = {
      projectId,
      taskId,
      startTime: startTimeRef.current.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      description,
      mode: timerMode,
    };

    onSaveTimeEntry(timeEntry);

    // Reset state
    setDescription("");
    resetTimer();
    setIsDialogOpen(false);
  };

  // Update countdown time when hours, minutes, or seconds change
  useEffect(() => {
    if (!isRunning && timerMode === "countdown") {
      const totalSeconds = hours * 3600 + minutes * 60 + seconds
      setCountdownTime(totalSeconds)
    }
  }, [hours, minutes, seconds, isRunning, timerMode])

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return (
    <>
      <Card style={{
        height: "300px"
      }} className="!h-72 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Project Timer
            {isRunning && (
              <span className="ml-2 text-sm text-red-500 animate-pulse">
                ● Recording
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stopwatch" onValueChange={(value) => setTimerMode(value)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="stopwatch" disabled={isRunning}>
                <Clock className="mr-2 h-4 w-4" />
                Stopwatch
              </TabsTrigger>
              <TabsTrigger value="countdown" disabled={isRunning}>
                <TimerIcon className="mr-2 h-4 w-4" />
                Countdown
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stopwatch" className="space-y-4">
              <div className="flex justify-center items-center py-8">
                <div className="text-4xl font-mono font-bold">{formatTime(elapsedTime)}</div>
              </div>
            </TabsContent>

            <TabsContent value="countdown" className="space-y-4">
              {isRunning ? (
                <div className="flex justify-center items-center py-8">
                  <div className="text-4xl font-mono font-bold">{formatTime(countdownTime)}</div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      max="23"
                      value={hours}
                      onChange={(e) => setHours(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minutes">Minutes</Label>
                    <Input
                      id="minutes"
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => setMinutes(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seconds">Seconds</Label>
                    <Input
                      id="seconds"
                      type="number"
                      min="0"
                      max="59"
                      value={seconds}
                      onChange={(e) => setSeconds(Number.parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {isRunning ? (
              <Button disabled={true} variant="outline">
                <Pause className="mr-2 h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600  hover:bg-primary/90" onClick={startTimer}>
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetTimer} disabled={isRunning && timerMode === "countdown"}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="destructive"
              onClick={stopTimer}
              disabled={
                !isRunning &&
                (timerMode === "stopwatch"
                  ? elapsedTime === 0
                  : countdownTime === hours * 3600 + minutes * 60 + seconds)
              }
            >
              <StopCircle className="mr-2 h-4 w-4" />
              Stop
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Dialog for time entry description */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Your Activity</DialogTitle>
            <DialogDescription>
              You tracked{" "}
              {timerMode === "stopwatch"
                ? formatTime(elapsedTime)
                : formatTime(hours * 3600 + minutes * 60 + seconds - countdownTime)}
              . What did you work on during this time?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you worked on..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                resetTimer()
              }}
            >
              Discard
            </Button>
            <Button onClick={saveTimeEntry} className="bg-gradient-to-r from-indigo-600 to-purple-600">
              Save Time Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}