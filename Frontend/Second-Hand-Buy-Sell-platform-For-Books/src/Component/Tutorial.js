import React, { useEffect, useState } from "react";
import { fetchTutorials } from "../services/api";
import "./Tutorial.css"; // we'll add CSS here

export default function Tutorial() {
  const [tutorials, setTutorials] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTutorials()
      .then((data) => setTutorials(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading tutorials...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="tutorial-container">
      <h2>All Tutorials</h2>
      <div className="tutorial-grid">
        {tutorials.map((t) => (
          <div key={t.id} className="tutorial-card">
            {t.thumbnailUrl && <img src={t.thumbnailUrl} alt={t.title} />}
            <h3>{t.title}</h3>
            <p>{t.description}</p>
            <p><b>Rs. {t.price}</b></p>
            <button onClick={() => setSelected(t)}>Watch</button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="video-modal">
          <div className="video-modal-content">
            <h3>{selected.title}</h3>
            <video
              src={selected.videoUrl}
              controls
              autoPlay
              className="video-player"
            />
            <button className="close-btn" onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
