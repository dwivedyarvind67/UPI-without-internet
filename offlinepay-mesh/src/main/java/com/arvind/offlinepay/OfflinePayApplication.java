package com.arvind.offlinepay;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Offline Payment Mesh application.
 *
 * Run from terminal:
 *   .\mvnw.cmd spring-boot:run   (Windows)
 *   ./mvnw spring-boot:run       (Linux/Mac)
 *
 * Then open http://localhost:8080
 *
 * @author Arvind Dwivedi
 */
@SpringBootApplication
public class OfflinePayApplication {
    public static void main(String[] args) {
        SpringApplication.run(OfflinePayApplication.class, args);
    }
}
