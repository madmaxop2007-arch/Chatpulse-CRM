import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, isFirebaseConfigured, testConnection } from '../firebase/config';
import {
  getUserProfile,
  setUserProfile,
  createOrganization,
  getOrganization,
  addMemberToOrg,
} from '../services/crmService';
import type { UserProfile, Organization, UserRole } from '../types';

interface RegisterData {
  fullName: string;
  agencyName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  organization: Organization | null;
  role: UserRole;
  loading: boolean;
  isConfigured: boolean;
  login: (email: string, pass: string) => Promise<void>;
  registerAgency: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [organization, setOrganizationState] = useState<Organization | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user profile & organization when auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfileState(profile);
            const org = await getOrganization(profile.organizationId);
            setOrganizationState(org);

            // Auto-heal / sync member record
            if (org) {
              try {
                await addMemberToOrg(org.id, {
                  userId: user.uid,
                  email: user.email || profile.email,
                  name: profile.displayName || user.displayName || 'Agent',
                  phone: profile.phoneNumber || '',
                  role: profile.role || (org.ownerId === user.uid ? 'owner' : 'agent'),
                  status: 'active',
                  joinedAt: profile.createdAt || new Date().toISOString(),
                });
              } catch (memberSyncErr) {
                // Non-blocking background sync
                console.warn('Member sync attempt result:', memberSyncErr);
              }
            }
          } else {
            // User authenticated but no profile yet (e.g. edge case or initial step)
            setUserProfileState(null);
            setOrganizationState(null);
          }
        } catch (error) {
          console.error('Failed to load user profile or organization:', error);
        }
      } else {
        setUserProfileState(null);
        setOrganizationState(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please supply Firebase credentials.');
    }
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const profile = await getUserProfile(cred.user.uid);
    if (profile) {
      setUserProfileState(profile);
      const org = await getOrganization(profile.organizationId);
      setOrganizationState(org);

      if (org) {
        try {
          await addMemberToOrg(org.id, {
            userId: cred.user.uid,
            email: cred.user.email || profile.email,
            name: profile.displayName || cred.user.displayName || 'Agent',
            phone: profile.phoneNumber || '',
            role: profile.role || (org.ownerId === cred.user.uid ? 'owner' : 'agent'),
            status: 'active',
            joinedAt: profile.createdAt || new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Member verification warning:', e);
        }
      }
    }
  };

  const registerAgency = async (data: RegisterData) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured. Please set your credentials in .env.');
    }

    // 1. Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;

    // Update Firebase Auth display name
    await updateProfile(user, { displayName: data.fullName });

    const now = new Date().toISOString();

    // 2. Create Organization
    const orgId = await createOrganization({
      name: data.agencyName,
      phone: data.phoneNumber,
      email: data.email,
      location: 'India',
      currency: 'INR (₹)',
      ownerId: user.uid,
      leadStatuses: ['New', 'Contacted', 'Qualified', 'Site Visit', 'Negotiation', 'Won', 'Lost'],
      propertyTypes: ['Apartment', 'Villa', 'Independent House', 'Plot', 'Commercial', 'Office'],
      createdAt: now,
      updatedAt: now,
    });

    // 3. Create Owner Profile
    const profile: UserProfile = {
      uid: user.uid,
      email: data.email,
      displayName: data.fullName,
      phoneNumber: data.phoneNumber,
      organizationId: orgId,
      role: 'owner',
      status: 'active',
      createdAt: now,
    };
    await setUserProfile(profile);

    // 4. Associate member record
    try {
      await addMemberToOrg(orgId, {
        userId: user.uid,
        email: data.email,
        name: data.fullName,
        phone: data.phoneNumber,
        role: 'owner',
        status: 'active',
        joinedAt: now,
      });
    } catch (memberErr) {
      console.warn('Initial member record save deferred:', memberErr);
    }

    setUserProfileState(profile);
    const org = await getOrganization(orgId);
    setOrganizationState(org);
  };

  const logout = async () => {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    setCurrentUser(null);
    setUserProfileState(null);
    setOrganizationState(null);
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured.');
    }
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (currentUser) {
      const p = await getUserProfile(currentUser.uid);
      if (p) setUserProfileState(p);
    }
  };

  const refreshOrganization = async () => {
    if (userProfile?.organizationId) {
      const o = await getOrganization(userProfile.organizationId);
      if (o) setOrganizationState(o);
    }
  };

  const role: UserRole = userProfile?.role || 'agent';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        organization,
        role,
        loading,
        isConfigured: isFirebaseConfigured,
        login,
        registerAgency,
        logout,
        resetPassword,
        refreshProfile,
        refreshOrganization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
