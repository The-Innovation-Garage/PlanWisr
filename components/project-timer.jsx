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

  // Format time as HH:MM:SS
  const formatTime = (timeInSeconds) => {
    const hrs = Math.floor(timeInSeconds / 3600)
    const mins = Math.floor((timeInSeconds % 3600) / 60)
    const secs = timeInSeconds % 60

    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Start the timer
  const startTimer = () => {
    if (!isRunning) {
      startTimeRef.current = new Date()
      setIsRunning(true)

      timerRef.current = setInterval(() => {
        if (timerMode === "stopwatch") {
          setElapsedTime((prev) => prev + 1)
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

  // Pause the timer
  const pauseTimer = () => {
    if (isRunning && timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
      setIsRunning(false)
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

  // Reset the timer
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setIsRunning(false)
    if (timerMode === "stopwatch") {
      setElapsedTime(0)
    } else {
      const totalSeconds = hours * 3600 + minutes * 60 + seconds
      setCountdownTime(totalSeconds > 0 ? totalSeconds : 25 * 60)
    }
    startTimeRef.current = null
  }

  const saveTimeEntry = () => {
    if (!startTimeRef.current) return;
  
    const endTime = new Date();
    let duration;
  
    if (timerMode === "stopwatch") {
      // Calculate duration for stopwatch mode
      duration = elapsedTime;
    } else {
      // Calculate duration for countdown mode
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  
  
      // Ensure duration is not negative or undefined
      duration = Math.max(totalSeconds, 0);
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Project Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stopwatch" onValueChange={(value) => setTimerMode(value)}>
            <TabsList className="grid w-full grid-cols-2">
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
              <Button variant="outline" onClick={pauseTimer}>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
            ) : (
              <Button className="bg-primary hover:bg-primary/90" onClick={startTimer}>
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
            <Button onClick={saveTimeEntry} className="bg-primary hover:bg-primary/90">
              Save Time Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

