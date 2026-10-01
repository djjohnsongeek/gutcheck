const ALERTS_MANAGER = new Alerts("alerts-container");
const CHART_CATEGORIES = [
    { name: "Unhealthy", color: "#D93526" },
    { name: "Mostly Unhealthy", color: "#FF9500" },
    { name: "Borderline", color: "#F2DF0D" },
    { name: "Mostly Healthy", color: "#A5D601" },
    { name: "Healthy", color: "#398712" }
];
document.addEventListener("DOMContentLoaded", async () => {
    loadSummary();
});

async function loadSummary() {
    console.log('Loading summary...');
    try {
        const foodChoicesRepo = new FoodChoicesRepo();
        const choices = await foodChoicesRepo.getAllFoodChoices();
        const groupedChoices = groupChoices(choices);

        console.log(choices);

        renderChart(groupedChoices);
        renderTable(choices);
        addDeleteButtonListeners();
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
        summaryTbody.innerHTML = '<tr><td colspan="5">No food choices found.</td></tr>';
        return;
    }

    for (let choice of choices) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${choice.id}</td>
            <td>${choice.date}</td>
            <td>${choice.foodItem}</td>
            <td>${choice.healthScore}</td>
            <td>
                <button class="delete-button" data-id="${choice.id}">&#10060;</button>
            </td>
        `;
        summaryTbody.appendChild(row);
    }
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