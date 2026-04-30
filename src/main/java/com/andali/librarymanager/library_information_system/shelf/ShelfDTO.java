package com.andali.librarymanager.library_information_system.shelf;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShelfDTO {
    private Long id;
    
    @NotBlank(message = "Location code is required")
    private String locationCode;
    
    private String description;
}
