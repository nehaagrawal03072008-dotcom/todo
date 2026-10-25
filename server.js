
const express = require("express");
const app = express();

const PORT = 3000;

// Allow the server to read JSON data
app.use(express.json());

// Serve HTML, CSS and browser JavaScript
app.use(express.static(__dirname));

// Store tasks temporarily in server memory
let tasks = [];
let nextId = 1;

// Get all tasks
app.get("/api/tasks", function(req, res) {
    res.json(tasks);
});

// Add a new task
app.post("/api/tasks", function(req, res) {
    const text = req.body.text;

    if (typeof text !== "string" || text.trim() === "") {
        return res.status(400).json({
            error: "Task text is required"
        });
    }

    const newTask = {
        id: nextId,
        text: text.trim(),
        done: false
    };

    nextId++;

    tasks.push(newTask);

    res.status(201).json(newTask);
});

// Update a task
app.patch("/api/tasks/:id", function(req, res) {
    const id = Number(req.params.id);
    const task = tasks.find(function(item) {
        return item.id === id;
    });

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    if (typeof req.body.done !== "boolean") {
        return res.status(400).json({
            error: "Completion status must be true or false"
        });
    }

    task.done = req.body.done;

    res.json(task);
});

// Delete a task
app.delete("/api/tasks/:id", function(req, res) {
    const id = Number(req.params.id);
    const oldLength = tasks.length;

    tasks = tasks.filter(function(task) {
        return task.id !== id;
    });

    if (tasks.length === oldLength) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    res.json({
        message: "Task deleted successfully"
    });
});

// Start the server
app.listen(PORT, function() {
    console.log("Server is running at http://localhost:" + PORT);
});
