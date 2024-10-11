"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Client, Project, Task } from "../types"
import { addClient, updateClient, getClients, addProject, updateProject, getProjects, addTask, updateTask, getTasks } from "../lib/firebaseUtils"

export function TaskManagementAppComponent() {
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedClients = await getClients()
        const fetchedProjects = await getProjects()
        const fetchedTasks = await getTasks()
        setClients(fetchedClients)
        setProjects(fetchedProjects)
        setTasks(fetchedTasks)
      } catch (error) {
        console.error("Error fetching data:", error)
        // Here you might want to set an error state and display it to the user
      }
    }
    fetchData()
  }, [])

  const addClientHandler = async (name: string) => {
    const newClientId = await addClient({ name })
    const newClient: Client = { id: newClientId, name }
    setClients([...clients, newClient])
  }

  const editClientHandler = async (id: string, name: string) => {
    await updateClient(id, { name })
    setClients(clients.map(client => client.id === id ? { ...client, name } : client))
  }

  const addProjectHandler = async (clientId: string, name: string) => {
    const newProjectId = await addProject({ clientId, name })
    const newProject: Project = { id: newProjectId, clientId, name }
    setProjects([...projects, newProject])
  }

  const editProjectHandler = async (id: string, name: string) => {
    await updateProject(id, { name })
    setProjects(projects.map(project => project.id === id ? { ...project, name } : project))
  }

  const addTaskHandler = async (projectId: string, name: string, completionDate: Date) => {
    const newTaskId = await addTask({ projectId, name, completionDate })
    const newTask: Task = { id: newTaskId, projectId, name, completionDate }
    setTasks([...tasks, newTask])
  }

  const editTaskHandler = async (id: string, name: string, completionDate: Date) => {
    await updateTask(id, { name, completionDate })
    setTasks(tasks.map(task => task.id === id ? { ...task, name, completionDate } : task))
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter(
      (task) =>
        task.completionDate.getDate() === date.getDate() &&
        task.completionDate.getMonth() === date.getMonth() &&
        task.completionDate.getFullYear() === date.getFullYear()
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Task Management App</h1>
      <Tabs defaultValue="clients">
        <TabsList>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="clients">
          <ClientForm onAddClient={addClientHandler} />
          <ClientList clients={clients} onEditClient={editClientHandler} />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectForm clients={clients} onAddProject={addProjectHandler} />
          <ProjectList projects={projects} clients={clients} onEditProject={editProjectHandler} />
        </TabsContent>
        <TabsContent value="tasks">
          <TaskForm projects={projects} onAddTask={addTaskHandler} />
          <TaskList tasks={tasks} projects={projects} onEditTask={editTaskHandler} />
        </TabsContent>
        <TabsContent value="calendar">
          <div className="flex">
            <div className="w-1/2 pr-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            <div className="w-1/2 pl-4">
              <h2 className="text-lg font-semibold mb-2">Tasks for {selectedDate?.toDateString()}</h2>
              <TaskList tasks={getTasksForDate(selectedDate || new Date())} projects={projects} onEditTask={editTaskHandler} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ClientForm({ onAddClient }: { onAddClient: (name: string) => void }) {
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onAddClient(name.trim())
      setName("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <Label htmlFor="clientName">Client Name</Label>
      <div className="flex mt-1">
        <Input
          id="clientName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter client name"
        />
        <Button type="submit" className="ml-2">Add Client</Button>
      </div>
    </form>
  )
}

function ClientList({ clients, onEditClient }: { clients: Client[], onEditClient: (id: string, name: string) => void }) {
  return (
    <ScrollArea className="h-[200px]">
      {clients.map((client) => (
        <Card key={client.id} className="mb-2">
          <CardHeader>
            <CardTitle>{client.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <EditClientDialog client={client} onEditClient={onEditClient} />
          </CardContent>
        </Card>
      ))}
    </ScrollArea>
  )
}

function EditClientDialog({ client, onEditClient }: { client: Client, onEditClient: (id: string, name: string) => void }) {
  const [name, setName] = useState(client.name)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onEditClient(client.id, name.trim())
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Label htmlFor="editClientName">Client Name</Label>
          <Input
            id="editClientName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 mb-2"
          />
          <Button type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ProjectForm({ clients, onAddProject }: { clients: Client[], onAddProject: (clientId: string, name: string) => void }) {
  const [clientId, setClientId] = useState("")
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (clientId && name.trim()) {
      onAddProject(clientId, name.trim())
      setName("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-2">
        <Label htmlFor="clientSelect">Select Client</Label>
        <select
          id="clientSelect"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>
      <Label htmlFor="projectName">Project Name</Label>
      <div className="flex mt-1">
        <Input
          id="projectName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name"
        />
        <Button type="submit" className="ml-2">Add Project</Button>
      </div>
    </form>
  )
}

function ProjectList({ projects, clients, onEditProject }: { projects: Project[], clients: Client[], onEditProject: (id: string, name: string) => void }) {
  return (
    <ScrollArea className="h-[200px]">
      {projects.map((project) => {
        const client = clients.find((c) => c.id === project.clientId)
        return (
          <Card key={project.id} className="mb-2">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardContent>Client: {client?.name}</CardContent>
            </CardHeader>
            <CardContent>
              <EditProjectDialog project={project} onEditProject={onEditProject} />
            </CardContent>
          </Card>
        )
      })}
    </ScrollArea>
  )
}

function EditProjectDialog({ project, onEditProject }: { project: Project, onEditProject: (id: string, name: string) => void }) {
  const [name, setName] = useState(project.name)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onEditProject(project.id, name.trim())
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Label htmlFor="editProjectName">Project Name</Label>
          <Input
            id="editProjectName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 mb-2"
          />
          <Button type="submit">Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function TaskForm({ projects, onAddTask }: { projects: Project[], onAddTask: (projectId: string, name: string, completionDate: Date) => void }) {
  const [projectId, setProjectId] = useState("")
  const [name, setName] = useState("")
  const [completionDate, setCompletionDate] = useState<Date | undefined>(new Date())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (projectId && name.trim() && completionDate) {
      onAddTask(projectId, name.trim(), completionDate)
      setName("")
      setCompletionDate(new Date())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="mb-2">
        <Label htmlFor="projectSelect">Select Project</Label>
        <select
          id="projectSelect"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>{project.name}</option>
          ))}
        </select>
      </div>
      <Label htmlFor="taskName">Task Name</Label>
      <Input
        id="taskName"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter task name"
        className="mb-2"
      />
      <Label htmlFor="completionDate">Completion Date</Label>
      <Calendar
        mode="single"
        selected={completionDate}
        onSelect={setCompletionDate}
        className="rounded-md border mb-2"
      />
      <Button type="submit">Add Task</Button>
    </form>
  )
}

function TaskList({ tasks, projects, onEditTask }: { tasks: Task[], projects: Project[], onEditTask: (id: string, name: string, completionDate: Date) => void }) {
  return (
    <ScrollArea className="h-[200px]">
      {tasks.map((task) => {
        const project = projects.find((p) => p.id === task.projectId)
        return (
          <Card key={task.id} className="mb-2">
            <CardHeader>
              <CardTitle>{task.name}</CardTitle>
              <CardContent>
                Project: {project?.name}<br />
                Completion Date: {task.completionDate.toDateString()}
              </CardContent>
            </CardHeader>
            <CardContent>
              <EditTaskDialog task={task} onEditTask={onEditTask} />
            </CardContent>
          </Card>
        )
      })}
    </ScrollArea>
  )
}

function EditTaskDialog({ task, onEditTask }: { task: Task, onEditTask: (id: string, name: string, completionDate: Date) => void }) {
  const [name, setName] = useState(task.name)
  const [completionDate, setCompletionDate] = useState<Date | undefined>(task.completionDate)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && completionDate) {
      onEditTask(task.id, name.trim(), completionDate)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Label htmlFor="editTaskName">Task Name</Label>
          <Input
            id="editTaskName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 mb-2"
          />
          <Label htmlFor="editCompletionDate">Completion Date</Label>
          <Calendar
            mode="single"
            selected={completionDate}
            onSelect={setCompletionDate}
            className="rounded-md border mb-2"
          />
          <Button type="submit">Save  Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}