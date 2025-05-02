import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, FlatList } from 'react-native';
import {
  Card,
  Text,
  Button,
  Provider as PaperProvider,
  BottomNavigation,
} from 'react-native-paper';
import {
  collection,
  onSnapshot,
  addDoc,
  Timestamp,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useRouter } from 'expo-router';

interface Room {
  id: string;
  name: string;
  description: string;
}

interface Application {
  id: string;
  roomName: string;
  roomId: string;
  userEmail: string;
}

type Role = 'user' | 'moderator' | null;

export default function Dashboard() {
  const [role, setRole] = useState<Role>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [approvedRoomIds, setApprovedRoomIds] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const router = useRouter();

  const [routes, setRoutes] = useState([
    { key: 'yourRooms', title: 'Your Rooms', icon: 'account' },
    { key: 'availableRooms', title: 'Available Rooms', icon: 'plus-box' },
  ]);

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        const userRole = userData?.role || 'user';
        setRole(userRole);

        if (userRole === 'moderator') {
          setRoutes([
            { key: 'yourRooms', title: 'Your Rooms', icon: 'account' },
            { key: 'availableRooms', title: 'Available', icon: 'plus-box' },
            { key: 'moderator', title: 'Moderation', icon: 'shield-account' },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      }
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    const fetchRoomsAndApplications = async () => {
      try {
        const unsubscribe = onSnapshot(collection(db, 'rooms'), (snapshot) => {
          const fetchedRooms = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as { name: string; description: string }),
          }));
          setRooms(fetchedRooms);
        });

        if (role === 'moderator') {
          const appsSnapshot = await getDocs(
            query(collection(db, 'roomApplications'), where('status', '==', 'pending'))
          );

          const apps = appsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as any),
          }));
          setApplications(apps);
        } else if (role === 'user') {
          const user = auth.currentUser;
          if (!user) return;

          const appsSnapshot = await getDocs(
            query(
              collection(db, 'roomApplications'),
              where('userId', '==', user.uid),
              where('status', '==', 'approved')
            )
          );

          const approvedIds = appsSnapshot.docs.map((doc) => doc.data().roomId);
          setApprovedRoomIds(approvedIds);
        }

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Could not load data.');
      }
    };

    if (role) {
      fetchRoomsAndApplications();
    }
  }, [role]);

  const handleApply = async (roomId: string, roomName: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to apply.');
        return;
      }

      await addDoc(collection(db, 'roomApplications'), {
        roomId,
        roomName,
        userId: user.uid,
        userEmail: user.email,
        status: 'pending',
        timestamp: Timestamp.now(),
      });

      Alert.alert('Application Sent', `You have applied to join ${roomName}.`);
    } catch (error) {
      console.error('Apply error:', error);
      Alert.alert('Error', 'Failed to apply to room.');
    }
  };

  const handleDecision = async (applicationId: string, decision: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'roomApplications', applicationId), {
        status: decision,
      });

      Alert.alert('Success', `Application ${decision}`);
      setApplications((prev) => prev.filter((app) => app.id !== applicationId));
    } catch (error) {
      console.error('Moderation error:', error);
      Alert.alert('Error', 'Failed to update application.');
    }
  };

  const navigateToRoom = (roomId: string) => {
    router.push(`/room/${roomId}`);
  };

  const YourRoomsRoute = () => (
    <FlatList
      data={rooms.filter((room) => approvedRoomIds.includes(room.id))}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={styles.card} onPress={() => navigateToRoom(item.id)}>
          <Card.Title title={item.name} />
          <Card.Content>
            <Text>{item.description}</Text>
          </Card.Content>
        </Card>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>You don't have access to any rooms.</Text>}
    />
  );

  const AvailableRoomsRoute = () => (
    <FlatList
      data={rooms.filter((room) => !approvedRoomIds.includes(room.id))}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Card.Title title={item.name} />
          <Card.Content>
            <Text>{item.description}</Text>
          </Card.Content>
          <Card.Actions>
            <Button onPress={() => handleApply(item.id, item.name)}>Apply</Button>
          </Card.Actions>
        </Card>
      )}
      ListEmptyComponent={<Text style={styles.emptyText}>No rooms available to apply for.</Text>}
    />
  );

  const ModeratorRoute = () => (
    <>
      <Text style={styles.heading}>Pending Applications</Text>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Title title={item.roomName} subtitle={item.userEmail} />
            <Card.Actions>
              <Button onPress={() => handleDecision(item.id, 'approved')}>Approve</Button>
              <Button onPress={() => handleDecision(item.id, 'rejected')}>Reject</Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No pending applications</Text>}
      />
    </>
  );

  const renderScene = BottomNavigation.SceneMap({
    yourRooms: YourRoomsRoute,
    availableRooms: AvailableRoomsRoute,
    moderator: ModeratorRoute,
  });

  return (
    <PaperProvider>
      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
        barStyle={styles.bottomNav}
        shifting={false}
        labeled={true} // To ensure the text is always visible
      />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  card: { margin: 12 },
  heading: { fontSize: 20, fontWeight: 'bold', margin: 12 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#888' },
  bottomNav: {
    backgroundColor: 'white',
  },
  bottomNavLabel: {
    color: '#000000',
  },
});
