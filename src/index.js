// page initialization
document.addEventListener("DOMContentLoaded", () => {
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const dateInput = document.getElementById("date");
    const saveBtn = document.getElementById("save-button");
    const ALERTS_MANAGER = new Alerts("alerts-container");
    const userSettings = new UserSettings(themeToggleBtn);


    setDateInput(dateInput);

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

function setDateInput(dateInput)
{
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    dateInput.value = `${year}-${month}-${day}`;
}