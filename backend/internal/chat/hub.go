package chat

import (
	"sync"
)

type ProjectBroadcastMessage struct {
	ProjectID string
	Message   []byte
}

type UserBroadcastMessage struct {
	UserID  string
	Message []byte
}

type Hub struct {
	// Registered clients per project ID
	projectClients map[string]map[*Client]bool

	// Registered clients per user ID
	userClients map[string]map[*Client]bool

	// Register requests from clients
	Register chan *Client

	// Unregister requests from clients
	Unregister chan *Client

	// Inbound messages to broadcast to a project
	BroadcastProject chan ProjectBroadcastMessage

	// Inbound messages to broadcast to a user
	BroadcastUser chan UserBroadcastMessage

	mu sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		projectClients:   make(map[string]map[*Client]bool),
		userClients:      make(map[string]map[*Client]bool),
		Register:         make(chan *Client),
		Unregister:       make(chan *Client),
		BroadcastProject: make(chan ProjectBroadcastMessage),
		BroadcastUser:    make(chan UserBroadcastMessage),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			// Register under project
			if h.projectClients[client.ProjectID] == nil {
				h.projectClients[client.ProjectID] = make(map[*Client]bool)
			}
			h.projectClients[client.ProjectID][client] = true

			// Register under user
			if h.userClients[client.UserID] == nil {
				h.userClients[client.UserID] = make(map[*Client]bool)
			}
			h.userClients[client.UserID][client] = true
			h.mu.Unlock()

		case client := <-h.Unregister:
			h.mu.Lock()
			if clients, ok := h.projectClients[client.ProjectID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.send)
					if len(clients) == 0 {
						delete(h.projectClients, client.ProjectID)
					}
				}
			}
			if clients, ok := h.userClients[client.UserID]; ok {
				delete(clients, client)
				if len(clients) == 0 {
					delete(h.userClients, client.UserID)
				}
			}
			h.mu.Unlock()

		case msg := <-h.BroadcastProject:
			h.mu.Lock()
			if clients, ok := h.projectClients[msg.ProjectID]; ok {
				for client := range clients {
					select {
					case client.send <- msg.Message:
					default:
						close(client.send)
						delete(clients, client)
					}
				}
			}
			h.mu.Unlock()

		case msg := <-h.BroadcastUser:
			h.mu.Lock()
			if clients, ok := h.userClients[msg.UserID]; ok {
				for client := range clients {
					select {
					case client.send <- msg.Message:
					default:
						close(client.send)
						delete(clients, client)
					}
				}
			}
			h.mu.Unlock()
		}
	}
}
