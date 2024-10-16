import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from '../store/reducers/authSlice';
import { getUser } from '../pages/api/api.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const [userDataFetched, setUserDataFetched] = useState(false);

    useEffect(() => {
        if (user && !userDataFetched) {
            // Fetch additional user data when user is authenticated
            const fetchUserData = async () => {
                try {
                    const userResponse = await getUser(user?.id || user.uid);
                    const updatedUser = { ...user, ...userResponse }; // Merge the fetched data with the existing user object

                    dispatch(setUser(updatedUser)); // Update the user in the store
                    setUserDataFetched(true); // Mark the data as fetched
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchUserData();
        }

        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // Set user data from Firebase
                const initialUser = {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    email: firebaseUser.email,
                    id: firebaseUser.id || firebaseUser.uid,
                    role: firebaseUser?.role,
                    status: firebaseUser?.status,
                };

                dispatch(setUser(initialUser)); // Store initial Firebase user data

                // Reset the user data fetch status when the Firebase user changes
                setUserDataFetched(false);
            } else {
                dispatch(clearUser());
            }
        });

        return () => unsubscribe();
    }, [dispatch, user, userDataFetched]);

    return (
        <AuthContext.Provider value={{
            uid: user?.uid,
            displayName: user?.displayName,
            photoURL: user?.photoURL,
            email: user?.email,
            id: user?.id || user?.uid,
            role: user?.role,
            status: user?.status,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
