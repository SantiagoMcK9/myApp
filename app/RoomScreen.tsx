import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Room {
  name: string;
  description: string;
}

export default function RoomScreen() {
  // const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const roomId = 'sampleRoomId'; // hardcoded roomId for testing


  useEffect(() => {
    const fetchRoom = async () => {
      if (!roomId) return;

      try {
        const roomRef = doc(db, 'rooms', roomId);
        const roomSnap = await getDoc(roomRef);

        if (roomSnap.exists()) {
          setRoom(roomSnap.data() as Room);
        } else {
          Alert.alert('Not Found', 'Room does not exist.');
        }
      } catch (error) {
        console.error('Failed to fetch room:', error);
        Alert.alert('Error', 'Could not load room data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!room) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Room not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{room.name}</Text>
      <Text style={styles.description}>{room.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, lineHeight: 22 },
  notFound: { fontSize: 18, color: 'gray' },
});
