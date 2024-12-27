import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import './Bargraph.css'; // Import CSS file for styling
import AllProductsGraph from './AllProductsGraph';

const BarGraph = () => {
  const [data, setData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedProductData, setSelectedProductData] = useState(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [showGraph, setShowGraph] = useState(false);
  const [productCounts, setProductCounts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:8800/pictorialstockdata');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    fetch('http://localhost:8800/product_count')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setProductCounts(data))
      .catch(error => console.error('Error fetching product count:', error));
  }, []);

  const handleSubmit = () => {
    const product = data.find(item => item.title === selectedProduct);
    if (product) {
      const selectedProductCount = productCounts.find(pc => pc.product_id === product.id);
      const totalOrders = selectedProductCount ? parseInt(selectedProductCount.total_quantity) : 0;

      // Recalculate available
      const updatedProductData = {
        ...product,
        available: product.quantity - totalOrders, // Update available value
      };

      setSelectedProductData(updatedProductData);
      generateChart(updatedProductData, productCounts);
    } else {
      console.log('Product not found');
    }
  };

  const handleAllProductsGraph = () => {
    if (showGraph) {
      setShowGraph(false);
    } else {
      setSelectedProductData(null); // Clear selected product data
      setShowGraph(true);
    }
  };

  const generateChart = (productData, productCounts) => {
    const ctx = document.getElementById('myChart');

    if (chartInstance) {
      chartInstance.destroy();
    }

    if (ctx) {
      const ordersValue = productData.quantity - productData.available;
      const profit = (productData.product_cost - productData.actual_cost) * ordersValue;

      const newChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Quantity (Nos)', 'Available (Nos)', 'Cost Price (₹)', 'Selling Price (₹)', 'Total Orders', 'Profit(₹)'],
          datasets: [
            {
              label: 'Product Data',
              data: [productData.quantity, productData.available, productData.actual_cost, productData.product_cost, ordersValue, profit],
              backgroundColor: ['#ADD8E6', '#FFB6C1', '#87CEEB', '#FFA07A', '#FFD700', '#90EE90'],
              borderColor: ['#4CAF50', '#FFC107', '#1E90FF', '#FF6347', '#FFD700', '#32CD32'],
              borderWidth: 1,
              barPercentage: 0.3,
              categoryPercentage: 0.7,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                color: '#555',
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
            },
            x: {
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
              ticks: {
                color: '#555',
                font: {
                  size: 14,
                  weight: 'bold',
                },
              },
            },
          },
          plugins: {
            legend: {
              labels: {
                color: '#333',
                font: {
                  size: 16,
                  weight: 'bold',
                },
              },
            },
          },
        },
      });

      setChartInstance(newChartInstance);
    }
  };

  return (
    <div className="bar-graph-container">
      {showGraph ? (
        <div>
          <button
            style={{
              backgroundColor: '#65becf',
              marginLeft: '95%',
              width: '35%',
              fontWeight: 'bold',
              fontSize: '16px',
            }}
            onClick={handleAllProductsGraph}
          >
            Explore Products Individually
          </button>
          <AllProductsGraph />
        </div>
      ) : (
        <div>
          <button
            style={{
              backgroundColor: '#65becf',
              width: '20%',
              fontSize: '16px',
              marginLeft: '98%',
              fontWeight: 'bold',
            }}
            onClick={handleAllProductsGraph}
          >
            View AllData
          </button>
          <h2 className="graph-title" style={{ textAlign: 'center' }}>
            Product Quantity and Availability
          </h2>
          <div
            className="input-container"
            style={{
              marginLeft: '20%',
              boxShadow: '10px 10px 10px 10px grey',
              padding: '10px',
              width: '60%',
            }}
          >
            <select
              className="select-product"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              style={{ marginLeft: '10%', width: '50%' }}
            >
              <option value="">Select a product</option>
              {data.map((item) => (
                <option key={item.title} value={item.title}>
                  {item.title}
                </option>
              ))}
            </select>
            <button className="submit-btn" onClick={handleSubmit} style={{ backgroundColor: '#65becf' }}>
              Submit
            </button>
          </div>
          {selectedProductData && (
            <div>
              <div
                className="chart-container"
                style={{ boxShadow: '10px 10px 10px 10px grey', padding: '20px' }}
              >
                <canvas id="myChart"></canvas>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BarGraph;
