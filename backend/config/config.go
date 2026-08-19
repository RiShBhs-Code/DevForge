package config

import (
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port       string
	MongoDBURI string
	DBName     string
	JWTSecret  string
	ClientURL  string
}

func LoadConfig() (*Config, error) {
	// Load .env from current directory, parent directory, or project root
	_ = godotenv.Load()
	_ = godotenv.Load("../.env")
	_ = godotenv.Load("../../.env")

	port := getEnv("PORT", "8080")
	mongoURI := getEnv("MONGODB_URI", "mongodb://localhost:27017/devforge")
	dbName := getEnv("DB_NAME", getEnv("DBName", "devforge"))
	jwtSecret := getEnv("JWT_SECRET", "devforge-super-secret-jwt-key-2026")
	clientURL := getEnv("CLIENT_URL", "http://localhost:5173")

	// Sanitize mongoURI if brackets or unescaped @ in password exist
	mongoURI = sanitizeMongoURI(mongoURI)

	log.Printf("Loaded configuration. Server PORT=%s, ClientURL=%s", port, clientURL)

	return &Config{
		Port:       port,
		MongoDBURI: mongoURI,
		DBName:     dbName,
		JWTSecret:  jwtSecret,
		ClientURL:  clientURL,
	}, nil
}

func sanitizeMongoURI(uri string) string {
	// Strip placeholder angle brackets if present e.g. <Rishbh@16o7> -> Rishbh%4016o7
	if strings.Contains(uri, "<") && strings.Contains(uri, ">") {
		start := strings.Index(uri, "<")
		end := strings.Index(uri, ">")
		if start < end {
			inner := uri[start+1 : end]
			innerEscaped := strings.ReplaceAll(inner, "@", "%40")
			uri = uri[:start] + innerEscaped + uri[end+1:]
		}
	}
	return uri
}

func getEnv(key, fallback string) string {
	if val, exists := os.LookupEnv(key); exists && val != "" {
		return val
	}
	return fallback
}
