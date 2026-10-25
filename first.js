
const todoForm = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const message = document.getElementById("message");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = [];
let currentFilter = "all";

// Get tasks from the server
async function getTasks() {
    try {
        const response = await fetch("/api/tasks");

        if (!response.ok) {
            throw new Error("Could not get tasks");
        }

        tasks = await response.json();
        showTasks();
    } catch (error) {
        message.textContent = "Server connection failed. Please start the server.";
    }
}

// Display tasks on the website
function showTasks() {
    taskList.innerHTML = "";

    let visibleTasks = tasks;

    if (currentFilter === "pending") {
        visibleTasks = tasks.filter(function(task) {
            return !task.done;
        });
    } else if (currentFilter === "completed") {
        visibleTasks = tasks.filter(function(task) {
            return task.done;
        });
    }

    taskCount.textContent =
        tasks.filter(function(task) {
            return !task.done;
        }).length + " pending task(s)";

    if (visibleTasks.length === 0) {
        const emptyMessage = document.createElement("li");
        emptyMessage.textContent = "No tasks to show.";
        emptyMessage.className = "task";
        taskList.appendChild(emptyMessage);
        return;
    }

    visibleTasks.forEach(function(task) {
        const li = document.createElement("li");
        li.className = "task";

        if (task.done) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.done;

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        // Mark a task as completed or pending
        checkbox.addEventListener("change", function() {
            updateTask(task.id, checkbox.checked);
        });

        // Delete a task
        deleteButton.addEventListener("click", function() {
            deleteTask(task.id);
        });

        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(deleteButton);

        taskList.appendChild(li);
    });
}

// Add a new task
todoForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        message.textContent = "Please enter a task.";
        return;
    }

    try {
        const response = await fetch("/api/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: taskText
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Could not add task");
        }

        taskInput.value = "";
        message.textContent = "Task added successfully!";
        await getTasks();
    } catch (error) {
        message.textContent = "Could not add task. Please try again.";
    }
});

// Update task completion
async function updateTask(id, done) {
    try {
        const response = await fetch("/api/tasks/" + id, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                done: done
            })
        });

        if (!response.ok) {
            throw new Error("Could not update task");
        }

        await getTasks();
    } catch (error) {
        message.textContent = "Could not update task.";
        await getTasks();
    }
}

// Delete a task
async function deleteTask(id) {
    try {
        const response = await fetch("/api/tasks/" + id, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Could not delete task");
        }

        message.textContent = "Task deleted.";
        await getTasks();
    } catch (error) {
        message.textContent = "Could not delete task.";
    }
}

// Change the task filter
filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(function(item) {
            item.classList.remove("active");
        });

        button.classList.add("active");
        showTasks();
    });
});

// Load tasks when the page opens
getTasks();
