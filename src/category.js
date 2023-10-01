import React, { useState, useEffect } from "react";
import axios from "axios";
import Chart from "react-chartjs-2";

const CategorySpendTrendChart = ({ category, startDate, endDate }) => {
  const [spendData, setSpendData] = useState([]);

  useEffect(() => {
    const fetchSpendData = async () => {
      const response = await axios.get("/spend-trend", {
        params: {
          category,
          startDate,
          endDate,
        },
      });

      setSpendData(response.data);
    };

    fetchSpendData();
  }, [category, startDate, endDate]);

  const chartData = {
    labels: spendData.map((month) => month.name),
    datasets: [
      {
        label: "Spend",
        data: spendData.map((month) => month.spend),
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
      },
    ],
  };

  return (
    <div>
      <Chart type="bar" data={chartData} />
    </div>
  );
};

export default CategorySpendTrendChart;
