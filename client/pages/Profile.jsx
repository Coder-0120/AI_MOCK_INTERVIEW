import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(res.data.user); // ✅ FIXED
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  return (
    <>
      <h1>Profile Page</h1>

      {token ? (
        user ? (
          <div>
            <h2>Name: {user.name}</h2>
            <h2>Email: {user.email}</h2>
          </div>
        ) : (
          <p>Loading...</p>
        )
      ) : (
        <p>Please log in to view your profile.</p>
      )}
    </>
  );
};

export default Profile;