
package com.TechCart.ai;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import com.TechCart.ai.dto.AiChatRequest;
import com.TechCart.ai.dto.AiChatResponse;
import com.TechCart.conversation.MessageService;
import com.TechCart.conversation.dto.MessageResponse;
import com.TechCart.product.Product;
import com.TechCart.product.ProductRepository;

@Service
public class AiService {

    @Value("${gemini.api-key}")
    private String geminiApiKey;

    @Value("${gemini.base-url}")
    private String geminiBaseUrl;

    @Value("${gemini.model}")
    private String geminiModel;

    private final MessageService messageService;
    private final ProductRepository productRepository;

    public AiService(
            MessageService messageService,
            ProductRepository productRepository) {

        this.messageService = messageService;
        this.productRepository = productRepository;
    }

    public AiChatResponse chat(
            AiChatRequest request,
            Authentication authentication) {

        // Validate request
        if (request == null || request.getConverId() == null) {
            throw new IllegalArgumentException(
                    "Conversation ID is required");
        }

        if (request.getMessage() == null
                || request.getMessage().isBlank()) {

            throw new IllegalArgumentException(
                    "Message cannot be empty");
        }

        // Save user's message
        MessageResponse userMessage =
                messageService.saveMessage(
                        request.getConverId(),
                        "USER",
                        request.getMessage(),
                        authentication
                );

        // Retrieve complete conversation history
        List<MessageResponse> history =
                messageService.getMessages(
                        request.getConverId(),
                        authentication
                );

        // Retrieve active products from MySQL
        List<Product> products =
                productRepository.findAllByIsActiveTrue();

        // Build Gemini request
        Map<String, Object> geminiRequest =
                buildGeminiRequest(history, products);

        // Get AI response
        String aiReply = generateResponse(geminiRequest);

        if (aiReply == null || aiReply.isBlank()) {
            throw new IllegalStateException(
                    "Gemini returned an empty response");
        }

        // Save assistant's response
        MessageResponse assistantMessage =
                messageService.saveMessage(
                        request.getConverId(),
                        "ASSISTANT",
                        aiReply,
                        authentication
                );

        // Prepare final response
        AiChatResponse response = new AiChatResponse();

        response.setConverId(request.getConverId());
        response.setUserMessage(userMessage);
        response.setAssistantMessage(assistantMessage);

        return response;
    }

    // Build conversation history and product context
    private Map<String, Object> buildGeminiRequest(
            List<MessageResponse> history,
            List<Product> products) {

        String systemPrompt = """
                You are TechCart's AI Shopkeeper.

                Your job is to help customers choose electronics
                such as laptops, monitors, keyboards and accessories.

                Guidelines:
                1. Understand the customer's needs and budget.
                2. Ask relevant follow-up questions when necessary.
                3. Recommend products using only the supplied TechCart
                   product information.
                4. Never invent products, prices, specifications or stock.
                5. Compare products clearly when requested.
                6. Explain why a product suits the customer's needs.
                7. If no suitable product exists, say so honestly.
                8. Do not claim that a product is available if its stock
                   quantity is zero.
                9. Be friendly, helpful and conversational.
                10. Suggest relevant accessories only when useful.

                TECHCART PRODUCT CATALOG:
                """ + buildProductContext(products);

        List<Map<String, Object>> contents =
                new ArrayList<>();

        for (MessageResponse message : history) {

            Map<String, Object> content = new HashMap<>();

            String role = "USER".equalsIgnoreCase(message.getRole())
                    ? "user"
                    : "model";

            content.put("role", role);

            content.put("parts", List.of(
                    Map.of("text", message.getMessage())
            ));

            contents.add(content);
        }

        Map<String, Object> systemInstruction =
                Map.of(
                        "parts",
                        List.of(Map.of("text", systemPrompt))
                );

        Map<String, Object> generationConfig =
                Map.of(
                        "temperature", 0.7,
                        "maxOutputTokens", 1000
                );

        Map<String, Object> request = new HashMap<>();

        request.put("systemInstruction", systemInstruction);
        request.put("contents", contents);
        request.put("generationConfig", generationConfig);

        return request;
    }

    // Convert database products into AI-readable information
    private String buildProductContext(List<Product> products) {

        StringBuilder context = new StringBuilder();

        if (products.isEmpty()) {
            return "No active products are currently available.";
        }

        for (Product product : products) {

            context.append("\nProduct ID: ")
                    .append(product.getPId());

            context.append("\nName: ")
                    .append(product.getPName());

            context.append("\nBrand: ")
                    .append(product.getBrand());

            context.append("\nCategory: ")
                    .append(product.getCategory());

            context.append("\nPrice: ")
                    .append(product.getCurrency())
                    .append(" ")
                    .append(product.getPrice());

            context.append("\nStock: ")
                    .append(product.getStockQuantity());

            context.append("\nDescription: ")
                    .append(product.getDescription());

            context.append("\nProcessor: ")
                    .append(product.getProcessor());

            context.append("\nRAM: ")
                    .append(product.getRamGb())
                    .append(" GB");

            context.append("\nStorage: ")
                    .append(product.getStorageGb())
                    .append(" GB ")
                    .append(product.getStorageType());

            context.append("\nGraphics: ")
                    .append(product.getGraphics());

            context.append("\nDisplay: ")
                    .append(product.getDisplaySizeInches())
                    .append(" inches, ")
                    .append(product.getDisplayReso());

            context.append("\nWeight: ")
                    .append(product.getWeightKg())
                    .append(" kg");

            context.append("\n----------------------\n");
        }

        return context.toString();
    }

    // Call Gemini API
    private String generateResponse(
            Map<String, Object> requestBody) {

        try {

            Map<?, ?> response = RestClient.create(geminiBaseUrl)
                    .post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1beta/models/{model}:generateContent")
                            .queryParam("key", geminiApiKey)
                            .build(geminiModel))
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                throw new IllegalStateException(
                        "Gemini returned no response");
            }

            Object candidatesObject = response.get("candidates");

            if (!(candidatesObject instanceof List<?> candidates)
                    || candidates.isEmpty()) {
                throw new IllegalStateException(
                        "Gemini returned no candidates");
            }

            Object candidateObject = candidates.get(0);

            if (!(candidateObject instanceof Map<?, ?> candidate)) {
                throw new IllegalStateException(
                        "Invalid Gemini candidate response");
            }

            Object contentObject = candidate.get("content");

            if (!(contentObject instanceof Map<?, ?> content)) {
                throw new IllegalStateException(
                        "Gemini response content is missing");
            }

            Object partsObject = content.get("parts");

            if (!(partsObject instanceof List<?> parts)
                    || parts.isEmpty()) {
                throw new IllegalStateException(
                        "Gemini response parts are missing");
            }

            Object partObject = parts.get(0);

            if (!(partObject instanceof Map<?, ?> part)) {
                throw new IllegalStateException(
                        "Invalid Gemini response part");
            }

            Object textObject = part.get("text");

            return textObject instanceof String text ? text : null;

        } catch (RestClientResponseException exception) {

            throw new IllegalStateException(
                    "Gemini API request failed. HTTP status: "
                            + exception.getStatusCode()
                            + ", response: "
                            + exception.getResponseBodyAsString(),
                    exception
            );

        } catch (RestClientException exception) {

            throw new IllegalStateException(
                    "Unable to connect to Gemini API",
                    exception
            );
        }
    }
}
