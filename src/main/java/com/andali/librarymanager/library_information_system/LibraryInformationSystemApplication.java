package com.andali.librarymanager.library_information_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LibraryInformationSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(LibraryInformationSystemApplication.class, args);
	}

}
