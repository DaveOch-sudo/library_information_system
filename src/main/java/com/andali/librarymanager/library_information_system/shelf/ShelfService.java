package com.andali.librarymanager.library_information_system.shelf;

import com.andali.librarymanager.library_information_system.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class ShelfService {
    
    @Autowired
    private ShelfRepository shelfRepository;
    
    public ShelfDTO createShelf(ShelfDTO shelfDTO) {
        Shelf shelf = Shelf.builder()
                .locationCode(shelfDTO.getLocationCode())
                .description(shelfDTO.getDescription())
                .build();
        shelfRepository.save(shelf);
        return mapToShelfDTO(shelf);
    }
    
    public Page<ShelfDTO> getAllShelves(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return shelfRepository.findAll(pageable).map(this::mapToShelfDTO);
    }
    
    public ShelfDTO getShelfById(Long id) {
        Shelf shelf = shelfRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelf not found"));
        return mapToShelfDTO(shelf);
    }
    
    public ShelfDTO updateShelf(Long id, ShelfDTO shelfDTO) {
        Shelf shelf = shelfRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelf not found"));
        if (shelfDTO.getLocationCode() != null) shelf.setLocationCode(shelfDTO.getLocationCode());
        if (shelfDTO.getDescription() != null) shelf.setDescription(shelfDTO.getDescription());
        shelfRepository.save(shelf);
        return mapToShelfDTO(shelf);
    }
    
    public void deleteShelf(Long id) {
        Shelf shelf = shelfRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shelf not found"));
        shelfRepository.delete(shelf);
    }
    
    private ShelfDTO mapToShelfDTO(Shelf shelf) {
        return ShelfDTO.builder()
                .id(shelf.getId())
                .locationCode(shelf.getLocationCode())
                .description(shelf.getDescription())
                .build();
    }
}
