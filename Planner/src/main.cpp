/*
 * main.cpp
 *
 *  Created on: 19.08.2026
 *      Author: liens
 */

#include "crow.h"
#include <sqlite3.h>
#include <iostream>

void init_database() {
    sqlite3* db;
    // Erstellt planner.db, falls sie nicht existiert
    if (sqlite3_open("planner.db", &db) == SQLITE_OK) {
        const char* sql = "CREATE TABLE IF NOT EXISTS events ("
                          "id INTEGER PRIMARY KEY AUTOINCREMENT, "
                          "title TEXT NOT NULL, "
                          "category TEXT NOT NULL, "
                          "date TEXT NOT NULL);";

        char* errMsg = nullptr;
        if (sqlite3_exec(db, sql, nullptr, nullptr, &errMsg) != SQLITE_OK) {
            std::cerr << "SQL-Fehler: " << errMsg << std::endl;
            sqlite3_free(errMsg);
        }
        sqlite3_close(db);
    }
}

int main() {
	init_database();

	crow::SimpleApp app;

	// Eine einfache Route für die Startseite ("/")
	//define your endpoint at the root directory
	crow::mustache::set_base("templates");
	CROW_ROUTE(app, "/")([](){
	    auto page = crow::mustache::load_text("page.html");
	    return page;
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

