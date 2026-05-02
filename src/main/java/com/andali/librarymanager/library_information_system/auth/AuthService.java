package com.andali.librarymanager.library_information_system.auth;

import com.andali.librarymanager.library_information_system.exception.DuplicateResourceException;
import com.andali.librarymanager.library_information_system.exception.ResourceNotFoundException;
import com.andali.librarymanager.library_information_system.security.JwtTokenProvider;
import com.andali.librarymanager.library_information_system.user.User;
import com.andali.librarymanager.library_information_system.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists");
        }
        
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.valueOf(request.getRole() != null ? request.getRole() : "STUDENT"))
                .contact(request.getContact())
                .build();
        
        userRepository.save(user);
        
        String token = tokenProvider.generateToken(user.getEmail());
        
        return AuthResponse.builder()
                .token(token)
                .user(mapToUserDTO(user))
                .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), 
                        request.getPassword()
                        )
        );
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        String token = tokenProvider.generateToken(user.getEmail());
        
        return AuthResponse.builder()
                .token(token)
                .user(mapToUserDTO(user))
                .build();
    }
    
    public UserDTO getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToUserDTO(user);
    }
    
    private UserDTO mapToUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .contact(user.getContact())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
