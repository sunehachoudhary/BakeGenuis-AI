document.addEventListener("DOMContentLoaded", function () {
            // Mobile Navigation Toggle
            const hamburger = document.getElementById('hamburger');
            const navLinks = document.getElementById('navLinks');

            if (hamburger && navLinks) {
                hamburger.addEventListener('click', () => {
                    navLinks.classList.toggle('active');
                    hamburger.classList.toggle('active');
                });

                // Close mobile menu when clicking on a link
                const navItems = document.querySelectorAll('.nav-links a');
                navItems.forEach(item => {
                    item.addEventListener('click', () => {
                        navLinks.classList.remove('active');
                        hamburger.classList.remove('active');
                    });
                });
            }

            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (hamburger && navLinks && !hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            });
        });

        // Customize Page Logic
        // Sample ingredients data (in real app, this would come from previous conversion)
        const sampleIngredients = [
            {
                name: 'All-Purpose Flour',
                icon: '🌾',
                currentGrams: 120,
                measurementType: 'sifted',
                originalAmount: '1 cup'
            },
            {
                name: 'Brown Sugar',
                icon: '🍯',
                currentGrams: 200,
                measurementType: 'packed',
                originalAmount: '1 cup'
            },
            {
                name: 'Butter',
                icon: '🧈',
                currentGrams: 226,
                measurementType: 'softened',
                originalAmount: '1 cup'
            },
            {
                name: 'Vanilla Extract',
                icon: '🌟',
                currentGrams: 4,
                measurementType: 'liquid',
                originalAmount: '1 tsp'
            },
            {
                name: 'Baking Powder',
                icon: '⚡',
                currentGrams: 4,
                measurementType: 'leveled',
                originalAmount: '1 tsp'
            }
        ];

        // Load ingredients from localStorage or use sample data
        function loadIngredients() {
            const savedIngredients = localStorage.getItem('bakegenius_ingredients');
            return savedIngredients ? JSON.parse(savedIngredients) : sampleIngredients;
        }

        // Render ingredient cards
        function renderIngredients() {
            const ingredients = loadIngredients();
            const container = document.getElementById('ingredientsContainer');
            
            container.innerHTML = ingredients.map((ingredient, index) => `
                <div class="ingredient-card">
                    <div class="ingredient-header">
                        <span class="ingredient-icon">${ingredient.icon}</span>
                        <span class="ingredient-name">${ingredient.name}</span>
                        <span class="tooltip" data-tooltip="Original: ${ingredient.originalAmount}">ℹ️</span>
                    </div>
                    <div class="ingredient-controls">
                        <div class="control-group">
                            <label class="control-label">Measurement Type</label>
                            <select class="custom-select" data-ingredient="${index}" data-field="measurementType">
                                <option value="sifted" ${ingredient.measurementType === 'sifted' ? 'selected' : ''}>Sifted</option>
                                <option value="packed" ${ingredient.measurementType === 'packed' ? 'selected' : ''}>Packed</option>
                                <option value="leveled" ${ingredient.measurementType === 'leveled' ? 'selected' : ''}>Leveled</option>
                                <option value="heaped" ${ingredient.measurementType === 'heaped' ? 'selected' : ''}>Heaped</option>
                                <option value="melted" ${ingredient.measurementType === 'melted' ? 'selected' : ''}>Melted</option>
                                <option value="softened" ${ingredient.measurementType === 'softened' ? 'selected' : ''}>Softened</option>
                                <option value="liquid" ${ingredient.measurementType === 'liquid' ? 'selected' : ''}>Liquid</option>
                            </select>
                        </div>
                        <div class="control-group">
                            <label class="control-label">Grams Override</label>
                            <input type="number" class="custom-input" 
                                   value="${ingredient.currentGrams}" 
                                   data-ingredient="${index}" 
                                   data-field="currentGrams"
                                   min="1" max="1000" step="0.1">
                        </div>
                    </div>
                </div>
            `).join('');

            // Add event listeners
            addEventListeners();
        }

        // Add event listeners to all controls
        function addEventListeners() {
            const selects = document.querySelectorAll('.custom-select');
            const inputs = document.querySelectorAll('.custom-input');
            
            [...selects, ...inputs].forEach(element => {
                element.addEventListener('change', updateIngredient);
            });

            // Brand selector listeners
            document.querySelectorAll('.brand-option').forEach(option => {
                option.addEventListener('click', selectBrand);
            });
        }

        // Update ingredient data when controls change
        function updateIngredient(event) {
            const ingredientIndex = parseInt(event.target.dataset.ingredient);
            const field = event.target.dataset.field;
            const value = event.target.type === 'number' ? parseFloat(event.target.value) : event.target.value;
            
            const ingredients = loadIngredients();
            ingredients[ingredientIndex][field] = value;
            
            // Auto-save changes
            localStorage.setItem('bakegenius_ingredients', JSON.stringify(ingredients));
        }

        // Brand selection
        function selectBrand(event) {
            document.querySelectorAll('.brand-option').forEach(option => {
                option.classList.remove('selected');
            });
            event.target.classList.add('selected');
            
            const selectedBrand = event.target.dataset.brand;
            localStorage.setItem('bakegenius_brand', selectedBrand);
            
            // Adjust gram values based on brand (simulation)
            adjustForBrand(selectedBrand);
        }

        // Adjust ingredient weights based on selected brand
        function adjustForBrand(brand) {
            const ingredients = loadIngredients();
            const adjustments = {
                'king-arthur': { 'All-Purpose Flour': 125 },
                'bob-red-mill': { 'All-Purpose Flour': 118 },
                'gold-medal': { 'All-Purpose Flour': 120 },
                'standard': { 'All-Purpose Flour': 120 }
            };

            if (adjustments[brand]) {
                ingredients.forEach(ingredient => {
                    if (adjustments[brand][ingredient.name]) {
                        ingredient.currentGrams = adjustments[brand][ingredient.name];
                    }
                });
                
                localStorage.setItem('bakegenius_ingredients', JSON.stringify(ingredients));
                renderIngredients();
            }
        }

        // Apply changes function
        function applyChanges() {
            const button = event.target;
            button.style.transform = 'scale(0.95)';
            button.innerHTML = '⏳ Applying...';
            
            setTimeout(() => {
                button.style.transform = '';
                button.innerHTML = '✨ Apply Changes';
                showSuccessMessage('Changes applied successfully!');
            }, 1000);
        }

        // Reset to defaults
        function resetToDefaults() {
            if (confirm('Are you sure you want to reset all customizations to default values?')) {
                localStorage.removeItem('bakegenius_ingredients');
                localStorage.removeItem('bakegenius_brand');
                
                // Reset brand selection
                document.querySelectorAll('.brand-option').forEach(option => {
                    option.classList.remove('selected');
                });
                document.querySelector('[data-brand="standard"]').classList.add('selected');
                
                renderIngredients();
                showSuccessMessage('Reset to defaults successfully!');
            }
        }

        // Save settings
        function saveSettings() {
            const button = event.target;
            button.style.transform = 'scale(0.95)';
            button.innerHTML = '💾 Saving...';
            
            setTimeout(() => {
                button.style.transform = '';
                button.innerHTML = '💾 Save Settings';
                showSuccessMessage('Settings saved to your browser!');
            }, 800);
        }

        // Show success message
        function showSuccessMessage(message) {
            const successDiv = document.getElementById('successMessage');
            successDiv.textContent = `✨ ${message}`;
            successDiv.style.display = 'block';
            
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 3000);
        }

        // Load saved brand preference
        function loadBrandPreference() {
            const savedBrand = localStorage.getItem('bakegenius_brand') || 'standard';
            document.querySelectorAll('.brand-option').forEach(option => {
                option.classList.remove('selected');
            });
            document.querySelector(`[data-brand="${savedBrand}"]`)?.classList.add('selected');
        }
        
        

        // Initialize page
        document.addEventListener('DOMContentLoaded', () => {
            renderIngredients();
            loadBrandPreference();
        });

        // Add some fun interactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ingredient-icon')) {
                e.target.style.animation = 'none';
                setTimeout(() => {
                    e.target.style.animation = 'bounce 0.5s ease';
                }, 10);
            }
        });
        
        // Back to Top Button Logic
        const backToTopBtn = document.getElementById("backToTop");
        window.addEventListener("scroll", () => {
            if (window.scrollY > 100) {
                backToTopBtn.classList.add("show");
            } else {
                backToTopBtn.classList.remove("show");
            }
        });
        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        //Top to Bottom Button Logic
        const ToptobackBtn = document.getElementById("Toptoback");
        window.addEventListener("scroll", () => {
            if (window.scrollY < 100) {
                ToptobackBtn.classList.add("show");
            } else {
                ToptobackBtn.classList.remove("show");
            }
        });
        ToptobackBtn.addEventListener("click", () => {
            window.scrollTo({ top: 10000, behavior: "smooth" });
        });

// Set active navigation link based on current page
document.addEventListener("DOMContentLoaded", function () {
    setActiveNavigation();
});

function setActiveNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}