import React, { useState } from "react";
import { uploadTutorial } from "../../services/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function TutorialAdd() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!video) {
    toast.error("Video is required");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user?.userId || user.userType.toLowerCase() !== "organization") {
    toast.error("Please login as organization first");
    navigate("/login");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
  formData.append("price", Number(price)); // ensure numeric
  formData.append("video", video);
  if (thumbnail) formData.append("thumbnail", thumbnail);

  try {
    const res = await uploadTutorial(formData, user.token);
    toast.success("Tutorial uploaded successfully");

    setTitle("");
    setDescription("");
    setPrice("");
    setVideo(null);
    setThumbnail(null);
  } catch (err) {
    console.error("Upload error:", err);
    toast.error(err.message || "Upload failed");
  }
};

  return (
    <div className="container">
      <h2>Add Tutorial</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files[0])}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setThumbnail(e.target.files[0])}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Upload Tutorial"}
        </button>
      </form>
    </div>
  );
}
