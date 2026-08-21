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
    		//opens the db
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
//    		const char* sql = R"(
//            	CREATE TABLE IF NOT EXISTS events (
//                	id INTEGER PRIMARY KEY AUTOINCREMENT,
//                	title TEXT NOT NULL,
//                	date TEXT NOT NULL,       -- Format: YYYY-MM-DD
//                	category TEXT NOT NULL    -- "Uni", "Familie", "Freunde"
//            	);
//
//            	CREATE TABLE IF NOT EXISTS todos (
//                	id INTEGER PRIMARY KEY AUTOINCREMENT,
//                	task TEXT NOT NULL,
//                	due_date TEXT,            -- Optionales Datum (YYYY-MM-DD)
//                	completed INTEGER DEFAULT 0,
//                	category TEXT NOT NULL
//            	);
//        	)";

    		const char* sqlEvents = "CREATE TABLE IF NOT EXISTS events ("
    		                            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
    		                            "title TEXT NOT NULL, "
    		                            "date TEXT NOT NULL, "
    		                            "category TEXT"
    		                            ");";

    		const char* sqlTodos = "CREATE TABLE IF NOT EXISTS todos ("
    		                           "id INTEGER PRIMARY KEY AUTOINCREMENT, "
    		                           "title TEXT NOT NULL, "
    		                           "category TEXT, "
    		                           "done INTEGER DEFAULT 0);";

    		sqlite3_exec(db, sqlEvents, nullptr, nullptr, nullptr);
    		sqlite3_exec(db, sqlTodos, nullptr, nullptr, nullptr);

    		//Error message display
    		char* errMsg = nullptr;
    		if (sqlite3_exec(db, sqlEvents, nullptr, nullptr, &errMsg) != SQLITE_OK) {
    			std::cerr << "SQL Fehler: " << errMsg << std::endl;
    			sqlite3_free(errMsg);
    		}
    		if (sqlite3_exec(db, sqlTodos, nullptr, nullptr, &errMsg) != SQLITE_OK) {
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

    	//Lets you add events into the calendar
    	void addEvent(const std::string& title, const std::string& date, const std::string& category) {
    	    const char* sql = "INSERT INTO events (title, date, category) VALUES (?, ?, ?);";
    	    sqlite3_stmt* stmt;

    	    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
    	        sqlite3_bind_text(stmt, 1, title.c_str(), -1, SQLITE_TRANSIENT);
    	        sqlite3_bind_text(stmt, 2, date.c_str(), -1, SQLITE_TRANSIENT);
    	        sqlite3_bind_text(stmt, 3, category.c_str(), -1, SQLITE_TRANSIENT);

    	        if (sqlite3_step(stmt) != SQLITE_DONE) {
    	            std::cerr << "Fehler beim Speichern des Events: " << sqlite3_errmsg(db) << std::endl;
    	        }
    	    } else {
    	        std::cerr << "Fehler beim Vorbereiten des SQL-Statements: " << sqlite3_errmsg(db) << std::endl;
    	    }

    	    sqlite3_finalize(stmt);
    	}

    	crow::json::wvalue getTodos() {
    	    std::vector<crow::json::wvalue> todoList;
    	    const char* sql = "SELECT id, title, category, done FROM todos;";
    	    sqlite3_stmt* stmt;

    	    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
    	    	while (sqlite3_step(stmt) == SQLITE_ROW) {
    	    	    crow::json::wvalue item;
    	    	    item["id"] = sqlite3_column_int(stmt, 0);
    	    	    item["title"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 1));
    	    	    item["category"] = reinterpret_cast<const char*>(sqlite3_column_text(stmt, 2));
    	    	    item["done"] = sqlite3_column_int(stmt, 3) == 1;
    	    	    todoList.push_back(item);
    	        }
    	    }
    	    sqlite3_finalize(stmt);
    	    return crow::json::wvalue(todoList);
    	}

    	void addTodo(const std::string& title, const std::string& category, const std::string& dueDate = "") {
    	    const char* sql = "INSERT INTO todos (title, category, due_date, done) VALUES (?, ?, ?, 0);";
    	    sqlite3_stmt* stmt;
    	    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
    	            sqlite3_bind_text(stmt, 1, title.c_str(), -1, SQLITE_TRANSIENT);
    	            sqlite3_bind_text(stmt, 2, category.c_str(), -1, SQLITE_TRANSIENT);
    	            sqlite3_bind_text(stmt, 3, dueDate.c_str(), -1, SQLITE_TRANSIENT);
    	            sqlite3_step(stmt);
    	    }
    	    sqlite3_finalize(stmt);
    	}

    	void toggleTodo(int id) {
    	    const char* sql = "UPDATE todos SET done = CASE WHEN done = 1 THEN 0 ELSE 1 END WHERE id = ?;";
    	    sqlite3_stmt* stmt;
    	    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
    	        sqlite3_bind_int(stmt, 1, id);
    	        sqlite3_step(stmt);
    	    }
    	    sqlite3_finalize(stmt);
    	}

    	void deleteTodo(int id) {
    	    const char* sql = "DELETE FROM todos WHERE id = ?;";
    	    sqlite3_stmt* stmt;
    	    if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
    	        sqlite3_bind_int(stmt, 1, id);
    	        sqlite3_step(stmt);
    	    }
    	    sqlite3_finalize(stmt);
    	}

};



#endif /* DATABASEMANAGER_H_ */
