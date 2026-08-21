// Beim Laden der Seite To-Dos abrufen
document.addEventListener('DOMContentLoaded', loadTodos);

// Globalen Speicher für EventSource vom Kalender vorhalten
let todoEventSource = null;

// 1. Hauptfunktion zum Laden & Rendern
function renderCalendarAndTodos() {
    fetch('/api/todos')
        .then(res => res.json())
        .then(todos => {
            // Liste im HTML rendern
            renderTodoList(todos);

            // To-Dos als Events in FullCalendar einbinden
            if (window.calendar) {
                const todoEvents = todos
                    .filter(todo => todo.due_date && todo.due_date !== "")
                    .map(todo => ({
                        id: 'todo-' + todo.id,
                        title: `☑ ${todo.title}`,
                        start: todo.due_date,
                        backgroundColor: todo.done ? '#95a5a6' : '#e67e22',
                        borderColor: '#d35400'
                    }));

                if (todoEventSource) {
                    todoEventSource.remove();
                }
                todoEventSource = window.calendar.addEventSource(todoEvents);
            }
        })
        .catch(err => console.error("Fehler beim Laden der To-Dos:", err));
}

// 2. Hilfsfunktion für die HTML-Liste
function renderTodoList(todos) {
    const list = document.getElementById('todo-list');
    if (!list) return;
    
    list.innerHTML = '';
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding: 8px; background: #f4f4f4; border-radius: 4px;";
        
        const dateText = todo.due_date ? ` <i>(${todo.due_date})</i>` : '';
        
        li.innerHTML = `
            <span style="text-decoration: ${todo.done ? 'line-through' : 'none'}; cursor: pointer;" onclick="toggleTodo(${todo.id})">
                <strong>[${todo.category}]</strong> ${todo.title}${dateText}
            </span>
            <button onclick="deleteTodo(${todo.id})" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Löschen</button>
        `;
        list.appendChild(li);
    });
}

// 3. Beim Laden der Seite aufrufen
document.addEventListener('DOMContentLoaded', () => {
    renderCalendarAndTodos();
});

function loadTodos() {
    fetch('/api/todos')
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById('todo-list');
            list.innerHTML = '';
            
            data.forEach(todo => {
                const li = document.createElement('li');
                li.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding: 8px; background: #f4f4f4; border-radius: 4px;";
                
                li.innerHTML = `
                    <span style="text-decoration: ${todo.done ? 'line-through' : 'none'}; cursor: pointer;" onclick="toggleTodo(${todo.id})">
                        <strong>[${todo.category}]</strong> ${todo.title}
                    </span>
                    <button onclick="deleteTodo(${todo.id})" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Löschen</button>
                `;
                list.appendChild(li);
            });
        });
}

function addTodo() {
    const titleEl = document.getElementById('todo-input');
    const categoryEl = document.getElementById('todo-category');
    const dueDateEl = document.getElementById('todo-duedate');
    const dueTimeEl = document.getElementById('todo-duetime');

    if (!titleEl) return;

    const title = titleEl.value;
    const category = categoryEl ? categoryEl.value : 'Allgemein';
    const dueDate = dueDateEl ? dueDateEl.value : '';
    const dueTime = dueTimeEl ? dueTimeEl.value : '';

    // Falls Zeit angegeben ist, ISO-Format bauen (z.B. 2026-08-25T14:30:00)
    let fullDueDate = dueDate;
    if (dueDate && dueTime) {
        fullDueDate = `${dueDate}T${dueTime}:00`;
    }

    fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, dueDate: fullDueDate })
    }).then(() => {
        titleEl.value = '';
        if (dueTimeEl) dueTimeEl.value = '';
        renderCalendarAndTodos();
    });
}

function toggleTodo(id) {
    fetch(`/api/todos/${id}/toggle`, { method: 'POST' })
        .then(() => loadTodos());
}

function deleteTodo(id) {
    fetch(`/api/todos/${id}`, { method: 'DELETE' })
        .then(() => loadTodos());
}