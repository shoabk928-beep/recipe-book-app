// Select DOM Elements
const recipeForm = document.getElementById('recipe-form');
const recipeIdInput = document.getElementById('recipe-id');
const dishNameInput = document.getElementById('dish-name');
const categoryInput = document.getElementById('category');
const ingredientsInput = document.getElementById('ingredients');
const instructionsInput = document.getElementById('instructions');

const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search-input');
const recipesList = document.getElementById('recipes-list');
const recipeCount = document.getElementById('recipe-count');
const alertBox = document.getElementById('alert-box');

// Load recipes from Local Storage
let recipes = JSON.parse(localStorage.getItem('myRecipes')) || [];

// Render recipes on page load
document.addEventListener('DOMContentLoaded', () => {
    renderRecipes(recipes);
});

// Show Success or Error Alert Message
function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;

    setTimeout(() => {
        alertBox.classList.add('hidden');
    }, 3000);
}

// Save data to Local Storage
function saveToLocalStorage() {
    localStorage.setItem('myRecipes', JSON.stringify(recipes));
}

// Form Submit Event (Create & Update)
recipeForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = recipeIdInput.value;
    const dishName = dishNameInput.value.trim();
    const category = categoryInput.value.trim();
    const ingredients = ingredientsInput.value.trim();
    const instructions = instructionsInput.value.trim();

    // Input Validation
    if (!dishName || !category || !ingredients || !instructions) {
        showAlert('⚠️ Error: Please fill in all required fields!', 'error');
        return;
    }

    if (dishName.length < 3) {
        showAlert('⚠️ Error: Dish name must be at least 3 characters long!', 'error');
        return;
    }

    if (id) {
        // UPDATE Operation
        recipes = recipes.map(recipe => {
            if (recipe.id === id) {
                return { id, dishName, category, ingredients, instructions };
            }
            return recipe;
        });
        showAlert('✅ Recipe updated successfully!', 'success');
        resetForm();
    } else {
        // CREATE Operation
        const newRecipe = {
            id: Date.now().toString(),
            dishName,
            category,
            ingredients,
            instructions
        };
        recipes.unshift(newRecipe);
        showAlert('✅ New recipe saved successfully!', 'success');
        recipeForm.reset();
    }

    saveToLocalStorage();
    renderRecipes(recipes);
});

// READ Operation (Render recipes to screen)
function renderRecipes(recipesToRender) {
    recipesList.innerHTML = '';
    recipeCount.textContent = recipesToRender.length;

    if (recipesToRender.length === 0) {
        recipesList.innerHTML = `<p class="empty-msg">No recipes found. Add your first recipe using the form above! 🍽️</p>`;
        return;
    }

    recipesToRender.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';

        card.innerHTML = `
            <div>
                <div class="card-header">
                    <h3>${escapeHTML(recipe.dishName)}</h3>
                    <span class="badge">${escapeHTML(recipe.category)}</span>
                </div>
                <div class="card-body">
                    <p><strong>🛒 Ingredients:</strong><br>${escapeHTML(recipe.ingredients)}</p>
                    <p><strong>👨‍🍳 Instructions:</strong><br>${escapeHTML(recipe.instructions)}</p>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn edit-btn" onclick="editRecipe('${recipe.id}')">✏️ Edit</button>
                <button class="btn delete-btn" onclick="deleteRecipe('${recipe.id}')">🗑️ Delete</button>
            </div>
        `;

        recipesList.appendChild(card);
    });
}

// Edit Button Click - Load data into form
function editRecipe(id) {
    const recipeToEdit = recipes.find(recipe => recipe.id === id);
    if (!recipeToEdit) return;

    recipeIdInput.value = recipeToEdit.id;
    dishNameInput.value = recipeToEdit.dishName;
    categoryInput.value = recipeToEdit.category;
    ingredientsInput.value = recipeToEdit.ingredients;
    instructionsInput.value = recipeToEdit.instructions;

    formTitle.textContent = 'Edit Recipe';
    submitBtn.textContent = 'Update Recipe';
    cancelBtn.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Cancel Edit Button
cancelBtn.addEventListener('click', () => {
    resetForm();
});

// Reset form back to Add Mode
function resetForm() {
    recipeForm.reset();
    recipeIdInput.value = '';
    formTitle.textContent = 'Add New Recipe';
    submitBtn.textContent = 'Save Recipe';
    cancelBtn.classList.add('hidden');
}

// DELETE Operation
function deleteRecipe(id) {
    const confirmDelete = confirm('Are you sure you want to delete this recipe?');
    if (!confirmDelete) return;

    recipes = recipes.filter(recipe => recipe.id !== id);
    saveToLocalStorage();
    renderRecipes(recipes);
    showAlert('🗑️ Recipe deleted successfully.', 'success');

    if (recipeIdInput.value === id) {
        resetForm();
    }
}

// Live Search Feature
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    const filteredRecipes = recipes.filter(recipe =>
        recipe.dishName.toLowerCase().includes(query) ||
        recipe.ingredients.toLowerCase().includes(query) ||
        recipe.category.toLowerCase().includes(query)
    );

    renderRecipes(filteredRecipes);
});

// Security: Prevent XSS attacks by escaping user input
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}