// page initialization
document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const dateInput = document.getElementById("date");
    const saveBtn = document.getElementById("save-button");
    const ALERTS_MANAGER = new Alerts("alerts-container");
    
    dateInput.valueAsDate = new Date();
    const userSettings = new UserSettings(themeToggleBtn);

    saveBtn.addEventListener("click", async () => {
        const foodChoiceForm = document.getElementById("food-choice-form");
        if (foodChoiceForm) {
            const formData = new FormData(foodChoiceForm);
            const data = Object.fromEntries(formData.entries());
            const foodChoicesRepo = new FoodChoicesRepo();

            try {
                const id = await foodChoicesRepo.addFoodChoice(data.date, data.foodItem, data.healthScore);
                ALERTS_MANAGER.addAlert('Successfully added food choice', 'success');
            }
            catch (error) {
                ALERTS_MANAGER.addAlert('Failed to add food choice', 'error');
            }
        }
    });

});