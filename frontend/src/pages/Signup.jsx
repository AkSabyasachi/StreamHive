import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    avatar: null,       // required
    coverImage: null,   // optional
  });

  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 💡 Validate required fields (frontend level)
    if (!form.fullname || !form.username || !form.email || !form.password || !form.avatar) {
      setError("Please fill all required fields and upload avatar");
      return;
    }

    const formData = new FormData();
    formData.append("fullname", form.fullname);
    formData.append("username", form.username);
    formData.append("email", form.email);
    formData.append("password", form.password);
    formData.append("avatar", form.avatar); // ✅ required

    if (form.coverImage) {
      formData.append("coverimage", form.coverImage); // ✅ optional
    }

    const result = await signup(formData);

    if (result.success) {
      navigate("/"); // redirect to homepage or dashboard
    } else {
      setError(result.message || "Signup failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 shadow-md rounded-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="fullname"
          placeholder="Full Name"
          value={form.fullname}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
          required
        />

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
          required
        />

        <div>
          <label className="block mb-1">Avatar (required)</label>
          <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Cover Image (optional)</label>
          <input
            type="file"
            name="coverImage"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;
