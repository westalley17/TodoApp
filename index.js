const express = require('express')
const cors = require('cors')
const {v4:uuidv4} = require('uuid')
const sqlite3 = require('sqlite3').verbose()
const dbSource = "todo.db"
const db = new sqlite3.Database(dbSource)
const HTTP_PORT = 8000

var app = express()
app.use(express.json())
app.use(cors())

class Task {
    constructor(TaskName, DueDate, Location, Instructions, Status, TaskID) {
        this.TaskName = TaskName
        this.DueDate = DueDate
        this.Location = Location
        this.Instructions = Instructions
        this.Status = Status
        this.TaskID = TaskID
    }
}

app.post('/task', (req, res) => {
    let TaskName = req.body.TaskName
    let DueDate = req.body.DueDate
    let Location = req.body.Location
    let Instructions = req.body.Instructions
    let Status = req.body.Status
    if(TaskName && DueDate && Location && Instructions && Status)
    {
        let TaskID = uuidv4()
        let newTask = new Task(TaskName, DueDate, Location, Instructions, Status, TaskID)
        let arrTaskVal = [TaskName, DueDate, Location, Instructions, Status, TaskID]
        db.run(`INSERT INTO tblTasks values (?, ?, ?, ?, ?, ?)`, arrTaskVal, (err) => {
            if(err) {
                res.status(400).json({message: err.message})
            }
            else {
                res.status(201).json({message: "Success!", task: newTask})
            }
        })
    }
})

app.get('/task', (req, res) => {
    let strCommand = 'SELECT * FROM tblTasks'
    db.all(strCommand, (err, rows) => {
        if(err) {
            res.status(400).json({message: err.message})
        }
        else {
            res.status(200).json({message:"Success!", tasks:rows})
        }
    })
})

app.get('/status', (req, res) => {
    let strTaskID = req.query.TaskID
    let strCommand = 'SELECT Status FROM tblTasks WHERE TaskID = ?'
    db.get(strCommand, strTaskID, (err, response) => {
        console.log(response)
        if(err) {
            res.status(400).json({message: err.message})
        }
        else {
            if(response.Status == 'Incomplete') {
                res.status(200).json({message:"Success!", status: 'Complete'})
            }
            else {
                res.status(200).json({message:"Success!", status: 'Incomplete'})
            }
        }
    })
})

app.patch('/task', (req, res) => {
    let taskID = req.body.TaskID
    let status = req.body.Status
    if(taskID && status) {
        let strCommand = 'UPDATE tblTasks SET Status = ? WHERE TaskID = ?'
        db.run(strCommand, [status, taskID], (err) => {
            if(err) {
                res.status(400).json({message: err.message})
            }
            else {
                res.status(200).json({message: "Status Updated!"})
            }
        })
    }
})

app.delete('/task', (req, res) => {
    let taskID = req.body.TaskID
    if(taskID) {
        db.run('DELETE FROM tblTasks WHERE TaskID = ?', [taskID], (err) => {
            if(err) {
                res.status(400).json({message: err.message})
            }
            else {
                res.status(200).json({message: 'Task Deleted!'})
            }
        })
    }
})

app.listen(HTTP_PORT, () => {
    console.log(`Listening on port ${HTTP_PORT}`)
})