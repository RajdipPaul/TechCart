
package com.TechCart.user;

import com.TechCart.exception.DuplicateEmailException;
import com.TechCart.exception.InvalidCredentialsException;
import com.TechCart.exception.UserNotFoundException;
import com.TechCart.security.JwtService;
import com.TechCart.user.dto.LoginRequest;
import com.TechCart.user.dto.LoginResponse;
import com.TechCart.user.dto.RegisterRequest;
import com.TechCart.user.dto.UpdateProfileRequest;
import com.TechCart.user.dto.UserResponse;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // REGISTER USER
    public UserResponse registerUser(RegisterRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("Email is already registered");
        }

        User user = new User();

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());

        User savedUser = userRepository.save(user);

        return convertToResponse(savedUser);
    }

    // LOGIN USER
    public LoginResponse loginUser(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .filter(User::isActive)
                .orElseThrow(() ->
                        new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponse(
                token,
                user.getUserId(),
                user.getFullName(),
                user.getEmail()
        );
    }

    // GET CURRENT USER
    public UserResponse getCurrentUser(String email) {

        User user = findActiveUser(email);

        return convertToResponse(user);
    }

    // UPDATE PROFILE
    @Transactional
    public UserResponse updateProfile(
            String currentEmail,
            UpdateProfileRequest request) {

        User user = findActiveUser(currentEmail);

        boolean nameProvided = request.getFullName() != null;
        boolean phoneProvided = request.getPhoneNumber() != null;

        if (!nameProvided && !phoneProvided) {
            throw new IllegalArgumentException(
                    "Provide at least one field to update");
        }

        if (nameProvided) {

            String fullName = request.getFullName().trim();

            if (fullName.isEmpty()) {
                throw new IllegalArgumentException(
                        "Full name cannot be blank");
            }

            user.setFullName(fullName);
        }

        if (phoneProvided) {

            String phoneNumber = request.getPhoneNumber().trim();

            user.setPhoneNumber(
                    phoneNumber.isEmpty() ? null : phoneNumber
            );
        }

        User updatedUser = userRepository.save(user);

        return convertToResponse(updatedUser);
    }

    // PERMANENTLY DELETE ACCOUNT
    @Transactional
    public void deleteAccount(String email) {

        User user = findActiveUser(email);

        userRepository.delete(user);
    }

    // FIND ACTIVE USER
    public User findActiveUser(String email) {

        return userRepository.findByEmail(email)
                .filter(User::isActive)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));
    }

    // CONVERT ENTITY TO RESPONSE
    private UserResponse convertToResponse(User user) {

        return new UserResponse(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getCreatedAt()
        );
    }
}
