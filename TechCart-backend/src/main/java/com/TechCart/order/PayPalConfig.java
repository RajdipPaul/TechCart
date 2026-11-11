
package com.TechCart.order;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class PayPalConfig {

    @Value("${paypal.base-url}")
    private String paypalBaseUrl;

    @Bean
    public RestClient paypalRestClient() {
        return RestClient.builder()
                .baseUrl(paypalBaseUrl)
                .build();
    }
}
