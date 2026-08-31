package chat

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"devforge/backend/internal/users"

	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 4096
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for dev/production local setup
	},
}

type Client struct {
	hub       *Hub
	conn      *websocket.Conn
	send      chan []byte
	UserID    string
	ProjectID string
	db        *mongo.Database
}

func (c *Client) readPump() {
	defer func() {
		c.hub.Unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, messageBytes, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error reading websocket message: %v", err)
			}
			break
		}

		var payload SendMessagePayload
		if err := json.Unmarshal(messageBytes, &payload); err != nil {
			// Also check if raw string was passed
			payload.Content = string(messageBytes)
		}

		content := strings.TrimSpace(payload.Content)
		if content == "" {
			continue
		}

		// Save message to MongoDB
		projectObjID, _ := primitive.ObjectIDFromHex(c.ProjectID)
		userObjID, _ := primitive.ObjectIDFromHex(c.UserID)
		now := time.Now()

		msgRecord := Message{
			ID:        primitive.NewObjectID(),
			ProjectID: projectObjID,
			SenderID:  userObjID,
			Content:   content,
			CreatedAt: now,
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		coll := c.db.Collection("messages")
		_, err = coll.InsertOne(ctx, msgRecord)
		cancel()

		if err != nil {
			log.Printf("failed to save chat message: %v", err)
			continue
		}

		// Fetch sender user details
		var senderUser users.User
		ctxUser, cancelUser := context.WithTimeout(context.Background(), 5*time.Second)
		usersColl := c.db.Collection("users")
		_ = usersColl.FindOne(ctxUser, bson.M{"_id": userObjID}).Decode(&senderUser)
		cancelUser()
		senderResp := senderUser.ToResponse()

		msgResp := msgRecord.ToResponse(&senderResp)
		wsEvent := WSMessage{
			Type:    "message:new",
			Payload: msgResp,
		}

		eventBytes, err := json.Marshal(wsEvent)
		if err == nil {
			c.hub.BroadcastProject <- ProjectBroadcastMessage{
				ProjectID: c.ProjectID,
				Message:   eventBytes,
			}
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket frame
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
