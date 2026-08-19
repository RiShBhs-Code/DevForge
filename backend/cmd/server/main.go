package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"devforge/backend/config"
	"devforge/backend/internal/auth"
	"devforge/backend/internal/database"
	"devforge/backend/internal/middleware"
	"devforge/backend/internal/projects"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := database.Connect(cfg.MongoDBURI, cfg.DBName)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	r := chi.NewRouter()

	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Timeout(60 * time.Second))

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3000", cfg.ClientURL},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	authHandler := auth.NewHandler(db.Database, cfg.JWTSecret)
	projectHandler := projects.NewHandler(db.Database)

	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{
				"status":    "ok",
				"service":   "DevForge API",
				"timestamp": time.Now().Format(time.RFC3339),
			})
		})

		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", authHandler.Register)
			r.Post("/login", authHandler.Login)

			// Protected auth routes
			r.Group(func(r chi.Router) {
				r.Use(middleware.AuthMiddleware(cfg.JWTSecret))
				r.Get("/me", authHandler.GetMe)
				r.Put("/profile", authHandler.UpdateProfile)
			})
		})

		// Protected project routes
		r.Route("/projects", func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(cfg.JWTSecret))
			r.Get("/", projectHandler.ListProjects)
			r.Post("/", projectHandler.CreateProject)
			r.Get("/{id}", projectHandler.GetProject)
			r.Put("/{id}", projectHandler.UpdateProject)
			r.Delete("/{id}", projectHandler.DeleteProject)
		})
	})

	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("DevForge Backend listening on %s", serverAddr)
	if err := http.ListenAndServe(serverAddr, r); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
