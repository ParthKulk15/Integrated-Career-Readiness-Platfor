package com.career.platform.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * No seed data — all data comes from user registrations and recruiter job posts.
 */
@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData() {
        return args -> {
            System.out.println(">>> Application ready. No seed data — register and post jobs to get started.");
        };
    }
}
