package handlers

import (
    "html/template"
    "net/http"
    "path/filepath"
    "github.com/google/uuid"
    "time"
)

type ResetPasswordData struct {
    RedirectTo string
    Token      string
}

// In-memory token store (replace with database in production)
var tokenStore = make(map[string]time.Time)

func HandlePasswordReset(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Get email from request
    email := r.FormValue("email")
    if email == "" {
        http.Error(w, "Email is required", http.StatusBadRequest)
        return
    }

    // Generate a unique token
    userToken := uuid.New().String()
    
    // Store token with expiration (24 hours)
    tokenStore[userToken] = time.Now().Add(24 * time.Hour)

    // Load the template
    tmpl, err := template.ParseFiles(filepath.Join("templates", "reset_password.html"))
    if err != nil {
        http.Error(w, "Error loading template", http.StatusInternalServerError)
        return
    }

    // Prepare the data with the correct URL structure
    data := ResetPasswordData{
        RedirectTo: "https://dowody.github.io/rw/reset-password", // Base URL for password reset
        Token:      userToken,
    }

    // Execute the template
    err = tmpl.Execute(w, data)
    if err != nil {
        http.Error(w, "Error executing template", http.StatusInternalServerError)
        return
    }
}

// Verify token handler
func VerifyResetToken(w http.ResponseWriter, r *http.Request) {
    token := r.URL.Query().Get("token")
    if token == "" {
        http.Error(w, "Token is required", http.StatusBadRequest)
        return
    }

    // Check if token exists and is not expired
    if expiry, exists := tokenStore[token]; exists {
        if time.Now().Before(expiry) {
            w.WriteHeader(http.StatusOK)
            return
        }
        // Token expired
        delete(tokenStore, token)
    }

    http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
} 