/*
 * main.cpp
 *
 *  Created on: 19.08.2026
 *      Author: liens
 */

#include "crow.h"

int main() {
	crow::SimpleApp app;

	// Eine einfache Route für die Startseite ("/")
	//define your endpoint at the root directory
	crow::mustache::set_base("templates");
	    CROW_ROUTE(app, "/")([](){
	        auto page = crow::mustache::load_text("page.html");
	        return page;
	    });

	// Starte den Server auf Port 8080 mit mehreren Threads
	app.port(8080).multithreaded().run();
}

