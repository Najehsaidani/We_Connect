package com.iset.clubservice.service;

import com.iset.clubservice.model.Reponse.Reponsecatogorie;
import com.iset.clubservice.model.dto.CategoryDto;
import com.iset.clubservice.model.entity.Category;
import java.util.List;

public interface CategoryService {
    CategoryDto createCategory(Category category);
    CategoryDto updateCategory(Long id, Category category);
    void deleteCategory(Long id);
    List<Reponsecatogorie> getAllCategories();
    CategoryDto getCategoryById(Long id);
}
