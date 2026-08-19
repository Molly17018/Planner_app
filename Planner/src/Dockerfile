# --- STAGE 1: Bauen (Builder) ---
FROM ubuntu:22.04 AS builder

ENV DEBIAN_FRONTEND=noninteractive 

# Installiere Compiler, CMake und Python für Conan
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    python3-pip \
    python3-venv

# Installiere Conan sicher in einem Virtual Environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install conan

# Conan-Standardprofil erstellen
RUN conan profile detect

WORKDIR /app
COPY . .

# Lade Abhängigkeiten über Conan herunter
RUN conan install . --output-folder=build --build=missing

# Kompiliere das C++ Programm mit der von Conan generierten Toolchain
RUN cd build && cmake .. -DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake -DCMAKE_BUILD_TYPE=Release && cmake --build .

# --- STAGE 2: Ausführen (Runner) ---
FROM ubuntu:22.04

WORKDIR /app

# Wir kopieren nur das kompilierte Programm. Conan hat alle Abhängigkeiten statisch oder korrekt verknüpft!
COPY --from=builder /app/build/webapp .

# Kopiere den Templates-Ordner mit in den Container
COPY templates ./templates

EXPOSE 8080
CMD ["./webapp"]