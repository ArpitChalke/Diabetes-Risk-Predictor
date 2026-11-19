from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class model_input(BaseModel):
    model_type: str = "svm"  # "svm", "rf", or "lr"
    Pregnancies: int
    Glucose: int
    BloodPressure: int
    SkinThickness: int
    Insulin: int
    BMI: float
    DiabetesPedigreeFunction: float
    Age: int

# Load all 3 models
models = {
    "svm": pickle.load(open("diabetes_model.sav", "rb")),
    "rf": pickle.load(open("rf_model.sav", "rb")),
    "lr": pickle.load(open("lr_model.sav", "rb")),
}

model_names = {
    "svm": "Support Vector Machine (SVM)",
    "rf": "Random Forest Classifier",
    "lr": "Logistic Regression",
}

@app.post("/diabetes_prediction")
def diabetes_pred(input_parameters: model_input):
    input_data = input_parameters.json()
    input_dictionary = json.loads(input_data)

    selected = input_dictionary.get("model_type", "svm").lower()
    if selected not in models:
        raise HTTPException(status_code=400, detail="Invalid model selected")

    preg = input_dictionary["Pregnancies"]
    glu = input_dictionary["Glucose"]
    bp = input_dictionary["BloodPressure"]
    skin = input_dictionary["SkinThickness"]
    insulin = input_dictionary["Insulin"]
    bmi = input_dictionary["BMI"]
    dpf = input_dictionary["DiabetesPedigreeFunction"]
    age = input_dictionary["Age"]

    input_list = [preg, glu, bp, skin, insulin, bmi, dpf, age]

    prediction = models[selected].predict([input_list])
    result_text = (
        "The person is not Diabetic"
        if prediction[0] == 0
        else "The person is Diabetic"
    )

    return {
        "prediction": result_text,
        "is_diabetic": bool(prediction[0] == 1),
        "model_used": model_names[selected],
    }