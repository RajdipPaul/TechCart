package com.TechCart.order;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PayPalService {

    private static final Logger logger =
            LoggerFactory.getLogger(PayPalService.class);

    private final RestClient paypalRestClient;
    private final String clientId;
    private final String clientSecret;
    private final String returnUrl;
    private final String cancelUrl;
    private final BigDecimal inrPerUsd;

    public PayPalService(
            RestClient paypalRestClient,
            @Value("${paypal.client-id}") String clientId,
            @Value("${paypal.client-secret}") String clientSecret,
            @Value("${paypal.return-url}") String returnUrl,
            @Value("${paypal.cancel-url}") String cancelUrl,
            @Value("${paypal.inr-per-usd}") BigDecimal inrPerUsd) {

        this.paypalRestClient = paypalRestClient;
        this.clientId = requireConfiguration(clientId, "PayPal client ID");
        this.clientSecret = requireConfiguration(clientSecret, "PayPal client secret");
        this.returnUrl = requireConfiguration(returnUrl, "PayPal return URL");
        this.cancelUrl = requireConfiguration(cancelUrl, "PayPal cancel URL");

        if (inrPerUsd == null || inrPerUsd.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException(
                    "PayPal INR-to-USD exchange rate must be greater than zero.");
        }

        this.inrPerUsd = inrPerUsd;
    }

    // ------------------------------------------------
    // CONVERT INR TO USD FOR PAYPAL
    // ------------------------------------------------

    public BigDecimal convertInrToUsd(
            BigDecimal inrAmount,
            String sourceCurrency) {

        if (inrAmount == null
                || inrAmount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero.");
        }

        if (sourceCurrency == null
                || !"INR".equalsIgnoreCase(sourceCurrency.trim())) {

            throw new IllegalArgumentException(
                    "Only INR orders are supported for PayPal conversion.");
        }

        return inrAmount.divide(
                inrPerUsd,
                2,
                RoundingMode.HALF_UP);
    }

    // ------------------------------------------------
    // GENERATE PAYPAL OAUTH ACCESS TOKEN
    // ------------------------------------------------

    public String generateAccessToken() {

        MultiValueMap<String, String> formData =
                new LinkedMultiValueMap<>();

        formData.add("grant_type", "client_credentials");

        try {
            Map<String, Object> response = paypalRestClient.post()
                    .uri("/v1/oauth2/token")
                    .headers(headers -> {
                        headers.setBasicAuth(clientId, clientSecret);
                        headers.setContentType(
                                MediaType.APPLICATION_FORM_URLENCODED);
                        headers.setAccept(
                                List.of(MediaType.APPLICATION_JSON));
                    })
                    .body(formData)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null
                    || response.get("access_token") == null
                    || response.get("access_token").toString().isBlank()) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "PayPal did not return a valid access token.");
            }

            return response.get("access_token").toString();

        } catch (RestClientResponseException exception) {

            logger.error(
                    "PayPal OAuth failed. HTTP Status: {}, Response: {}",
                    exception.getStatusCode(),
                    exception.getResponseBodyAsString());

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "PayPal authentication failed. Check backend logs.");

        } catch (RestClientException exception) {

            logger.error("PayPal OAuth connection failed.", exception);

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to connect to PayPal.");
        }
    }

    // ------------------------------------------------
    // CREATE PAYPAL ORDER
    // ------------------------------------------------

    public Map<String, Object> createPayPalOrder(
            BigDecimal amount,
            String currency,
            String orderNumber) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Payment amount must be greater than zero.");
        }

        if (currency == null
                || !currency.trim().matches("[A-Za-z]{3}")) {

            throw new IllegalArgumentException(
                    "A valid three-letter currency code is required.");
        }

        if (orderNumber == null || orderNumber.isBlank()) {
            throw new IllegalArgumentException(
                    "Order number is required.");
        }

        BigDecimal formattedAmount;

        try {
            formattedAmount = amount.setScale(2, RoundingMode.UNNECESSARY);
        } catch (ArithmeticException exception) {
            throw new IllegalArgumentException(
                    "Payment amount cannot have more than two decimal places.",
                    exception);
        }

        String accessToken = generateAccessToken();

        String formattedCurrency =
                currency.trim().toUpperCase(Locale.ROOT);

        Map<String, Object> amountDetails = Map.of(
                "currency_code", formattedCurrency,
                "value", formattedAmount.toPlainString()
        );

        Map<String, Object> purchaseUnit = Map.of(
                "reference_id", orderNumber,
                "invoice_id", orderNumber,
                "amount", amountDetails
        );

        Map<String, Object> experienceContext = Map.of(
                "return_url", returnUrl,
                "cancel_url", cancelUrl,
                "user_action", "PAY_NOW"
        );

        Map<String, Object> paymentSource = Map.of(
                "paypal", Map.of(
                        "experience_context", experienceContext
                )
        );

        Map<String, Object> requestBody = Map.of(
                "intent", "CAPTURE",
                "purchase_units", List.of(purchaseUnit),
                "payment_source", paymentSource
        );

        try {
            Map<String, Object> response = paypalRestClient.post()
                    .uri("/v2/checkout/orders")
                    .headers(headers -> {
                        headers.setBearerAuth(accessToken);
                        headers.setContentType(MediaType.APPLICATION_JSON);
                        headers.setAccept(
                                List.of(MediaType.APPLICATION_JSON));
                        headers.set("Prefer", "return=representation");
                    })
                    .body(requestBody)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null || response.get("id") == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "PayPal did not return a valid order.");
            }

            return response;

        } catch (RestClientResponseException exception) {

            logger.error(
                    "PayPal order creation failed. HTTP Status: {}, Response: {}",
                    exception.getStatusCode(),
                    exception.getResponseBodyAsString());

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "PayPal rejected the order request. Check backend logs.");

        } catch (RestClientException exception) {

            logger.error("PayPal order creation connection failed.", exception);

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to connect to PayPal.");
        }
    }

    // ------------------------------------------------
    // CAPTURE APPROVED PAYPAL PAYMENT
    // ------------------------------------------------

    public Map<String, Object> capturePayPalOrder(
            String paypalOrderId) {

        if (paypalOrderId == null || paypalOrderId.isBlank()) {
            throw new IllegalArgumentException(
                    "PayPal order ID is required.");
        }

        String accessToken = generateAccessToken();

        try {
            Map<String, Object> response = paypalRestClient.post()
                    .uri("/v2/checkout/orders/{id}/capture", paypalOrderId)
                    .headers(headers -> {
                        headers.setBearerAuth(accessToken);
                        headers.setContentType(MediaType.APPLICATION_JSON);
                        headers.setAccept(
                                List.of(MediaType.APPLICATION_JSON));
                        headers.set("Prefer", "return=representation");
                    })
                    .body(Map.of())
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response == null || response.get("status") == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_GATEWAY,
                        "PayPal did not return a valid capture response.");
            }

            return response;

        } catch (RestClientResponseException exception) {

            logger.error(
                    "PayPal capture failed. HTTP Status: {}, Response: {}",
                    exception.getStatusCode(),
                    exception.getResponseBodyAsString());

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "PayPal rejected the capture request. Check backend logs.");

        } catch (RestClientException exception) {

            logger.error("PayPal capture connection failed.", exception);

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to connect to PayPal.");
        }
    }

    // ------------------------------------------------
    // CONFIGURATION VALIDATION
    // ------------------------------------------------

    private String requireConfiguration(
            String value,
            String propertyName) {

        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    propertyName
                            + " is missing. Check application.properties and environment variables.");
        }

        return value.trim();
    }
}
