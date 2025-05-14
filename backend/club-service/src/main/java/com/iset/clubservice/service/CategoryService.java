package com.iset.clubservice.service;

import com.iset.clubservice.model.entity.Category;
import java.util.List;

public interface CategoryService {
    Category createCategory(Category category);
    Category updateCategory(Long id, Category category);
    void deleteCategory(Long id);
    List<Category> getAllCategories();
    Category getCategoryById(Long id);
}
