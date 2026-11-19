const API_URL = "http://127.0.0.1:8000/diabetes_prediction";

const form = document.getElementById("predictionForm");
const resultBox = document.getElementById("resultBox");
const resultIcon = document.getElementById("resultIcon");
const resultModel = document.getElementById("resultModel");
const resultText = document.getElementById("resultText");
const submitBtn = document.getElementById("submitBtn");
const fillSampleBtn = document.getElementById("fillSampleBtn");

fillSampleBtn.addEventListener("click", () => {
    document.getElementById("Pregnancies").value = 6;
    document.getElementById("Glucose").value = 148;
    document.getElementById("BloodPressure").value = 72;
    document.getElementById("SkinThickness").value = 35;
    document.getElementById("Insulin").value = 0;
    document.getElementById("BMI").value = 33.6;
    document.getElementById("DiabetesPedigreeFunction").value = 0.627;
    document.getElementById("Age").value = 50;
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const selectedModel = document.querySelector('input[name="model_type"]:checked').value;

    const payload = {
        model_type: selectedModel,
        Pregnancies: parseInt(document.getElementById("Pregnancies").value, 10),
        Glucose: parseInt(document.getElementById("Glucose").value, 10),
        BloodPressure: parseInt(document.getElementById("BloodPressure").value, 10),
        SkinThickness: parseInt(document.getElementById("SkinThickness").value, 10),
        Insulin: parseInt(document.getElementById("Insulin").value, 10),
        BMI: parseFloat(document.getElementById("BMI").value),
        DiabetesPedigreeFunction: parseFloat(document.getElementById("DiabetesPedigreeFunction").value),
        Age: parseInt(document.getElementById("Age").value, 10)
    };

    submitBtn.disabled = true;
    submitBtn.textContent = "Analyzing Biomarkers...";
    resultBox.className = "result-box hidden";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        resultModel.textContent = `Model: ${data.model_used}`;
        resultText.textContent = data.prediction;
        resultBox.classList.remove("hidden");

        if (data.is_diabetic) {
            resultIcon.textContent = "!";
            resultBox.classList.add("result-positive");
        } else {
            resultIcon.textContent = "✓";
            resultBox.classList.add("result-negative");
        }
    } catch (error) {
        resultModel.textContent = "Connection Error";
        resultText.textContent = "Could not reach FastAPI server on http://127.0.0.1:8000";
        resultIcon.textContent = "✕";
        resultBox.classList.remove("hidden");
        resultBox.classList.add("result-error");
        console.error(error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Run Prediction";
    }
});