
package com.TechCart.user;

import com.TechCart.user.dto.RegisterRequest;
import com.TechCart.user.dto.LoginRequest;
import com.TechCart.user.dto.LoginResponse;
import com.TechCart.user.dto.UserResponse;
import com.TechCart.user.dto.UpdateProfileRequest;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // REGISTER
    @PostMapping("/api/auth/register")
    public ResponseEntity<UserResponse> registerUser(
            @Valid @RequestBody RegisterRequest request) {

        UserResponse response = userService.registerUser(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // LOGIN
    @PostMapping("/api/auth/login")
    public ResponseEntity<LoginResponse> loginUser(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = userService.loginUser(request);

        return ResponseEntity.ok(response);
    }

    // GET CURRENT USER PROFILE
    @GetMapping("/api/users/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails) {

        UserResponse response =
                userService.getCurrentUser(userDetails.getUsername());

        return ResponseEntity.ok(response);
    }

    // UPDATE PROFILE
    @PutMapping("/api/users/me")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {

        UserResponse response = userService.updateProfile(
                userDetails.getUsername(),
                request
        );

        return ResponseEntity.ok(response);
    }

    // DELETE ACCOUNT
    @DeleteMapping("/api/users/me")
    public ResponseEntity<Void> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails) {

        userService.deleteAccount(userDetails.getUsername());

        return ResponseEntity.noContent().build();
    }
}
