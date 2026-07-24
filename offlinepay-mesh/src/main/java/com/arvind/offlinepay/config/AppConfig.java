package com.arvind.offlinepay.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Application-wide configuration.
 * Enables scheduled tasks — used by DeduplicationService for periodic cache eviction.
 *
 * @author Arvind Dwivedi
 */
@Configuration
@EnableScheduling
public class AppConfig {
}
