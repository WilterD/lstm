import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import os

def create_sequences(data, sequence_length):
    xs, ys = [], []
    for i in range(len(data) - sequence_length):
        x = data[i:(i + sequence_length)]
        y = data[i + sequence_length]
        xs.append(x)
        ys.append(y)
    return np.array(xs), np.array(ys)

def train_model(city_name):
    df = pd.read_csv('data.csv')
    df['fecha'] = pd.to_datetime(df['fecha'], format='%Y/%m/%d')
    df.set_index('fecha', inplace=True)

    data = df[[city_name]].values
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(data)

    sequence_length = 7  # Predict 1 week (7 days) based on previous 7 days
    X, y = create_sequences(scaled_data, sequence_length)

    model = Sequential()
    model.add(LSTM(units=50, return_sequences=True, input_shape=(X.shape[1], 1)))
    model.add(LSTM(units=50))
    model.add(Dense(units=1))
    model.compile(optimizer='adam', loss='mean_squared_error')

    model.fit(X, y, epochs=100, batch_size=32, verbose=0)

    model_save_path = os.path.join('models', f'{city_name}_model.h5')
    scaler_save_path = os.path.join('models', f'{city_name}_scaler.npy')

    os.makedirs('models', exist_ok=True)
    model.save(model_save_path)
    
    # Save scaler parameters as dictionary
    scaler_params = {
        'scale_': scaler.scale_,
        'min_': scaler.min_,
        'data_min_': scaler.data_min_,
        'data_max_': scaler.data_max_,
        'data_range_': scaler.data_range_,
        'feature_range': scaler.feature_range
    }
    np.save(scaler_save_path, scaler_params)
    print(f"Modelo y scaler para {city_name} guardados en {model_save_path} y {scaler_save_path}")

if __name__ == '__main__':
    cities = ['ayacucho', 'caicara', 'ciudad_bolivar', 'palua']
    for city in cities:
        train_model(city)


