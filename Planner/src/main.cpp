/*
 * main.cpp
 *
 *  Created on: 19.08.2026
 *      Author: liens
 */

#include "crow.h"
#include "DatabaseManager.h"
#include <sqlite3.h>
#include <iostream>

int main() {
	crow::SimpleApp app;
	DatabaseManager dbManager("data/planner.db");

	//define your endpoint at the root directory
	crow::mustache::set_base("templates");

	//All categories for the Calender
	CROW_ROUTE(app, "/api/events")([&dbManager](){
	    return dbManager.getEvents();
	});

	//Only filtered Calender
	CROW_ROUTE(app, "/api/events/<string>")([&dbManager](std::string category){
	    return dbManager.getEvents(category);
	});

	//Route to default page / dashboard
	CROW_ROUTE(app, "/")([](){
	    auto page = crow::mustache::load_text("dashboard.html");
	    return page;
	});

	//Route to accsess calendar
	CROW_ROUTE(app, "/calendar")
	([](){
	    crow::mustache::context ctx;
	    return crow::mustache::load("calendar.html").render(ctx);
	});

	//Adds an event to the calender
	CROW_ROUTE(app, "/api/events").methods(crow::HTTPMethod::Post)([&dbManager](const crow::request& req){
	    auto body = crow::json::load(req.body);
	    if (!body) return crow::response(400, "Invalid JSON");

	    std::string title = body["title"].s();
	    std::string date = body["date"].s();
	    std::string category = body["category"].s();

	    dbManager.addEvent(title, date, category); // Speichert in SQLite

	    return crow::response(201, "Created");
	});

	// Alle To-Dos abrufen
	CROW_ROUTE(app, "/api/todos").methods(crow::HTTPMethod::Get)
	([&dbManager](){
	    return crow::response(dbManager.getTodos());
	});

	// Neues To-Do anlegen
	CROW_ROUTE(app, "/api/todos").methods(crow::HTTPMethod::Post)
	([&dbManager](const crow::request& req){
	    auto body = crow::json::load(req.body);
	    if (!body) return crow::response(400, "Invalid JSON");

	    std::string title = body["title"].s();
	    std::string category = body["category"].s();
	    std::string dueDate = body.has("dueDate") ? std::string(body["dueDate"].s()) : "";

	    dbManager.addTodo(title, category, dueDate);
	    return crow::response(201, "Created");
	});

	// To-Do als erledigt/offen markieren
	CROW_ROUTE(app, "/api/todos/<int>/toggle").methods(crow::HTTPMethod::Post)
	([&dbManager](int id){
	    dbManager.toggleTodo(id);
	    return crow::response(200, "Toggled");
	});

	// To-Do löschen
	CROW_ROUTE(app, "/api/todos/<int>").methods(crow::HTTPMethod::Delete)
	([&dbManager](int id){
	    dbManager.deleteTodo(id);
	    return crow::response(200, "Deleted");
	});

	// API-Route für den Button-Klick in page.html
	CROW_ROUTE(app, "/scripts/<path>")([](const std::string& filepath){
	    crow::response res;
	    res.set_static_file_info("scripts/" + filepath);
	    return res;
	});

	//Path for the css style sheet
	CROW_ROUTE(app, "/style/<path>")([](const std::string& filepath){
	    crow::response res;
	    res.set_static_file_info("style/" + filepath);
	    return res;
	});

	// Starte den Server auf Port 8080 mit mehreren Threads
	app.port(8080).multithreaded().run();
}

