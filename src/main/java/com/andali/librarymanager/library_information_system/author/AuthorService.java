package com.andali.librarymanager.library_information_system.author;

import com.andali.librarymanager.library_information_system.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class AuthorService {
    
    @Autowired
    private AuthorRepository authorRepository;
    
    public AuthorDTO createAuthor(AuthorDTO authorDTO) {
        Author author = Author.builder()
                .name(authorDTO.getName())
                .build();
        authorRepository.save(author);
        return mapToAuthorDTO(author);
    }
    
    public Page<AuthorDTO> getAllAuthors(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return authorRepository.findAll(pageable).map(this::mapToAuthorDTO);
    }
    
    public AuthorDTO getAuthorById(Long id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        return mapToAuthorDTO(author);
    }
    
    public AuthorDTO updateAuthor(Long id, AuthorDTO authorDTO) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        author.setName(authorDTO.getName());
        authorRepository.save(author);
        return mapToAuthorDTO(author);
    }
    
    public void deleteAuthor(Long id) {
        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Author not found"));
        authorRepository.delete(author);
    }
    
    private AuthorDTO mapToAuthorDTO(Author author) {
        return AuthorDTO.builder()
                .id(author.getId())
                .name(author.getName())
                .build();
    }
}
