package com.example.weconnect.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Configuration
public class JacksonConfig {
    // Primary format for serialization
    private static final String DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();

        // Create JavaTimeModule
        JavaTimeModule javaTimeModule = new JavaTimeModule();

        // Create a flexible formatter that can handle multiple date formats
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATE_TIME_FORMAT);

        // Add custom serializer and deserializer for LocalDateTime
        javaTimeModule.addSerializer(LocalDateTime.class, new LocalDateTimeSerializer(formatter));
        javaTimeModule.addDeserializer(LocalDateTime.class, new CustomLocalDateTimeDeserializer());

        // Register the module
        objectMapper.registerModule(javaTimeModule);

        // Disable writing dates as timestamps
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Configure to be more lenient with unknown properties
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        return objectMapper;
    }

    /**
     * Custom deserializer that can handle multiple date formats
     */
    private static class CustomLocalDateTimeDeserializer extends LocalDateTimeDeserializer {
        private static final Logger logger = LoggerFactory.getLogger(CustomLocalDateTimeDeserializer.class);

        // Define multiple formatters to try
        private static final DateTimeFormatter[] FORMATTERS = new DateTimeFormatter[] {
            // ISO format with milliseconds
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
            // ISO format without milliseconds
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'"),
            // ISO format without Z
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
            // ISO format with timezone offset
            DateTimeFormatter.ISO_OFFSET_DATE_TIME,
            // Basic ISO format
            DateTimeFormatter.ISO_LOCAL_DATE_TIME
        };

        public CustomLocalDateTimeDeserializer() {
            super(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"));
        }

        @Override
        public LocalDateTime deserialize(JsonParser parser, DeserializationContext context) throws IOException {
            String dateStr = parser.getText();
            logger.debug("Attempting to parse date string: {}", dateStr);

            // Try each formatter
            for (DateTimeFormatter formatter : FORMATTERS) {
                try {
                    // If parsing succeeds, return the parsed date
                    LocalDateTime result = LocalDateTime.parse(dateStr, formatter);
                    logger.debug("Successfully parsed with formatter: {}", formatter);
                    return result;
                } catch (DateTimeParseException e) {
                    // Continue to the next formatter
                    logger.trace("Failed to parse with formatter: {}", formatter);
                }
            }

            // If all formatters fail, try the default deserializer
            try {
                logger.warn("Falling back to default deserializer for date string: {}", dateStr);
                return super.deserialize(parser, context);
            } catch (Exception e) {
                logger.error("Failed to parse date string: {}", dateStr, e);
                throw e;
            }
        }
    }
}
