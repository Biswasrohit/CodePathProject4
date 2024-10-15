import React, { useState, useEffect } from "react";
import "./RandomItem.css";

const RandomItem = () => {
  const [item, setItem] = useState(null);
  const [banList, setBanList] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiKey = import.meta.env.VITE_API_KEY; // Access the API key from .env

  const fetchRandomItem = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://api.thedogapi.com/v1/images/search",
        {
          headers: {
            "x-api-key": apiKey, // Add the API key in the headers
          },
        }
      );
      const data = await response.json();
      // Check if the item is in the ban list
      if (!banList.includes(data[0].breeds[0]?.name)) {
        setItem(data[0]);
      } else {
        fetchRandomItem(); // Fetch another item if banned
      }
    } catch (error) {
      console.error("Error fetching the API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomItem(); // Fetch on component mount
  }, [banList]); // Re-fetch if the ban list changes

  const handleBan = (attribute) => {
    setBanList([...banList, attribute]);
  };

  return (
    <div className="random-item">
      {loading ? (
        <p>Loading...</p>
      ) : item ? (
        <div>
          <h2>{item.breeds[0]?.name}</h2>
          <img src={item.url} alt="Random Dog" style={{ width: "300px" }} />
          <p>Origin: {item.breeds[0]?.origin || "Unknown"}</p>
          <p>Life Span: {item.breeds[0]?.life_span}</p>
          <button onClick={() => handleBan(item.breeds[0]?.name)}>
            Ban this breed
          </button>
        </div>
      ) : (
        <p>No items to show</p>
      )}
      <div className="ban-list">
        <h3>Ban List:</h3>
        <ul>
          {banList.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <button onClick={fetchRandomItem}>Discover Another!</button>
    </div>
  );
};

export default RandomItem;
