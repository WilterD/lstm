import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Activity, TrendingUp, BarChart3 } from 'lucide-react'
import './App.css'

const API_BASE_URL = 'http://localhost:5000/api'

function App() {
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [historicalData, setHistoricalData] = useState([])
  const [predictions, setPredictions] = useState([])
  const [comparison, setComparison] = useState([])
  const [daysToPredict, setDaysToPredict] = useState(7)
  const [testDays, setTestDays] = useState(7)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cities`)
      const data = await response.json()
      setCities(data)
      if (data.length > 0) {
        setSelectedCity(data[0])
      }
    } catch (error) {
      console.error('Error fetching cities:', error)
    }
  }

  const fetchHistoricalData = async (city) => {
    try {
      const response = await fetch(`${API_BASE_URL}/data/${city}`)
      const data = await response.json()
      setHistoricalData(data)
    } catch (error) {
      console.error('Error fetching historical data:', error)
    }
  }

  const makePrediction = async () => {
    if (!selectedCity) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/predict/${selectedCity}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ days: daysToPredict }),
      })
      const data = await response.json()
      setPredictions(data.predictions)
    } catch (error) {
      console.error('Error making prediction:', error)
    } finally {
      setLoading(false)
    }
  }

  const compareWithActual = async () => {
    if (!selectedCity) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/compare/${selectedCity}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ test_days: testDays }),
      })
      const data = await response.json()
      setComparison(data.comparison)
    } catch (error) {
      console.error('Error comparing predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedCity) {
      fetchHistoricalData(selectedCity)
    }
  }, [selectedCity])

  const formatCityName = (city) => {
    return city.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Activity className="h-8 w-8 text-blue-600" />
            Predicción de Niveles de Agua
          </h1>
          <p className="text-lg text-gray-600">Sistema de predicción usando LSTM para múltiples ciudades</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Configuración
              </CardTitle>
              <CardDescription>Selecciona la ciudad y parámetros de predicción</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="city-select">Ciudad</Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {formatCityName(city)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="days-predict">Días a predecir</Label>
                <Input
                  id="days-predict"
                  type="number"
                  value={daysToPredict}
                  onChange={(e) => setDaysToPredict(parseInt(e.target.value))}
                  min="1"
                  max="30"
                />
              </div>
              
              <Button 
                onClick={makePrediction} 
                disabled={loading || !selectedCity}
                className="w-full"
              >
                {loading ? 'Prediciendo...' : 'Hacer Predicción'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Comparación
              </CardTitle>
              <CardDescription>Compara predicciones con datos reales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="test-days">Días de prueba</Label>
                <Input
                  id="test-days"
                  type="number"
                  value={testDays}
                  onChange={(e) => setTestDays(parseInt(e.target.value))}
                  min="1"
                  max="14"
                />
              </div>
              
              <Button 
                onClick={compareWithActual} 
                disabled={loading || !selectedCity}
                className="w-full"
                variant="outline"
              >
                {loading ? 'Comparando...' : 'Comparar con Datos Reales'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
              <CardDescription>Datos de la ciudad seleccionada</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCity && (
                <div className="space-y-2">
                  <p><strong>Ciudad:</strong> {formatCityName(selectedCity)}</p>
                  <p><strong>Datos históricos:</strong> {historicalData.length} registros</p>
                  <p><strong>Modelo:</strong> LSTM (7 días de secuencia)</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {historicalData.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Datos Históricos - {formatCityName(selectedCity)}</CardTitle>
              <CardDescription>Niveles de agua registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={historicalData.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={selectedCity} 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    name="Nivel de Agua"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {predictions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Predicciones Futuras - {formatCityName(selectedCity)}</CardTitle>
              <CardDescription>Predicciones para los próximos {daysToPredict} días</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={predictions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="predicted_level" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicción"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {comparison.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Comparación: Predicción vs Realidad - {formatCityName(selectedCity)}</CardTitle>
              <CardDescription>Evaluación de la precisión del modelo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={comparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    name="Datos Reales"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicción"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default App

