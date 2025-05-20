package com.iset.clubservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.iset.clubservice.client")
public class ClubserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ClubserviceApplication.class, args);
	}

}
