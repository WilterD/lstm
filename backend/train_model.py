import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import os
import traceback
from tqdm import tqdm

def create_sequences(data, sequence_length):
    xs, ys = [], []
    for i in range(len(data) - sequence_length):
        x = data[i:(i + sequence_length)]
        y = data[i + sequence_length]
        xs.append(x)
        ys.append(y)
    return np.array(xs), np.array(ys)

def train_model(city_name):
    try:
        print(f"\n{'='*50}")
        print(f"Iniciando entrenamiento para: {city_name}")
        print(f"{'='*50}")

        # Cargar y preparar datos
        print(f"[{city_name}] Cargando dataset...")
        df = pd.read_csv('data.csv')
        df['fecha'] = pd.to_datetime(df['fecha'], format='%Y/%m/%d')
        df.set_index('fecha', inplace=True)

        if city_name not in df.columns:
            raise ValueError(f"Columna '{city_name}' no encontrada en el dataset")

        # Preprocesamiento
        print(f"[{city_name}] Normalizando datos...")
        data = df[[city_name]].values
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(data)

        # Crear secuencias
        sequence_length = 7
        print(f"[{city_name}] Creando secuencias (longitud: {sequence_length})...")
        X, y = create_sequences(scaled_data, sequence_length)

        # Construir modelo
        print(f"[{city_name}] Construyendo modelo LSTM...")
        model = Sequential()
        model.add(LSTM(units=50, return_sequences=True, input_shape=(X.shape[1], 1)))
        model.add(LSTM(units=50))
        model.add(Dense(units=1))
        model.compile(optimizer='adam', loss='mean_squared_error')

        # Entrenamiento con barra de progreso
        epochs = 100
        print(f"[{city_name}] Entrenando modelo ({epochs} epochs)...")
        
        # Usamos tqdm para mostrar una barra de progreso
        for epoch in tqdm(range(epochs), desc="Progreso", unit="epoch"):
            model.fit(X, y, epochs=1, batch_size=32, verbose=0)
        
        print(f"[{city_name}] ¡Entrenamiento completado!")

        # Guardar resultados
        os.makedirs('models', exist_ok=True)
        model_save_path = os.path.join('models', f'{city_name}_model.h5')
        scaler_save_path = os.path.join('models', f'{city_name}_scaler.npy')

        model.save(model_save_path)

        # Guardar parámetros del scaler
        scaler_params = {
            'scale_': scaler.scale_,
            'min_': scaler.min_,
            'data_min_': scaler.data_min_,
            'data_max_': scaler.data_max_,
            'data_range_': scaler.data_range_,
            'feature_range': scaler.feature_range
        }
        np.save(scaler_save_path, scaler_params)

        print(f"[{city_name}] Modelo guardado en: {model_save_path}")
        print(f"[{city_name}] Scaler guardado en: {scaler_save_path}")
        print(f"[{city_name}] Proceso completado con éxito!\n")

        return True

    except Exception as e:
        print(f"\n[ERROR] {city_name}: {str(e)}")
        print("Detalle del error:")
        traceback.print_exc()
        print(f"{'='*50}\n")
        return False

if __name__ == '__main__':
    cities = ['ayacucho', 'caicara', 'ciudad_bolivar', 'palua']
    success_count = 0

    print("\n" + "="*50)
    print("INICIANDO PROCESO DE ENTRENAMIENTO")
    print(f"Ciudades a procesar: {len(cities)}")
    print("="*50)

    for city in cities:
        if train_model(city):
            success_count += 1

    print("\n" + "="*50)
    print("RESUMEN FINAL")
    print("="*50)
    print(f"Ciudades procesadas: {len(cities)}")
    print(f"Modelos exitosos: {success_count}")
    print(f"Errores: {len(cities) - success_count}")

    if success_count == len(cities):
        print("¡TODOS LOS MODELOS FUERON ENTRENADOS EXITOSAMENTE!")
    else:
        print(f"Hubo errores en {len(cities) - success_count} ciudades")

    print("="*50 + "\n")