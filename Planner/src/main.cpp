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
	DatabaseManager dbManager("planner.db");

	crow::mustache::set_base("templates");

	//All categories for the Calender
	CROW_ROUTE(app, "/api/events")
	    ([&dbManager](){
	        return dbManager.getEvents();
	    });

	//Only filtered Calender
	CROW_ROUTE(app, "/api/events/<string>")
	    ([&dbManager](std::string category){
	        return dbManager.getEvents(category);
	    });

	// Eine einfache Route für die Startseite ("/")
	//define your endpoint at the root directory
	CROW_ROUTE(app, "/")([](){
	    auto page = crow::mustache::load_text("dashboard.html");
	    return page;
	});

	CROW_ROUTE(app, "/calendar")
	([](){
	    crow::mustache::context ctx;
	    return crow::mustache::load("calendar.html").render(ctx);
	});

	// API-Route für den Button-Klick
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

