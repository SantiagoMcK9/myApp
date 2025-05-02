import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Text, Card, Provider as PaperProvider } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path as needed

interface Room {
  name: string;
  description: string;
  // Add other possible fields for specific rooms
  content_games?: string[];
  content_musics?: string[];
  content_graphicss?: string[];
}

export default function RoomDetails() {
  const { roomId } = useLocalSearchParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!roomId || typeof roomId !== 'string') return;

      try {
        const docRef = doc(db, 'rooms', roomId);
        const roomDoc = await getDoc(docRef);

        if (roomDoc.exists()) {
          setRoom(roomDoc.data() as Room);
        } else {
          console.warn('Room not found');
        }
      } catch (error) {
        console.error('Error fetching room:', error);
        Alert.alert('Error', 'Failed to load room data.');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  const renderRoomContent = () => {
    if (!roomId || !room) return null;

    switch (roomId) {
      case '6OXSguxRHAlLIpSQmzu8':  //game dev room
        return (
          <Card>
          <Card.Title title="Game Dev Room" />
          <Card.Content>
            {Array.isArray(room.content_games) ? (
              room.content_games.map((content_game, index) => (
                <Text key={index}>• {content_game}</Text>
              ))
            ) : (
              <Text>No content available.</Text>
            )}
          </Card.Content>
        </Card>

        );

      case 'PUNFmTg5MTaK2P2R463T':
        return (
          <Card>
            <Card.Title title="Music Production Room" />
            <Card.Content>
              {Array.isArray(room.content_musics) ? (
                room.content_musics.map((content_music, index) => (
                  <Text key={index}>📘 {content_music}</Text>

              ))
              ) : (
                <Text>No content available.</Text>
              )}
            </Card.Content>
          </Card>
        );

      case 'izFSP4l5ixbFtZLMkHpG':
        return (
          <Card>
            <Card.Title title="Graphics Design Room" />
            <Card.Content>
            {Array.isArray(room.content_graphicss) ? (
               room.content_graphicss.map((content_graphics, index) => (
                <Text key={index}>📘 {content_graphics}</Text>
              ))
            ) : (
              <Text>No content available.</Text>
            )}
            </Card.Content>
          </Card>
        );

      default:
        return (
          <Card>
            <Card.Title title={room.name} />
            <Card.Content>
              <Text>{room.description}</Text>
            </Card.Content>
          </Card>
        );
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" />
        ) : room ? (
          renderRoomContent()
        ) : (
          <Text>Room not found.</Text>
        )}
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
});
