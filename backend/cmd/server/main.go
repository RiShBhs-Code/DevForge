package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"devforge/backend/config"
	"devforge/backend/internal/admin"
	"devforge/backend/internal/auth"
	"devforge/backend/internal/chat"
	"devforge/backend/internal/database"
	"devforge/backend/internal/members"
	"devforge/backend/internal/middleware"
	"devforge/backend/internal/notifications"
	"devforge/backend/internal/projects"
	"devforge/backend/internal/tasks"
	"devforge/backend/internal/users"

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
	taskHandler := tasks.NewHandler(db.Database)
	memberHandler := members.NewHandler(db.Database)
	adminHandler := admin.NewHandler(db.Database)

	chatHub := chat.NewHub()
	go chatHub.Run()

	chatHandler := chat.NewHandler(db.Database, chatHub, cfg.JWTSecret)
	notifHandler := notifications.NewHandler(db.Database)

	// WebSocket endpoint
	r.Get("/ws/projects/{id}", chatHandler.HandleWebSocket)

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

			// Tasks sub-routes
			r.Get("/{id}/tasks", taskHandler.GetProjectTasks)
			r.Post("/{id}/tasks", taskHandler.CreateTask)

			// Members sub-routes
			r.Get("/{id}/members", memberHandler.GetProjectMembers)
			r.Post("/{id}/members", memberHandler.AddProjectMember)
			r.Delete("/{id}/members/{userId}", memberHandler.RemoveProjectMember)

			// Chat sub-routes
			r.Get("/{id}/messages", chatHandler.GetProjectMessages)
		})

		// Protected task routes
		r.Route("/tasks", func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(cfg.JWTSecret))
			r.Get("/my", taskHandler.GetMyTasks)
			r.Put("/{id}", taskHandler.UpdateTask)
			r.Delete("/{id}", taskHandler.DeleteTask)
		})

		// Protected notification routes
		r.Route("/notifications", func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(cfg.JWTSecret))
			r.Get("/", notifHandler.GetNotifications)
			r.Patch("/{id}/read", notifHandler.MarkAsRead)
			r.Post("/read-all", notifHandler.MarkAllAsRead)
		})

		// Protected Admin-only routes
		r.Route("/admin", func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(cfg.JWTSecret))
			r.Use(middleware.RequireRole(users.RoleAdmin))
			r.Get("/stats", adminHandler.GetStats)
			r.Get("/users", adminHandler.ListUsers)
			r.Put("/users/{id}/role", adminHandler.UpdateUserRole)
			r.Delete("/users/{id}", adminHandler.DeleteUser)
			r.Get("/projects", adminHandler.ListProjects)
			r.Delete("/projects/{id}", adminHandler.DeleteProject)
		})
	})

	serverAddr := fmt.Sprintf(":%s", cfg.Port)
	log.Printf("DevForge Backend listening on %s", serverAddr)
	if err := http.ListenAndServe(serverAddr, r); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
