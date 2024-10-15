import React, { useState, useEffect } from "react";
import "./RandomItem.css";

const RandomItem = () => {
  const [item, setItem] = useState(null);
  const [banList, setBanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [history, setHistory] = useState([]);

  const apiKey = import.meta.env.VITE_API_KEY;

  const buildApiUrl = () => {
    const params = new URLSearchParams({
      page: page,
      order: "RAND",
      has_breeds: 1,
      limit: 1,
    });

    return `https://api.thedogapi.com/v1/images/search?${params.toString()}`;
  };

  const fetchRandomItem = async () => {
    setLoading(true);
    try {
      const url = buildApiUrl();
      const response = await fetch(url, {
        headers: {
          "x-api-key": apiKey,
        },
      });
      const data = await response.json();

      const breedName = data[0].breeds[0]?.name;
      const lifeSpan = data[0].breeds[0]?.life_span;
      const temperament = data[0].breeds[0]?.temperament;

      const isBanned = banList.some(
        (banItem) =>
          (banItem.type === "breed" && banItem.value === breedName) ||
          (banItem.type === "life_span" && banItem.value === lifeSpan) ||
          (banItem.type === "temperament" && banItem.value === temperament)
      );

      if (!isBanned) {
        setItem(data[0]);

        // Update the history
        const newHistory = [...history, data[0]];
        setHistory(newHistory);
        sessionStorage.setItem("viewedItems", JSON.stringify(newHistory)); // Save history to session storage
      } else {
        fetchRandomItem(); // Fetch another item if it's banned
      }
    } catch (error) {
      console.error("Error fetching the API:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clear session storage on component mount (including on page refresh)
  useEffect(() => {
    sessionStorage.removeItem("viewedItems"); // Clear session storage on page load
    fetchRandomItem(); // Fetch the first item
  }, []); // Empty dependency array means this runs once on mount

  // Clear session history when you want to manually reset
  const clearHistory = () => {
    sessionStorage.removeItem("viewedItems");
    setHistory([]); // Clear history from state as well
  };

  useEffect(() => {
    fetchRandomItem();
  }, [page, banList]);

  const handleBan = (type, value) => {
    if (value) {
      setBanList([...banList, { type, value }]);
    }
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  return (
    <div className="random-item">
      {loading ? (
        <p>Loading...</p>
      ) : item ? (
        <div>
          <img src={item.url} alt="Random Dog" style={{ width: "300px" }} />
          <p>
            <strong>Breed:</strong> {item.breeds[0]?.name || "Unknown Breed"}
          </p>
          <p>
            <strong>Life Span:</strong> {item.breeds[0]?.life_span || "Unknown"}
          </p>
          <p>
            <strong>Temperament:</strong>{" "}
            {item.breeds[0]?.temperament || "Unknown"}
          </p>

          <button onClick={() => handleBan("breed", item.breeds[0]?.name)}>
            Ban this breed
          </button>
          <button
            onClick={() => handleBan("life_span", item.breeds[0]?.life_span)}
          >
            Ban this life span
          </button>
          <button
            onClick={() =>
              handleBan("temperament", item.breeds[0]?.temperament)
            }
          >
            Ban this temperament
          </button>
        </div>
      ) : (
        <p>No items to show</p>
      )}

      {/* Ban List */}
      <div className="ban-list">
        <h3>Ban List:</h3>
        <ul>
          {banList.map((banItem, index) => (
            <li key={index}>{`${banItem.type}: ${banItem.value}`}</li>
          ))}
        </ul>
      </div>

      {/* Button to discover more */}
      <button onClick={handleNextPage}>Discover Another!</button>

      {/* Clear History Button */}
      <button
        onClick={clearHistory}
        style={{ marginTop: "1rem", backgroundColor: "#f44336" }}
      >
        Clear History
      </button>

      {/* Display the history */}
      <div className="history">
        <h3>Previously Viewed Items:</h3>
        <ul>
          {history.map((pastItem, index) => (
            <li key={index}>
              <img
                src={pastItem.url}
                alt={`Dog ${index}`}
                style={{ width: "100px", marginRight: "10px" }}
              />
              {pastItem.breeds[0]?.name || "Unknown Breed"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RandomItem;
