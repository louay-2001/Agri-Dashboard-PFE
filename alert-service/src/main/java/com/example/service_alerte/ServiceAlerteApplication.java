package com.example.service_alerte;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ServiceAlerteApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServiceAlerteApplication.class, args);
	}

}
