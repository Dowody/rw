package main

import (
    "net/http"
    "./handlers"
)

func main() {
    // ... other routes ...
    
    // Password reset route
    http.HandleFunc("/reset-password", handlers.HandlePasswordReset)
    
    // Start server
    http.ListenAndServe(":8080", nil)
} 