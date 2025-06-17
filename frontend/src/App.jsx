import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart3, Droplets, Calendar, TrendingUp } from 'lucide-react';

const App = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [daysToPredict, setDaysToPredict] = useState(7);
  const [activeTab, setActiveTab] = useState('predict');

  const API_BASE = 'http://localhost:5000/api';

  // Cargar ciudades al montar el componente
  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_BASE}/cities`);
      if (!response.ok) throw new Error('Error al cargar ciudades');
      const data = await response.json();
      setCities(data);
      if (data.length > 0) {
        setSelectedCity(data[0]);
      }
    } catch (err) {
      setError('Error al conectar con el servidor: ' + err.message);
    }
  };

  const fetchHistoricalData = async (cityName, days) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/data/${cityName}`);
      if (!response.ok) throw new Error('Error al cargar datos históricos');
      const data = await response.json();
      
      // Formatear datos para el gráfico - solo los últimos días especificados
      const formattedData = data
        .filter(item => item[cityName] !== null)
        .slice(-days) // Solo los últimos días solicitados
        .map(item => ({
          fecha: item.fecha,
          nivel: item[cityName],
          type: 'histórico'
        }));
      
      setHistoricalData(formattedData);
    } catch (err) {
      setError('Error al cargar datos históricos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const makePrediction = async () => {
    if (!selectedCity) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE}/predict/${selectedCity}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days: daysToPredict }),
      });
      
      if (!response.ok) throw new Error('Error al hacer predicción');
      const data = await response.json();
      
      // Solo tomar exactamente los días solicitados
      const formattedPredictions = data.predictions
        .slice(0, daysToPredict)
        .map(pred => ({
          fecha: pred.fecha,
          nivel: pred.predicted_level,
          type: 'predicción'
        }));
      
      setPredictions(formattedPredictions);
      
      // Cargar datos históricos con la misma cantidad de días para contexto
      await fetchHistoricalData(selectedCity, daysToPredict);
      
    } catch (err) {
      setError('Error al hacer predicción: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const compareModels = async () => {
    if (!selectedCity) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE}/compare/${selectedCity}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test_days: daysToPredict }),
      });
      
      if (!response.ok) throw new Error('Error al comparar modelos');
      const data = await response.json();
      
      // Solo tomar exactamente los días solicitados
      const formattedComparison = data.comparison
        .slice(0, daysToPredict)
        .map(comp => ({
          fecha: comp.fecha,
          actual: comp.actual,
          predicho: comp.predicted
        }));
      
      setComparison(formattedComparison);
      
    } catch (err) {
      setError('Error al comparar modelos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cityNames = {
    ayacucho: 'Ayacucho',
    caicara: 'Caicara',
    ciudad_bolivar: 'Ciudad Bolívar',
    palua: 'Palúa'
  };

  // Para el gráfico de predicciones, combinar históricos + predicciones
  const combinedData = [...historicalData, ...predictions];

  // Calcular el rango dinámico para el eje Y del gráfico de comparación
  const getComparisonYDomain = () => {
    if (!comparison || comparison.length === 0) return [0, 1];
    const allValues = comparison.flatMap(d => [d.actual, d.predicho]);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    // Margen para que no quede pegado al borde
    const margin = (max - min) * 0.1 || 1;
    return [min - margin, max + margin];
  };

  // Calcular el rango dinámico para el eje Y del gráfico de predicción
  const getPredictionYDomain = () => {
    if (!combinedData || combinedData.length === 0) return [0, 1];
    const allValues = combinedData.map(d => d.nivel).filter(v => v !== undefined && v !== null);
    if (allValues.length === 0) return [0, 1];
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const margin = (max - min) * 0.1 || 1;
    return [min - margin, max + margin];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Droplets className="h-10 w-10 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">
              Predicción de Niveles de Agua
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Sistema de predicción para ciudades de Venezuela
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Ciudad
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cities.map(city => (
                  <option key={city} value={city}>
                    {cityNames[city] || city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Días a Predecir
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={daysToPredict}
                onChange={(e) => setDaysToPredict(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={makePrediction}
                disabled={loading || !selectedCity}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Hacer Predicción
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveTab('predict')}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'predict'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2 inline" />
              Predicciones
            </button>
            <button
              onClick={() => {
                setActiveTab('compare');
                compareModels();
              }}
              className={`px-4 py-2 rounded-md ${
                activeTab === 'compare'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2 inline" />
              Comparación
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'predict' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Predicciones para {daysToPredict} días - {cityNames[selectedCity] || selectedCity}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Datos históricos ({historicalData.length} días) + Predicciones ({predictions.length} días)
              </p>
              {combinedData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={combinedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="fecha" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis 
                      domain={getPredictionYDomain()}
                      tickFormatter={(value) => value?.toFixed(2)}
                    />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value, name) => [value?.toFixed(2), name === 'nivel' ? 'Nivel de Agua' : name]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="nivel"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      name="Nivel de Agua"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Selecciona una ciudad y haz clic en "Hacer Predicción" para ver los datos
                </div>
              )}
            </div>
          )}

          {activeTab === 'compare' && (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Comparación para {daysToPredict} días - {cityNames[selectedCity] || selectedCity}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Comparando {comparison.length} días de predicciones vs valores reales
              </p>
              {comparison.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={comparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="fecha" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis 
                      domain={getComparisonYDomain()}
                      tickFormatter={(value) => value?.toFixed(2)}
                    />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value, name) => {
                        if (name === 'Valor Real') return [value?.toFixed(2), 'Valor Real'];
                        if (name === 'Predicción') return [value?.toFixed(2), 'Predicción'];
                        return [value?.toFixed(2), name];
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      name="Valor Real"
                    />
                    <Line
                      type="monotone"
                      dataKey="predicho"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                      name="Predicción"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {loading ? 'Cargando comparación...' : 'Los datos de comparación aparecerán aquí'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        {((predictions.length > 0 && activeTab === 'predict') || (comparison.length > 0 && activeTab === 'compare')) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeTab === 'predict' && (
              <>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h4 className="text-lg font-semibold text-gray-700">Predicciones</h4>
                  <p className="text-3xl font-bold text-blue-600">{predictions.length}</p>
                  <p className="text-sm text-gray-500">días predichos</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h4 className="text-lg font-semibold text-gray-700">Nivel Promedio</h4>
                  <p className="text-3xl font-bold text-green-600">
                    {predictions.length > 0 ? (predictions.reduce((acc, p) => acc + p.nivel, 0) / predictions.length).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-sm text-gray-500">nivel predicho</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h4 className="text-lg font-semibold text-gray-700">Ciudad</h4>
                  <p className="text-2xl font-bold text-purple-600">{cityNames[selectedCity]}</p>
                  <p className="text-sm text-gray-500">seleccionada</p>
                </div>
              </>
            )}
            {activeTab === 'compare' && (
              <>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h4 className="text-lg font-semibold text-gray-700">Comparación</h4>
                  <p className="text-3xl font-bold text-orange-600">{comparison.length}</p>
                  <p className="text-sm text-gray-500">días comparados</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h4 className="text-lg font-semibold text-gray-700">Precisión Promedio</h4>
                  <p className="text-3xl font-bold text-green-600">
                    {comparison.length > 0 ? 
                      (100 - (comparison.reduce((acc, comp) => 
                        acc + Math.abs((comp.actual - comp.predicho) / comp.actual * 100), 0
                      ) / comparison.length)).toFixed(1) : 0}%
                  </p>
                  <p className="text-sm text-gray-500">precisión del modelo</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h4 className="text-lg font-semibold text-gray-700">Ciudad</h4>
                  <p className="text-2xl font-bold text-purple-600">{cityNames[selectedCity]}</p>
                  <p className="text-sm text-gray-500">analizada</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

