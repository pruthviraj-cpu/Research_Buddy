import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    onAuthStateChanged
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    updateDoc
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase.js';

// Create user profile in Firestore
const createUserProfile = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        // New user - create profile
        const { displayName, email, photoURL } = user;
        const createdAt = new Date();

        try {
            await setDoc(userRef, {
                displayName: displayName || additionalData.name || 'User',
                email,
                photoURL: photoURL || null,
                role: additionalData.role || 'user',
                createdAt,
                lastLoginAt: createdAt,
                isActive: additionalData.isActive ?? true,  // ADD THIS LINE
                signInMethod: additionalData.signInMethod || 'email',
                ...additionalData
            });
        } catch (error) {
            console.error('Error creating user profile:', error);
            throw error;
        }
    } else {
        // Existing user - update login info and active status
        const updateData = {
            lastLoginAt: new Date(),
            signInMethod: additionalData.signInMethod || userSnap.data().signInMethod
        };

        // ADD THESE LINES ↓
        if (additionalData.hasOwnProperty('isActive')) {
            updateData.isActive = additionalData.isActive;
        }

        if (additionalData.lastLogoutAt) {
            updateData.lastLogoutAt = additionalData.lastLogoutAt;
        }

        await updateDoc(userRef, updateData);
    }

    return userRef;
};


// Get user profile from Firestore
const getUserProfile = async (uid) => {
    if (!uid) return null;

    try {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
};

// Check if user is admin by email (you can customize this logic)
const isAdminEmail = (email) => {
    const adminEmails = [
        'admin@research.com',
        'manager@research.com',
        // Add more admin emails as needed
    ];
    return adminEmails.includes(email.toLowerCase());
};

export const firebaseAuthService = {
    // Register new user (Email/Password)
    register: async (email, password, userData = {}) => {
        try {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);

            if (userData.name) {
                await updateProfile(user, {
                    displayName: userData.name
                });
            }

            await createUserProfile(user, {
                ...userData,
                signInMethod: 'email'
            });

            const userProfile = await getUserProfile(user.uid);

            return {
                id: user.uid,
                email: user.email,
                name: user.displayName || userData.name,
                emailVerified: user.emailVerified,
                ...userProfile
            };
        } catch (error) {
            console.error('Registration error:', error);

            const errorMessages = {
                'auth/email-already-in-use': 'This email is already registered',
                'auth/invalid-email': 'Invalid email address',
                'auth/operation-not-allowed': 'Email/password accounts are not enabled',
                'auth/weak-password': 'Password should be at least 6 characters'
            };

            throw new Error(errorMessages[error.code] || error.message);
        }
    },

    // Login user (Email/Password)
    login: async (email, password) => {
        try {
            const { user } = await signInWithEmailAndPassword(auth, email, password);

            const userProfile = await getUserProfile(user.uid);

            if (!userProfile) {
                throw new Error('User profile not found');
            }

            // Update sign-in method
            await createUserProfile(user, {
                signInMethod: 'email',
                isActive: true,
                lastLoginAt: new Date()
            });

            return {
                id: user.uid,
                email: user.email,
                name: user.displayName,
                emailVerified: user.emailVerified,
                ...userProfile
            };
        } catch (error) {
            console.error('Login error:', error);

            const errorMessages = {
                'auth/user-not-found': 'No user found with this email',
                'auth/wrong-password': 'Incorrect password',
                'auth/invalid-email': 'Invalid email address',
                'auth/user-disabled': 'This account has been disabled',
                'auth/too-many-requests': 'Too many failed attempts. Try again later',
                'auth/invalid-credential': 'Invalid email or password'
            };

            throw new Error(errorMessages[error.code] || error.message);
        }
    },

    // Google Sign-In
    signInWithGoogle: async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user is admin based on email
            const role = isAdminEmail(user.email) ? 'admin' : 'user';

            // Create or update user profile
            await createUserProfile(user, {
                name: user.displayName,
                role: role,
                signInMethod: 'google',
                isActive: true,
                lastLoginAt: new Date()
            });

            const userProfile = await getUserProfile(user.uid);

            return {
                id: user.uid,
                email: user.email,
                name: user.displayName,
                emailVerified: user.emailVerified,
                photoURL: user.photoURL,
                ...userProfile
            };
        } catch (error) {
            console.error('Google sign-in error:', error);

            const errorMessages = {
                'auth/popup-closed-by-user': 'Sign-in popup was closed',
                'auth/popup-blocked': 'Sign-in popup was blocked by browser',
                'auth/cancelled-popup-request': 'Sign-in request was cancelled',
                'auth/account-exists-with-different-credential': 'Account exists with different sign-in method'
            };

            throw new Error(errorMessages[error.code] || error.message);
        }
    },

    // Logout user
    logout: async () => {
        try {
            // Get current user before logout
            const user = auth.currentUser;

            // ADD THIS CODE HERE ↓
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    isActive: false,
                    lastLogoutAt: new Date()
                });
            }

            // Then perform Firebase logout
            await signOut(auth);
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },


    // Reset password
    resetPassword: async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return true;
        } catch (error) {
            console.error('Reset password error:', error);

            const errorMessages = {
                'auth/user-not-found': 'No user found with this email',
                'auth/invalid-email': 'Invalid email address'
            };

            throw new Error(errorMessages[error.code] || error.message);
        }
    },

    // Listen to auth state changes
    onAuthStateChanged: (callback) => {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userProfile = await getUserProfile(user.uid);
                callback({
                    id: user.uid,
                    email: user.email,
                    name: user.displayName,
                    emailVerified: user.emailVerified,
                    photoURL: user.photoURL,
                    ...userProfile
                });
            } else {
                callback(null);
            }
        });
    },

    // Get current user with profile
    getCurrentUser: () => {
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, async (user) => {
                if (user) {
                    const userProfile = await getUserProfile(user.uid);
                    resolve({
                        id: user.uid,
                        email: user.email,
                        name: user.displayName,
                        emailVerified: user.emailVerified,
                        photoURL: user.photoURL,
                        ...userProfile
                    });
                } else {
                    resolve(null);
                }
                unsubscribe();
            });
        });
    },

    // Update user role (admin only)
    updateUserRole: async (userId, newRole) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                role: newRole,
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    },

    // Get all users (admin only)
    getAllUsers: async () => {
        try {
            const usersRef = collection(db, 'users');
            const querySnapshot = await getDocs(usersRef);

            const users = [];
            querySnapshot.forEach((doc) => {
                users.push({ id: doc.id, ...doc.data() });
            });

            return users;
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    },

    // Check if user has specific role
    hasRole: async (uid, requiredRole) => {
        const userProfile = await getUserProfile(uid);
        return userProfile && userProfile.role === requiredRole;
    }
};
