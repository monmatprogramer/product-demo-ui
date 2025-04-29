import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

function ProfileComponent() {
  const { user, updateProfile, error } = useContext(AuthContext);
  const [name, setName] = useState('');
  
  useEffect(() => {
    if (user) {
      setName(user.username);
    }
  }, [user]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateProfile({ username: name });
    if (success) {
      // Handle success
    }
  };
  
  return (
    <div>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
}