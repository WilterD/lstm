from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model
import os
import json

app = Flask(__name__)
CORS(app)

def create_sequences(data, sequence_length):
    xs = []
    for i in range(len(data) - sequence_length + 1):
        x = data[i:(i + sequence_length)]
        xs.append(x)
    return np.array(xs)

def load_model_and_scaler(city_name):
    model_path = os.path.join('models', f'{city_name}_model.h5')
    scaler_path = os.path.join('models', f'{city_name}_scaler.npy')
    
    model = load_model(model_path)
    scaler_data = np.load(scaler_path, allow_pickle=True).item()
    scaler = MinMaxScaler()
    scaler.scale_ = scaler_data['scale_']
    scaler.min_ = scaler_data['min_']
    scaler.data_min_ = scaler_data['data_min_']
    scaler.data_max_ = scaler_data['data_max_']
    scaler.data_range_ = scaler_data['data_range_']
    scaler.feature_range = scaler_data['feature_range']
    
    return model, scaler

@app.route('/api/cities', methods=['GET'])
def get_cities():
    cities = ['ayacucho', 'caicara', 'ciudad_bolivar', 'palua']
    return jsonify(cities)

@app.route('/api/data/<city_name>', methods=['GET'])
def get_city_data(city_name):
    df = pd.read_csv('data.csv')
    df['fecha'] = pd.to_datetime(df['fecha'], format='%Y/%m/%d')
    
    if city_name not in df.columns:
        return jsonify({'error': 'Ciudad no encontrada'}), 404
    
    data = df[['fecha', city_name]].copy()
    data['fecha'] = data['fecha'].dt.strftime('%Y-%m-%d')

    data = data.replace({np.nan: None})
    
    return jsonify(data.to_dict('records'))

@app.route('/api/predict/<city_name>', methods=['POST'])
def predict_water_level(city_name):
    try:
        data = request.json
        days_to_predict = data.get('days', 7)
        
        # Load data
        df = pd.read_csv('data.csv')
        df['fecha'] = pd.to_datetime(df['fecha'], format='%Y/%m/%d')
        df.set_index('fecha', inplace=True)
        
        if city_name not in df.columns:
            return jsonify({'error': 'Ciudad no encontrada'}), 404
        
        # Load model and scaler
        model, scaler = load_model_and_scaler(city_name)
        
        # Prepare data
        city_data = df[[city_name]].values
        scaled_data = scaler.transform(city_data)
        
        # Use the last 7 days for prediction
        sequence_length = 7
        last_sequence = scaled_data[-sequence_length:]
        
        predictions = []
        current_sequence = last_sequence.copy()
        
        for _ in range(days_to_predict):
            # Reshape for prediction
            input_data = current_sequence.reshape(1, sequence_length, 1)
            
            # Make prediction
            prediction = model.predict(input_data, verbose=0)
            predictions.append(prediction[0, 0])
            
            # Update sequence for next prediction
            current_sequence = np.roll(current_sequence, -1)
            current_sequence[-1] = prediction[0, 0]
        
        # Inverse transform predictions
        predictions = np.array(predictions).reshape(-1, 1)
        predictions = scaler.inverse_transform(predictions)
        
        # Generate future dates
        last_date = df.index[-1]
        future_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=days_to_predict)
        
        result = {
            'city': city_name,
            'predictions': [
                {
                    'fecha': date.strftime('%Y-%m-%d'),
                    'predicted_level': float(pred[0])
                }
                for date, pred in zip(future_dates, predictions)
            ]
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/compare/<city_name>', methods=['POST'])
def compare_predictions(city_name):
    try:
        data = request.json
        test_days = data.get('test_days', 7)
        
        # Load data
        df = pd.read_csv('data.csv')
        df['fecha'] = pd.to_datetime(df['fecha'], format='%Y/%m/%d')
        df.set_index('fecha', inplace=True)
        
        if city_name not in df.columns:
            return jsonify({'error': 'Ciudad no encontrada'}), 404
        
        # Load model and scaler
        model, scaler = load_model_and_scaler(city_name)
        
        # Prepare data
        city_data = df[[city_name]].values
        scaled_data = scaler.transform(city_data)
        
        # Use data excluding the last test_days for training context
        train_data = scaled_data[:-test_days]
        test_data = scaled_data[-test_days:]
        
        sequence_length = 7
        
        # Make predictions for the test period
        predictions = []
        current_sequence = train_data[-sequence_length:]
        
        for i in range(test_days):
            # Reshape for prediction
            input_data = current_sequence.reshape(1, sequence_length, 1)
            
            # Make prediction
            prediction = model.predict(input_data, verbose=0)
            predictions.append(prediction[0, 0])
            
            # Update sequence with actual value for next prediction
            if i < test_days - 1:
                current_sequence = np.roll(current_sequence, -1)
                current_sequence[-1] = test_data[i]
        
        # Inverse transform predictions and actual values
        predictions = np.array(predictions).reshape(-1, 1)
        predictions = scaler.inverse_transform(predictions)
        test_actual = scaler.inverse_transform(test_data)
        
        # Get corresponding dates
        test_dates = df.index[-test_days:]
        
        result = {
            'city': city_name,
            'comparison': [
                {
                    'fecha': date.strftime('%Y-%m-%d'),
                    'actual': float(actual[0]),
                    'predicted': float(pred[0])
                }
                for date, actual, pred in zip(test_dates, test_actual, predictions)
            ]
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

