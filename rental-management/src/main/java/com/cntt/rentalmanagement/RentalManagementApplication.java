package com.cntt.rentalmanagement;

import com.cntt.rentalmanagement.config.AppProperties;
import com.cntt.rentalmanagement.config.FileStorageProperties;
import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableAsync;
import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@EnableConfigurationProperties({FileStorageProperties.class, AppProperties.class})
@Slf4j
public class RentalManagementApplication {

    @Value("${spring.ai.openai.api-key}")
    private String key;

    @PostConstruct
    public void logKey() {
        log.info("API_KEY: {}", key);
    }

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .load();

        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );

        SpringApplication.run(RentalManagementApplication.class, args);
    }

    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }

}
