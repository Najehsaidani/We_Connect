package com.example.weconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.example.weconnect.client") 
public class WeConnectApplication {
    public static void main(String[] args) {
        SpringApplication.run(WeConnectApplication.class, args);
    }
}
