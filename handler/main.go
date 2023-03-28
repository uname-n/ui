package main

import (
	"net/http"
	"os"
    "io"
    "io/fs"
	"path/filepath"
	"encoding/json"
	"log"
	"time"

	"embed"

	"github.com/gorilla/mux"
)

//go:embed build/*
var content embed.FS

var router = mux.NewRouter()

type Handler struct {
    StaticFS embed.FS
    StaticDir string
    IndexFile string
}

func (H Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    path, err := filepath.Abs(r.URL.Path)
    log.Println(path)
    if err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    path = filepath.Join(H.StaticDir, path)

    _, err = H.StaticFS.Open(path)
    if os.IsNotExist(err) {
    
        index, err := H.StaticFS.ReadFile(filepath.Join(H.StaticDir, H.IndexFile))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
        w.Header().Set("Content-Type", "text/html; charset=utf-8")
		w.WriteHeader(http.StatusAccepted)
		w.Write(index)
        return
    
    } else if err != nil {
        
        http.Error(w, err.Error(), http.StatusInternalServerError)
		return

    }

    assets, err := fs.Sub(H.StaticFS, H.StaticDir)
    http.FileServer(http.FS(assets)).ServeHTTP(w, r)
}

func init() {
    router.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
        log.Println("/api/health")
        json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
    })

    router.HandleFunc("/api/settings", func(w http.ResponseWriter, r *http.Request) {
        switch r.Method {
        case "GET":
            log.Println("/api/settings GET")
            file, err := os.Open("settings.json")
            if err != nil {
                http.Error(w, err.Error(), http.StatusNoContent)
                return
            }
            defer file.Close()

            w.Header().Set("Content-Type", "application/json")
            w.WriteHeader(http.StatusOK)
            io.Copy(w, file)

        case "POST":
            log.Println("/api/settings POST")
            file, err := os.Create("settings.json")
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }
            defer file.Close()

            _, err = io.Copy(file, r.Body)
            if err != nil {
                http.Error(w, err.Error(), http.StatusInternalServerError)
                return
            }

            w.WriteHeader(http.StatusCreated)

        default:
            http.Error(w, "Method not supported", http.StatusMethodNotAllowed)
        }
    })
}

func main() {
    spa := Handler{StaticFS: content, StaticDir: "build", IndexFile: "index.html"}
    router.PathPrefix("/").Handler(spa)

    svc := &http.Server{
        Handler: router,
        Addr: "127.0.0.1:8080",

        WriteTimeout: 15 * time.Second,
        ReadTimeout: 15 * time.Second,
    }

    log.Fatal(svc.ListenAndServe())
}
