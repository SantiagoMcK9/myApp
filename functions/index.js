// Import Firebase Admin SDK
const admin = require('firebase-admin');
admin.initializeApp();

const functions = require('firebase-functions');

exports.assignModeratorRole = functions.https.onCall(async (data, context) => {
  // Ensure the request is coming from an admin
  if (context.auth && context.auth.token.role === 'admin') {
    const { userId } = data;
    try {
      // Set the role to 'moderator'
      const userRef = admin.firestore().doc("users/${userId}");
      await userRef.set({ role: ['moderator'] }, { merge: true });

      return { message: 'User assigned as moderator' };
    } catch (error) {
      console.error('Error assigning role:', error);
      throw new functions.https.HttpsError('internal', 'Error assigning role');
    }
  } else {
    throw new functions.https.HttpsError('permission-denied', 'You must be an admin');
  }
});
