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