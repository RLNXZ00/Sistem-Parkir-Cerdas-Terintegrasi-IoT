package com.spct.config; // Nama package config

import org.springframework.context.annotation.Configuration; // Mengimpor anotasi Configuration dari framework Spring
import org.springframework.messaging.simp.config.MessageBrokerRegistry; // Mengimpor kelas konfigurasi MessageBrokerRegistry
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker; // Mengimpor anotasi EnableWebSocketMessageBroker
import org.springframework.web.socket.config.annotation.StompEndpointRegistry; // Mengimpor kelas registrasi endpoint STOMP
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer; // Mengimpor interface WebSocketMessageBrokerConfigurer

// Anotasi Configuration: menandakan kelas ini sebagai sumber definisi konfigurasi Spring
@Configuration
// Anotasi EnableWebSocketMessageBroker: mengaktifkan server WebSocket berbasis broker pesan STOMP
@EnableWebSocketMessageBroker
// Kelas konfigurasi WebSocketConfig untuk mengatur jalur komunikasi real-time
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer 
{
    // =====================================================================
    // Konfigurasi Message Broker (pengelola saluran pesan)
    // =====================================================================

    // Method override configureMessageBroker untuk mengonfigurasi rute pesan broker
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config)
    {
        // Mengaktifkan in-memory message broker dengan awalan prefix "/topic" untuk penyiaran (broadcast)
        config.enableSimpleBroker("/topic");

        // Mengatur prefix destinasi aplikasi "/app" untuk pesan yang dikirim dari klien ke server
        config.setApplicationDestinationPrefixes("/app");
    }

    // =====================================================================
    // Konfigurasi Endpoint WebSocket (titik koneksi awal)
    // =====================================================================

    // Method override registerStompEndpoints untuk mendaftarkan endpoint handshake WebSocket
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry)
    {
        // Mendaftarkan endpoint URL "/ws-spct" sebagai pintu masuk koneksi WebSocket
        registry.addEndpoint("/ws-spct")
                // Mengizinkan koneksi dari semua origin (*) untuk mendukung CORS frontend Vite / Kiosk
                .setAllowedOriginPatterns("*")
                // Mengaktifkan opsi fallback SockJS jika browser klien tidak mendukung WebSocket native
                .withSockJS();
    }
}
