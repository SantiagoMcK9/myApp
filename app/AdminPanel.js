import React from 'react';
import { Button, Alert } from 'react-native';
import { assignModeratorRole } from '../functions/adminFunctions.js'; // Correct path

const AdminPanel = () => {
  const handleAssignRole = async (userId: string) => {
    try {
      await assignModeratorRole(userId);
      Alert.alert('Success', 'User has been assigned the moderator role');
    } catch (error) {
      Alert.alert('Error', 'Failed to assign role');
    }
  };

  return (
    <Button title="Assign Moderator Role" onPress={() => handleAssignRole('USER_ID_HERE')} />
  );
};

export default AdminPanel;
