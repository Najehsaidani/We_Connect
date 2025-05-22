package com.iset.clubservice.service.impl;

import com.iset.clubservice.model.Reponse.Reponsecatogorie;
import com.iset.clubservice.model.dto.CategoryDto;
import com.iset.clubservice.model.dto.ClubSummaryDto;
import com.iset.clubservice.model.entity.Category;
import com.iset.clubservice.model.entity.Club;
import com.iset.clubservice.repository.CategoryRepository;
import com.iset.clubservice.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public CategoryDto createCategory(Category category) {
        Category savedCategory = categoryRepository.save(category);
        return toCategoryDto(savedCategory);
    }

    @Override
    public CategoryDto updateCategory(Long id, Category category) {
        Optional<Category> existing = categoryRepository.findById(id);
        if (existing.isPresent()) {
            Category toUpdate = existing.get();
            toUpdate.setNom(category.getNom());
            Category savedCategory = categoryRepository.save(toUpdate);
            return toCategoryDto(savedCategory);
        }
        return null;
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public List<Reponsecatogorie> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::toReponsecatogorie)
                .collect(Collectors.toList());
    }

    // Helper method to convert Category entity to Reponsecatogorie
    private Reponsecatogorie toReponsecatogorie(Category category) {
        return Reponsecatogorie.builder()
                .id(category.getId())
                .nom(category.getNom())
                .build();
    }

    @Override
    public CategoryDto getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(this::toCategoryDto)
                .orElse(null);
    }

    // Helper method to convert Category entity to CategoryDto
    private CategoryDto toCategoryDto(Category category) {
        List<ClubSummaryDto> clubDtos = null;
        if (category.getClubs() != null) {
            clubDtos = category.getClubs().stream()
                    .map(this::toClubSummaryDto)
                    .collect(Collectors.toList());
        }

        return CategoryDto.builder()
                .id(category.getId())
                .nom(category.getNom())
                .clubs(clubDtos)
                .build();
    }

    // Helper method to convert Club entity to ClubSummaryDto
    private ClubSummaryDto toClubSummaryDto(Club club) {
        int membersCount = club.getMembres() != null ? club.getMembres().size() : 0;

        return ClubSummaryDto.builder()
                .id(club.getId())
                .nom(club.getNom())
                .description(club.getDescription())
                .dateCreation(club.getDateCreation())
                .etat(club.getEtat())
                .members(membersCount)
                .banner(club.getBanner())
                .build();
    }

}
