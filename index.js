const express = require('express')
const cors = require('cors')
const {v4:uuidv4} = require('uuid')
const sqlite3 = require('sqlite3').verbose()
const dbSource = "todo.db"
const db = new sqlite3.Database(dbSource)
const HTTP_PORT = 8000

var app = express()
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
                res.status(400).json({error: err.message})
            }
            else {
                res.status(201).json({message: "success", task: newTask})
            }
        })
    }
})

app.get('/task', (req, res) => {
    let strCommand = 'SELECT * FROM tblTasks'
    db.all(strCommand, (err, rows) => {
        if(err) {
            res.status(400).json({error: err.message})
        }
        else {
            res.status(200).json({message:"success", tasks:rows})
        }
    })
})

app.patch('/task', (req, res) => {
    let taskID = req.body.TaskID
    let newStatus = req.body.Status
    if(taskID && newStatus) {
        let strCommand = 'UPDATE tblTasks SET Status = ? WHERE TaskID = ?'
        db.run(strCommand, [newStatus, taskID], (err) => {
            if(err) {
                res.status(400).json({error: err.message})
            }
            else {
                res.status(200).json({message: "Status Updated!"})
            }
        })
    }
})

app.delete('/task', (req, res) => {
    let taskID = req.query.TaskID
    if(taskID) {
        db.run('DELETE FROM tblTasks WHERE TaskID = ?', [taskID], (err) => {
            if(err) {
                res.status(400).json({error: err.message})
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