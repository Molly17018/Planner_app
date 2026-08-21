// 1. Globale Variablen sicher initialisieren
if (typeof todoEventSource === 'undefined') {
    var todoEventSource = null;
}

if (typeof categoryColors === 'undefined') {
    var categoryColors = JSON.parse(localStorage.getItem('custom_categories')) || {
        'Uni': '#3498db',
        'Arbeit': '#e74c3c',
        'Privat': '#2ecc71',
        'Allgemein': '#34495e'
    };
}

// 2. Hilfsfunktionen
function getCategoryColor(category) {
    return categoryColors[category] || '#7f8c8d';
}

function formatDueDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    if (isoString.includes('T')) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    return `${day}.${month}.${year}`;
}

// 3. DOM-Init: Kalender & Dropdown
document.addEventListener('DOMContentLoaded', () => {
    renderCategoryDropdown();

    const calendarEl = document.getElementById('calendar');

    if (calendarEl) {
        window.calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: 'de',
            firstDay: 1,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
            },
            selectable: true,
            editable: true,
            eventDrop: function(info) {
                const todoId = info.event.id.replace('todo-', '');
                const newDueDate = info.event.startStr;

                fetch(`/api/todos/${todoId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dueDate: newDueDate })
                })
                .then(response => {
                    if (response.ok) {
                        renderCalendarAndTodos();
                    } else {
                        alert('Fehler beim Aktualisieren');
                        info.revert();
                    }
                })
                .catch(error => {
                    console.error('Netzwerkfehler:', error);
                    info.revert();
                });
            },
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

    renderCalendarAndTodos();
});

// 4. Render-Funktionen
function renderCalendarAndTodos() {
    fetch('/api/todos')
        .then(res => res.json())
        .then(todos => {
            renderTodoList(todos);

            if (window.calendar && typeof window.calendar.addEventSource === 'function') {
                const todoEvents = todos
                    .filter(todo => todo.due_date && todo.due_date !== "")
                    .map(todo => {
                        const eventColor = todo.done ? '#bdc3c7' : getCategoryColor(todo.category);
                        return {
                            id: 'todo-' + todo.id,
                            title: todo.done ? `☑ ${todo.title}` : `☐ ${todo.title}`,
                            start: todo.due_date,
                            display: 'list-item',
                            color: eventColor
                        };
                    });

                if (todoEventSource) {
                    todoEventSource.remove();
                }

                todoEventSource = window.calendar.addEventSource(todoEvents);
            }
        })
        .catch(err => console.error("Fehler beim Laden der To-Dos:", err));
}

function renderTodoList(todos) {
    const list = document.getElementById('todo-list');
    if (!list) return;

    const now = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7);

    const activeTodos = todos.filter(todo => {
        if (todo.done && todo.due_date) {
            const todoDate = new Date(todo.due_date);
            if (todoDate < lastWeek) {
                return false;
            }
        }
        return true;
    });

    list.innerHTML = '';
    activeTodos.forEach(todo => {
        const li = document.createElement('li');
        const catColor = todo.done ? '#bdc3c7' : getCategoryColor(todo.category);

        const isOverdue = todo.due_date && !todo.done && new Date(todo.due_date) < now;
        const dateStyle = isOverdue ? 'color: #d32f2f; font-weight: bold;' : 'color: #555;';
        const warningTag = isOverdue ? ' ⚠️' : '';

        const dateText = todo.due_date 
            ? ` <i style="${dateStyle}">(${formatDueDate(todo.due_date)}${warningTag})</i>` 
            : '';

        li.style.cssText = `display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding: 8px; background: ${isOverdue ? '#ffebee' : '#f4f4f4'}; border-radius: 4px; border-left: 5px solid ${catColor};`;

        li.innerHTML = `
            <span style="text-decoration: ${todo.done ? 'line-through' : 'none'}; cursor: pointer;" onclick="toggleTodo(${todo.id})">
                <strong style="color: ${catColor};">[${todo.category}]</strong> ${todo.title}${dateText}
            </span>
            <button onclick="deleteTodo(${todo.id})" style="background: #e74c3c; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Löschen</button>
        `;
        list.appendChild(li);
    });
}

// 5. Interaktionen & Kategorien
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
        .then(() => renderCalendarAndTodos());
}

function deleteTodo(id) {
    fetch(`/api/todos/${id}`, { method: 'DELETE' })
        .then(() => renderCalendarAndTodos());
}

// 1. Befüllt das Dropdown und fügt die Spezial-Option unten an
function renderCategoryDropdown() {
    const select = document.getElementById('todo-category');
    if (!select) return;

    select.innerHTML = '';

    // Bestehende Kategorien einfügen
    Object.keys(categoryColors).forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        select.appendChild(option);
    });

    // Option für neue Kategorie am Ende anfügen
    const newOption = document.createElement('option');
    newOption.value = '__NEW__';
    newOption.textContent = '+ Neue Kategorie...';
    select.appendChild(newOption);
}

// 2. Steuert das Ein- und Ausblenden der Erstellungs-Felder
function handleCategoryChange(selectedValue) {
    const container = document.getElementById('new-category-container');
    if (!container) return;

    if (selectedValue === '__NEW__') {
        container.style.display = 'flex'; // Feldeingabe anzeigen
    } else {
        container.style.display = 'none'; // Verstecken bei normaler Kategorie
    }
}

// 3. Kategorie erstellen & direkt auswählen
function addCategory() {
    const nameInput = document.getElementById('new-cat-name');
    const colorInput = document.getElementById('new-cat-color');
    const select = document.getElementById('todo-category');
    const container = document.getElementById('new-category-container');
    
    if (!nameInput || !colorInput || !select) return;

    const catName = nameInput.value.trim();
    const catColor = colorInput.value;

    if (!catName) {
        alert('Bitte gib einen Namen für die Kategorie ein.');
        return;
    }

    // Speichern
    categoryColors[catName] = catColor;
    localStorage.setItem('custom_categories', JSON.stringify(categoryColors));

    // Formular aufräumen & ausblenden
    nameInput.value = '';
    if (container) container.style.display = 'none';

    // Dropdown neu rendern und direkt die neu erstellte Kategorie auswählen
    renderCategoryDropdown();
    select.value = catName;

    renderCalendarAndTodos();
}
