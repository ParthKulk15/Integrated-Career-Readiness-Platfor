package com.career.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Career Readiness Intelligence Platform.
 * Boots up Spring context, JPA auto-config, and embedded Tomcat.
 */
@SpringBootApplication
public class CareerPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareerPlatformApplication.class, args);
    }
}
