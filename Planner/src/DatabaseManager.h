/*
 * DatabaseManager.h
 *
 *  Created on: 20.08.2026
 *      Author: liens
 */

#ifndef DATABASEMANAGER_H_
#define DATABASEMANAGER_H_

#include <sqlite3.h>
#include <crow.h>
#include <string>
#include <vector>
#include <iostream>

class DatabaseManager {
	private:
    	sqlite3* db;

	public:
    	//Check if sqlite3 is open, if not send erroemessage
    	DatabaseManager(const std::string& dbPath) {
    		if (sqlite3_open(dbPath.c_str(), &db) != SQLITE_OK) {
    			std::cerr << "Fehler beim Öffnen der Datenbank: " << sqlite3_errmsg(db) << std::endl;
    		} else {
    			initTables();
    		}
    	}

    	~DatabaseManager() {
    		sqlite3_close(db);
    	}

    	//Creates the tabels for sqlite to work in if they dont already exist
    	//TODO Categorien hard coded???
    	void initTables() {
    		const char* sql = R"(
            	CREATE TABLE IF NOT EXISTS events (
                	id INTEGER PRIMARY KEY AUTOINCREMENT,
                	title TEXT NOT NULL,
                	date TEXT NOT NULL,       -- Format: YYYY-MM-DD
                	category TEXT NOT NULL    -- "Uni", "Familie", "Freunde" 
            	);

            	CREATE TABLE IF NOT EXISTS todos (
                	id INTEGER PRIMARY KEY AUTOINCREMENT,
                	task TEXT NOT NULL,
                	due_date TEXT,            -- Optionales Datum (YYYY-MM-DD)
                	completed INTEGER DEFAULT 0,
                	category TEXT NOT NULL
            	);
        	)";

    		char* errMsg = nullptr;
    		if (sqlite3_exec(db, sql, nullptr, nullptr, &errMsg) != SQLITE_OK) {
    			std::cerr << "SQL Fehler: " << errMsg << std::endl;
    			sqlite3_free(errMsg);
    		}
    	}

    	// Termine abfragen: Entweder gefiltert nach Kategorie oder alle für die Gesamtübersicht
    	crow::json::wvalue getEvents(const std::string& category = "") {
    		std::string sql = "SELECT id, title, date, category FROM events";
    		if (!category.empty()) {
    			sql += " WHERE category = ?";
    		}

    		sqlite3_stmt* stmt;
    		sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr);

    		if (!category.empty()) {
    			sqlite3_bind_text(stmt, 1, category.c_str(), -1, SQLITE_TRANSIENT);
    		}

    		std::vector<crow::json::wvalue> resultList;
    		while (sqlite3_step(stmt) == SQLITE_ROW) {
    			crow::json::wvalue item;
    			item["id"] = sqlite3_column_int(stmt, 0);
    			item["title"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
    			item["date"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
    			item["category"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 3));
    			resultList.push_back(item);
    		}

    		sqlite3_finalize(stmt);
    		return crow::json::wvalue(resultList);
    	}
};



#endif /* DATABASEMANAGER_H_ */
