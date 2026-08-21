// Globaler Speicher für To-Do-EventSource im Kalender
let todoEventSource = null;

document.addEventListener('DOMContentLoaded', () => {
    const calendarEl = document.getElementById('calendar');

    if (calendarEl) {
        // Einzige Kalender-Instanz initialisieren
        window.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'de',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            },
            selectable: true,
            editable: true,
            eventDrop: function(info) {
                // Entfernt "todo-" aus der ID (z. B. "todo-1" -> "1")
                const todoId = info.event.id.replace('todo-', '');
                const newDueDate = info.event.startStr.split('T')[0];

                fetch(`/api/todos/${todoId}`, {  // Ruft jetzt /api/todos/1 auf
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        dueDate: newDueDate
                    })
                })
                .then(response => {
                    if (response.ok) {
                        // Liste und Kalenderdaten synchronisieren
                        renderCalendarAndTodos();
                    } else {
                        alert('Fehler beim Aktualisieren des Datums');
                        info.revert();
                    }
                })
                .catch(error => {
                    console.error('Netzwerkfehler:', error);
                    info.revert();
                });
            },
            
            // Klick auf ein Datum im Kalender -> Event erstellen
            dateClick: function(info) {
                const title = prompt(`Neues Event am ${info.dateStr} eingeben:`);
                if (!title) return;

                const category = prompt("Kategorie (z. B. Uni, Familie, Freunde):", "Uni");

                fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title,
                        date: info.dateStr,
                        category: category || 'Allgemein'
                    })
                })
                .then(response => {
                    if (response.ok) {
                        window.calendar.refetchEvents();
                    } else {
                        alert("Fehler beim Speichern des Events.");
                    }
                });
            },

            // Normales Laden von Kalenderevents aus dem C++ Backend
            events: function(fetchInfo, successCallback, failureCallback) {
                fetch('/api/events')
                    .then(res => res.json())
                    .then(data => {
                        let events = data.map(item => ({
                            id: item.id,
                            title: `[${item.category}] ${item.title}`,
                            start: item.date
                        }));
                        successCallback(events);
                    })
                    .catch(err => failureCallback(err));
            }
        });

        window.calendar.render();
    }

    // Nach dem Kalender-Start To-Dos abrufen und eintragen
    renderCalendarAndTodos();
});

// Hauptfunktion zum Laden von To-Dos & Aktualisieren der Anzeige
function renderCalendarAndTodos() {
    fetch('/api/todos')
        .then(res => res.json())
        .then(todos => {
            // 1. HTML-Liste aktualisieren
            renderTodoList(todos);

            // 2. To-Dos im Kalender anzeigen
            if (window.calendar && typeof window.calendar.addEventSource === 'function') {
                const todoEvents = todos
                    .filter(todo => todo.due_date && todo.due_date !== "")
                    .map(todo => ({
                        id: 'todo-' + todo.id,
                        title: `☑ ${todo.title}`,
                        start: todo.due_date,
                        backgroundColor: todo.done ? '#95a5a6' : '#e67e22',
                        borderColor: '#d35400'
                    }));

                // Alte To-Do-Quelle entfernen, wenn vorhanden
                if (todoEventSource) {
                    todoEventSource.remove();
                }

                // Neue To-Do-Quelle im Kalender registrieren
                todoEventSource = window.calendar.addEventSource(todoEvents);
            }
        })
        .catch(err => console.error("Fehler beim Laden der To-Dos:", err));
}

// Hilfsfunktion: Rendert die To-Do-Elemente in der HTML-Liste
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

// Interaktions-Funktionen
function addTodo() {
    const titleEl = document.getElementById('todo-input');
    const categoryEl = document.getElementById('todo-category');
    const dueDateEl = document.getElementById('todo-duedate');

    if (!titleEl) return;

    const title = titleEl.value;
    const category = categoryEl ? categoryEl.value : 'Allgemein';
    const dueDate = dueDateEl ? dueDateEl.value : '';

    fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, dueDate })
    }).then(() => {
        titleEl.value = '';
        renderCalendarAndTodos();
    });
}

function toggleTodo(id) {
    fetch(`/api/todos/${id}/toggle`, { method: 'POST' })
        .then(() => renderCalendarAndTodos());
}

function deleteTodo(id) {
    fetch(`/api/todos/${id}`, { method: 'DELETE' })
        .then(() => renderCalendarAndTodos());
}