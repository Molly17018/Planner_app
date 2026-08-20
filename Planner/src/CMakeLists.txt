cmake_minimum_required(VERSION 3.15)
project(CppWebApp)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

set(CMAKE_CXX_STANDARD 17)

# Conan anweisen, das Crow-Paket unter seinem echten CMake-Namen zu finden
find_package(Crow CONFIG REQUIRED)
find_package(SQLite3 REQUIRED)

add_executable(webapp main.cpp)

# Crow mit unserem Programm verknüpfen
target_link_libraries(webapp PRIVATE 
    Crow::Crow
    SQLite::SQLite3
    )
