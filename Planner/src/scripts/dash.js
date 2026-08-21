// Beim Laden der Seite To-Dos abrufen
document.addEventListener('DOMContentLoaded', loadTodos);

// Globalen Speicher für EventSource vom Kalender vorhalten
let todoEventSource = null;

function renderCalendarAndTodos() {
    fetch('/api/todos')
        .then(res => res.json())
        .then(todos => {
            // 1. Liste aktualisieren
            renderTodoList(todos);

            // 2. To-Dos in FullCalendar-Events umwandeln
            const todoEvents = todos
                .filter(todo => todo.due_date) // Nur To-Dos mit Datum
                .map(todo => ({
                    id: 'todo-' + todo.id,
                    title: `☑ ${todo.title}`,
                    start: todo.due_date,
                    backgroundColor: todo.done ? '#95a5a6' : '#e67e22', // Ausgegraut wenn erledigt
                    borderColor: '#d35400'
                }));

            // 3. Kalender-Events dynamisch erneuern
            if (todoEventSource) {
                todoEventSource.remove();
            }
            todoEventSource = calendar.addEventSource(todoEvents);
        });
}

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
    const title = document.getElementById('todo-input').value;
    const category = document.getElementById('todo-category').value;
    const dueDate = document.getElementById('todo-duedate').value;

    fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, dueDate })
    }).then(() => {
        document.getElementById('todo-input').value = '';
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