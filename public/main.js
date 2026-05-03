const API_URL = '/api/tasks';

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');

let allTasks = [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', fetchTasks);

// Fetch Tasks
async function fetchTasks() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data.success) {
            allTasks = data.data;
            renderTasks();
        }
    } catch (err) {
        console.error('Error fetching tasks:', err);
    }
}

// Render Tasks
function renderTasks() {
    taskList.innerHTML = '';
    
    const filtered = allTasks.filter(task => {
        if (currentFilter === 'pending') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filtered.length === 0) {
        taskList.innerHTML = `<div class="loader">No ${currentFilter === 'all' ? '' : currentFilter} tasks found.</div>`;
        return;
    }

    filtered.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date';
        
        taskEl.innerHTML = `
            <div class="task-info">
                <h3>${task.title}</h3>
                <p>${task.description || 'No description'}</p>
                <div class="task-meta">
                    <span class="category-tag">${task.category}</span>
                    <span class="due-tag">📅 ${dueDate}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="action-btn complete" onclick="toggleComplete('${task._id}', ${task.completed})" title="Mark Complete">
                    ✓
                </button>
                <button class="action-btn edit" onclick="openEditModal('${task._id}')" title="Edit Task">
                    ✎
                </button>
                <button class="action-btn delete" onclick="deleteTask('${task._id}')" title="Delete Task">
                    ✕
                </button>
            </div>
        `;
        taskList.appendChild(taskEl);
    });
}

// Add Task
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskData = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-desc').value,
        dueDate: document.getElementById('task-date').value,
        category: document.getElementById('task-category').value
    };

    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        
        const data = await res.json();
        if (data.success) {
            taskForm.reset();
            fetchTasks();
        } else {
            alert(data.error);
        }
    } catch (err) {
        console.error('Error adding task:', err);
    }
});

// Toggle Complete
async function toggleComplete(id, currentStatus) {
    if (currentStatus) {
        alert('Task is already marked as completed');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: true })
        });
        
        const data = await res.json();
        if (data.success) {
            fetchTasks();
        } else {
            alert(data.error);
        }
    } catch (err) {
        console.error('Error updating task:', err);
    }
}

// Delete Task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        const data = await res.json();
        if (data.success) {
            fetchTasks();
        }
    } catch (err) {
        console.error('Error deleting task:', err);
    }
}

// Edit Modal Logic
function openEditModal(id) {
    const task = allTasks.find(t => t._id === id);
    if (!task) return;

    document.getElementById('edit-id').value = task._id;
    document.getElementById('edit-title').value = task.title;
    document.getElementById('edit-desc').value = task.description || '';
    document.getElementById('edit-date').value = task.dueDate ? task.dueDate.split('T')[0] : '';
    document.getElementById('edit-category').value = task.category;

    editModal.style.display = 'flex';
}

function closeModal() {
    editModal.style.display = 'none';
}

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('edit-id').value;
    const taskData = {
        title: document.getElementById('edit-title').value,
        description: document.getElementById('edit-desc').value,
        dueDate: document.getElementById('edit-date').value,
        category: document.getElementById('edit-category').value
    };

    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        
        const data = await res.json();
        if (data.success) {
            closeModal();
            fetchTasks();
        } else {
            alert(data.error);
        }
    } catch (err) {
        console.error('Error updating task:', err);
    }
});

// Filters
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target == editModal) {
        closeModal();
    }
}
