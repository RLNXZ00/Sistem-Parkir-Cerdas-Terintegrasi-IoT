package com.spct.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// Deklarasi konfigurasi WebSocket: mengaktifkan komunikasi real-time (push notifikasi) dari Server ke Frontend
// Tanpa ini, server hanya bisa merespons request dari klien (pull), tidak bisa mendorong data (push)
// Digunakan oleh MonitoringFisikService untuk mengirim sinyal anomali ke Dashboard Admin secara instan
@Configuration
@EnableWebSocketMessageBroker // Mengaktifkan fitur WebSocket dengan message broker (STOMP protocol)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer // Kelas konfigurasi WebSocket STOMP untuk push notifikasi real-time
{
    // =====================================================================
    // Konfigurasi Message Broker (pengelola saluran pesan)
    // =====================================================================

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config)
    {
        // Mendaftarkan prefix untuk topik yang bisa dilanggani (subscribe) oleh Frontend
        // Frontend React/JavaScript akan subscribe ke: /topic/monitoring dan /topic/anomali
        config.enableSimpleBroker("/topic"); // Mengaktifkan simple in-memory broker untuk topik broadcast

        // Mendaftarkan prefix untuk pesan yang dikirim DARI klien KE server
        // Frontend bisa mengirim pesan ke: /app/sesuatu
        config.setApplicationDestinationPrefixes("/app"); // Prefix untuk pesan masuk dari klien (tidak dipakai di monitoring, namun standar)
    }


    // =====================================================================
    // Konfigurasi Endpoint WebSocket (titik koneksi awal)
    // =====================================================================

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry)
    {
        // Mendaftarkan endpoint WebSocket yang pertama kali dikoneksikan oleh Frontend
        // Frontend React akan connect ke: ws://localhost:8080/ws-spct
        registry.addEndpoint("/ws-spct") // Nama endpoint WebSocket
                .setAllowedOriginPatterns("*") // Mengizinkan koneksi dari origin manapun (Frontend dev & prod)
                .withSockJS(); // Mengaktifkan fallback SockJS jika browser tidak mendukung WebSocket murni
    }
}
