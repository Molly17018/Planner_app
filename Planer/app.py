from flask import Flask, render_template_string, request, redirect

app = Flask(__name__)

# Eine einfache Liste im Speicher für deine Aufgaben
tasks = []

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        task = request.form.get('task')
        if task:
            tasks.append(task)
        return redirect('/')

    # Einfaches HTML-Layout direkt im Code
    html = '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Mein Tagesplaner</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; max-width: 500px; }
            input[type=text] { width: 70%; padding: 8px; }
            button { padding: 8px; }
            ul { list-style-type: square; }
        </style>
    </head>
    <body>
        <h2>📋 Mein Tagesplaner</h2>
        <form method="POST">
            <input type="text" name="task" placeholder="Neue Aufgabe eingeben..." required>
            <button type="submit">Hinzufügen</button>
        </form>
        <ul>
            {% for task in tasks %}
                <li>{{ task }}</li>
            {% endfor %}
        </ul>
    </body>
    </html>
    '''
    return render_template_string(html)

if __name__ == '__main__':
    # WICHTIG: host='0.0.0.0' macht den Server außerhalb des Containers erreichbar
    app.run(host='0.0.0.0', port=80) #80 statt 5000