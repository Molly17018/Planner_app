/* old non clickable calendar
       document.addEventListener('DOMContentLoaded', function() {
           var calendarEl = document.getElementById('calendar');

           var calendar = new FullCalendar.Calendar(calendarEl, {
               initialView: 'dayGridMonth',
               locale: 'de',
               // Ruft deine Crow API ab
               events: function(fetchInfo, successCallback, failureCallback) {
                   fetch('/api/events')
                       .then(response => response.json())
                       .then(data => {
                           // Mapping von Crow JSON auf das FullCalendar Format (title, start)
                           let events = data.map(item => ({
                               id: item.id,
                               title: `[${item.category}] ${item.title}`,
                               start: item.date
                           }));
                           successCallback(events);
                       })
                       .catch(error => failureCallback(error));
               }
           });

           calendar.render();
       });
       */
      
       document.addEventListener('DOMContentLoaded', function() {
           var calendarEl = document.getElementById('calendar');

       var calendar = new FullCalendar.Calendar(calendarEl, {
           initialView: 'dayGridMonth',
           locale: 'de',
           selectable: true, // Heb Tage optisch beim Hovern/Klicken hervor
           
           dateClick: function(info) {
               // info.dateStr enthält das Datum im Format "YYYY-MM-DD"
               const title = prompt(`Neues Event am ${info.dateStr} eingeben:`);
               if (!title) return; // Abbrechen, falls leer

               const category = prompt("Kategorie (z. B. Uni, Familie, Freunde):", "Uni");

               // Event per POST an das C++ Backend schicken
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
                       // Kalender-Events vom Backend neu laden
                       calendar.refetchEvents();
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

       calendar.render();
       });
       
       
       // Globalen Speicher für EventSource vom Kalender vorhalten
       let todoEventSource = null;
       
       document.addEventListener('DOMContentLoaded', () => {
           const calendarEl = document.getElementById('calendar');

           if (calendarEl) {
               // Zuweisung an window.calendar muss das FullCalendar-Objekt sein!
               window.calendar = new FullCalendar.Calendar(calendarEl, {
                   initialView: 'dayGridMonth',
                   headerToolbar: {
                       left: 'prev,next today',
                       center: 'title',
                       right: 'dayGridMonth,timeGridWeek'
                   }
               });

               // Erst rendern...
               window.calendar.render();
           }

           // ...danach To-Dos laden und als Event-Source hinzufügen
           renderCalendarAndTodos();
       });
       
       // 1. Hauptfunktion zum Laden & Rendern
       function renderCalendarAndTodos() {
            // Prüfen, ob window.calendar existiert UND die Methode addEventSource besitzt
            if (window.calendar && typeof window.calendar.addEventSource === 'function') {
                if (todoEventSource) {
                    todoEventSource.remove();
                }
                todoEventSource = window.calendar.addEventSource(todoEvents);
            } else {
                console.warn("FullCalendar ist noch nicht bereit oder falsch initialisiert.");
            }
            
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