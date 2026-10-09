const ALERTS_MANAGER = new Alerts("alerts-container");

const CHART_CATEGORIES = [
    { name: "Unhealthy", color: "#D93526" },
    { name: "Mostly Unhealthy", color: "#FF9500" },
    { name: "Borderline", color: "#F2DF0D" },
    { name: "Mostly Healthy", color: "#A5D601" },
    { name: "Healthy", color: "#398712" }
];

document.addEventListener("DOMContentLoaded", async () => {
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const userSettings = new UserSettings(themeToggleBtn);
    loadSummary();
});

async function loadSummary() {
    try {
        const foodChoicesRepo = new FoodChoicesRepo();
        const choices = await foodChoicesRepo.getTwoWeeksOfFoodChoices();
        const groupedChoices = groupChoices(choices);
        renderChart(groupedChoices);
        renderTable(choices);
        addDeleteButtonListeners();
        addViewButtonListeners();
        addModalCloseListener();
    }
    catch (error) {
        console.error('Failed to retrieve food choices:', error);
    }
}

function renderTable(choices) {
    const summaryTbody = document.getElementById('summary-tbody');
    
    summaryTbody.replaceChildren();

    // Check if there are no food choices and display a message if so.
    if (choices.length === 0) {
        summaryTbody.innerHTML = '<tr><td colspan="4">No food choices found.</td></tr>';
        return;
    }

    for (let choice of choices) {
        const row = document.createElement('tr');

        const dateTime = new Date(choice.date);
        const dayOfTheWeek = dateTime.toDateString();
        const color = getChoiceColor(choice);

        row.innerHTML = `
            <td>${dayOfTheWeek}</td>
            <td>
                <kbd style="background-color: ${color};">${choice.foodItem.substring(0, 10)}...</kbd>
            </td>
            <td>
                <button type="button" class="view-button table-btn" data-id="${choice.id}">👁️</button>
                <button type="button" class="delete-button table-btn" data-id="${choice.id}">❌</button>
            </td>
        `;           
        summaryTbody.appendChild(row);
    }
}

function getChoiceColor(choice)
{
    for (let category of CHART_CATEGORIES)
    {
        if (category.name === choice.healthScore)
        {
            return category.color;
        }
    }

    return "#454566";
}

function addDeleteButtonListeners() {
    const deleteBtns = document.getElementsByClassName("delete-button");
    for (const btn of deleteBtns)
    {
        btn.addEventListener("click", async (event) => {
            const id = event.target.dataset.id;
            const foodChoicesRepo = new FoodChoicesRepo();
            try {
                await foodChoicesRepo.deleteFoodChoice(id);
                ALERTS_MANAGER.addAlert('Successfully deleted food choice', 'success');
                loadSummary();
            }
            catch (error) {
                console.error('Failed to delete food choice:', error);
                ALERTS_MANAGER.addAlert('Failed to delete food choice', 'error');
            }
        });
    }
}

function addViewButtonListeners() {
    const viewbtns = document.getElementsByClassName("view-button");
    for (const btn of viewbtns)
    {
        btn.addEventListener("click", async (event) => {
            const id = event.target.dataset.id;
            const foodChoicesRepo = new FoodChoicesRepo();
            try {
                const choice = await foodChoicesRepo.getFoodChoiceById(id);
                if (choice) {
                    setChoiceViewModalValues(choice);
                    document.querySelector('dialog').showModal();
                }
            }
            catch (error) {
                console.error('Failed to fetch food choice details:', error);
                ALERTS_MANAGER.addAlert('Failed to fetch food choice details.', 'error');
            }
        });
    }
}

function addModalCloseListener() {
    const closeBtn = document.getElementById('modal-close-btn');
    closeBtn.addEventListener('click', () => {
        document.querySelector('dialog').close();
    });
}

function setChoiceViewModalValues(choice)
{
    const formattedDate = new Date(choice.date).toDateString();
    document.getElementById('modal-date-input').value = formattedDate;
    document.getElementById('modal-food-input').value = choice.foodItem;
    document.getElementById('modal-health-input').value = choice.healthScore;
}

function renderChart(rawData)
{
    // 3. Extract the dates (X-Axis labels)
    const dates = Object.keys(rawData); // ["2026-09-30", "2026-10-01"]

    // 4. Build the datasets array required by Chart.js
    const datasets = CHART_CATEGORIES.map(category => {
        return {
            label: category.name,
            backgroundColor: category.color,
            // Loop through each date and pull the count, default to 0 if it doesn't exist
            data: dates.map(date => rawData[date][category.name] || 0)
        };
    });

    // 5. Initialize and render the Chart.js instance
    const ctx = document.getElementById('healthChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true // Stacks the bars on the X-axis
                },
                y: {
                    stacked: true, // Stacks the bars on the Y-axis
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1 // Since these are distinct individual entry counts
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}
    
function groupChoices(choices) {
    const grouped = choices.reduce((result, choice) => {
        const day = choice.date;

        if (!result[day]) {
            result[day] = {};
        }

        if (!result[day][choice.healthScore]) {
            result[day][choice.healthScore] = 0;
        }

        result[day][choice.healthScore]++;

        return result;
    }, {});
    return grouped;
}