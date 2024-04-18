import React, { useState } from "react";
import ZyskiWykres from "./chartDochodRok";
import BarChart from "./chart";

const Dashboard = () => {
  const [selectedMonthData, setSelectedMonthData] = useState(null);

  const handleMonthChange = (monthData) => {
    console.log("Selected month data in Dashboard:", monthData);
    setSelectedMonthData(monthData);
  };


  return (
    <div>
      <ZyskiWykres changeMonthData={setSelectedMonthData}/>
      {selectedMonthData ? (
        <BarChart monthData={selectedMonthData} />
      ) : (
        <p>No data selected.</p>
      )}
    </div>
  );
};

export default Dashboard;
