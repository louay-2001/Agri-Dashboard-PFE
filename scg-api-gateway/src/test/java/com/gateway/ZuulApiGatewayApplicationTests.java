package com.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
class ZuulApiGatewayApplicationTests {

	@Autowired
	private WebTestClient webTestClient;

	@Test
	void contextLoads() {
	}

	@Test
	void actuatorGatewayRoutesExposesDeviceServiceRoute() {
		webTestClient.get()
				.uri("/actuator/gateway/routes")
				.exchange()
				.expectStatus().isOk()
				.expectBody(String.class)
				.value(body -> assertThat(body).contains("device-service"));
	}

	@Test
	void agritechRoutesRequireAuthorizationThroughGateway() {
		webTestClient.get()
				.uri("/api/agro/organizations")
				.exchange()
				.expectStatus().isUnauthorized()
				.expectBody(String.class)
				.value(body -> assertThat(body).contains("Missing or invalid Authorization header"));
	}

}
