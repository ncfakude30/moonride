import React, { createContext, useContext, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from '../store/reducers/authSlice';
import { getUser } from '../pages/api/api.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        if (user && !user?.role) {
            // Fetch additional user data when user is authenticated
            const fetchUserData = async () => {
                try {
                    const userResponse = await getUser(user.uid).catch(()=> null);
                    const updatedUser = { ...user, ...userResponse }; // Merge the fetched data with the existing user object
                    dispatch(setUser(updatedUser)); // Update the user in the store
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchUserData();
        }
    }, [dispatch, user]);

    useEffect(() => {
        if(user) {
            return (
                <AuthContext.Provider value={{uid: user?.uid,
                    displayName: user?.displayName,
                    photoURL: user?.photoURL,
                    email: user?.email,
                    role: user?.role,
                    status: user?.status,
                    id: user?.id || user?.uid,}}>
                    {children}
                </AuthContext.Provider>
            );
        }
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                dispatch(setUser({
                    uid: user.uid,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    email: user.email,
                    id: user?.id || user.uid,
                }));
            } else {
                dispatch(clearUser());
            }
        });

        return () => unsubscribe();
    }, [dispatch]);

    return (
        <AuthContext.Provider value={{uid: user?.uid,
            displayName: user?.displayName,
            photoURL: user?.photoURL,
            email: user?.email,
            id: user?.id || user?.uid,}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
