import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isStorageAvailable } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import type {
  Lead,
  Property,
  Client,
  FollowUp,
  Task,
  SiteVisit,
  Deal,
  Activity,
  AppNotification,
  Organization,
  Member,
  UserProfile,
} from '../types';
import {
  generateDemoLeads,
  generateDemoProperties,
  generateDemoClients,
  generateDemoFollowUps,
  generateDemoTasks,
  generateDemoSiteVisits,
  generateDemoDeals,
  generateDemoActivities,
} from '../utils/demoData';

// --- ORGANIZATIONS & USERS ---

export async function createOrganization(orgData: Omit<Organization, 'id'>, customId?: string): Promise<string> {
  const orgsRef = collection(db, 'organizations');
  const orgDoc = customId ? doc(orgsRef, customId) : doc(orgsRef);
  try {
    const finalData = { ...orgData, id: orgDoc.id };
    await setDoc(orgDoc, finalData);
    return orgDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `organizations/${orgDoc.id}`);
  }
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
  try {
    const snap = await getDoc(doc(db, 'organizations', orgId));
    if (!snap.exists()) return null;
    return snap.data() as Organization;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `organizations/${orgId}`);
  }
}

export async function updateOrganization(orgId: string, updates: Partial<Organization>): Promise<void> {
  try {
    await updateDoc(doc(db, 'organizations', orgId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `organizations/${orgId}`);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }
}

export async function setUserProfile(profile: UserProfile): Promise<void> {
  try {
    await setDoc(doc(db, 'users', profile.uid), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${profile.uid}`);
  }
}

export async function addMemberToOrg(orgId: string, member: Member): Promise<void> {
  try {
    await setDoc(doc(db, 'organizations', orgId, 'members', member.userId), member);
  } catch (error: any) {
    console.warn('addMemberToOrg non-fatal warning:', error?.message || error);
  }
}

export async function getOrgMembers(orgId: string): Promise<Member[]> {
  try {
    const snap = await getDocs(collection(db, 'organizations', orgId, 'members'));
    return snap.docs.map((d) => d.data() as Member);
  } catch (error: any) {
    console.warn('getOrgMembers non-fatal warning:', error?.message || error);
    return [];
  }
}

export async function updateOrgMember(orgId: string, userId: string, updates: Partial<Member>): Promise<void> {
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'members', userId), updates);
  } catch (error: any) {
    console.warn('updateOrgMember non-fatal warning:', error?.message || error);
  }
}

// --- ACTIVITIES HELPER ---

export async function logActivity(
  orgId: string,
  activity: Omit<Activity, 'id' | 'timestamp'>
): Promise<void> {
  try {
    const colRef = collection(db, 'organizations', orgId, 'activities');
    const newDoc = doc(colRef);
    await setDoc(newDoc, {
      ...activity,
      id: newDoc.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Non-blocking log
    console.warn('Could not record activity:', error);
  }
}

// --- LEADS ---

export async function getLeads(orgId: string): Promise<Lead[]> {
  try {
    const q = query(collection(db, 'organizations', orgId, 'leads'), orderBy('createdAt', 'desc'), limit(200));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Lead);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `organizations/${orgId}/leads`);
  }
}

export function subscribeToLeads(orgId: string, onUpdate: (leads: Lead[]) => void, onError?: (err: any) => void) {
  const q = query(collection(db, 'organizations', orgId, 'leads'), orderBy('createdAt', 'desc'), limit(200));
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(snap.docs.map((d) => d.data() as Lead));
    },
    (err) => {
      console.warn('Leads subscription warning:', err?.message || err);
      if (onError) onError(err);
    }
  );
}

export async function createLead(
  orgId: string,
  leadData: Omit<Lead, 'id' | 'createdAt'>,
  user: { uid: string; displayName: string }
): Promise<string> {
  const colRef = collection(db, 'organizations', orgId, 'leads');
  const newDoc = doc(colRef);
  try {
    const now = new Date().toISOString();
    const lead: Lead = {
      ...leadData,
      id: newDoc.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newDoc, lead);

    await logActivity(orgId, {
      userId: user.uid,
      userName: user.displayName,
      relatedType: 'lead',
      relatedId: newDoc.id,
      relatedName: lead.name,
      activityType: 'Lead Created',
      description: `Created lead "${lead.name}" (${lead.propertyType} - ${lead.preferredLocation})`,
    });

    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `organizations/${orgId}/leads/${newDoc.id}`);
  }
}

export async function updateLead(
  orgId: string,
  leadId: string,
  updates: Partial<Lead>,
  user: { uid: string; displayName: string }
): Promise<void> {
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'leads', leadId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    if (updates.status) {
      await logActivity(orgId, {
        userId: user.uid,
        userName: user.displayName,
        relatedType: 'lead',
        relatedId: leadId,
        relatedName: updates.name || 'Lead',
        activityType: 'Status Change',
        description: `Lead status updated to ${updates.status}`,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `organizations/${orgId}/leads/${leadId}`);
  }
}

export async function deleteLead(orgId: string, leadId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'leads', leadId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `organizations/${orgId}/leads/${leadId}`);
  }
}

// --- PROPERTIES ---

export async function getProperties(orgId: string): Promise<Property[]> {
  try {
    const q = query(collection(db, 'organizations', orgId, 'properties'), orderBy('createdAt', 'desc'), limit(150));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Property);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `organizations/${orgId}/properties`);
  }
}

export function subscribeToProperties(
  orgId: string,
  onUpdate: (props: Property[]) => void,
  onError?: (err: any) => void
) {
  const q = query(collection(db, 'organizations', orgId, 'properties'), orderBy('createdAt', 'desc'), limit(150));
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(snap.docs.map((d) => d.data() as Property));
    },
    (err) => {
      console.warn('Properties subscription warning:', err.message);
      if (onError) onError(err);
    }
  );
}

export async function createProperty(
  orgId: string,
  propertyData: Omit<Property, 'id' | 'createdAt'>,
  user: { uid: string; displayName: string }
): Promise<string> {
  const colRef = collection(db, 'organizations', orgId, 'properties');
  const newDoc = doc(colRef);
  try {
    const now = new Date().toISOString();
    const prop: Property = {
      ...propertyData,
      id: newDoc.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newDoc, prop);

    await logActivity(orgId, {
      userId: user.uid,
      userName: user.displayName,
      relatedType: 'property',
      relatedId: newDoc.id,
      relatedName: prop.title,
      activityType: 'Property Created',
      description: `Listed new property "${prop.title}" (${prop.propertyType} in ${prop.locality})`,
    });

    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `organizations/${orgId}/properties/${newDoc.id}`);
  }
}

export async function updateProperty(
  orgId: string,
  propId: string,
  updates: Partial<Property>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'properties', propId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `organizations/${orgId}/properties/${propId}`);
  }
}

export async function deleteProperty(orgId: string, propId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'properties', propId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `organizations/${orgId}/properties/${propId}`);
  }
}

// Image compression and upload helper
export async function uploadPropertyImage(orgId: string, file: File): Promise<string> {
  if (!isStorageAvailable || !storage) {
    throw new Error('Firebase Storage is currently disabled (Spark plan). Add properties using direct image URLs.');
  }

  // Compress image using HTML Canvas before upload to optimize storage & speed
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1400;
        const MAX_HEIGHT = 1400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              resolve(img.src);
              return;
            }
            try {
              if (!storage) {
                resolve(canvas.toDataURL('image/jpeg', 0.8));
                return;
              }
              const fileKey = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
              const storageRef = ref(storage, `organizations/${orgId}/properties/${fileKey}`);
              await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' });
              const downloadUrl = await getDownloadURL(storageRef);
              resolve(downloadUrl);
            } catch (err) {
              console.warn('Firebase Storage upload failed, falling back to base64 preview:', err);
              // Fallback to base64 so user flow doesn't block if storage rules or bucket have issues
              resolve(canvas.toDataURL('image/jpeg', 0.8));
            }
          },
          'image/jpeg',
          0.85
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
    };
    reader.onerror = (err) => reject(err);
  });
}

// --- CLIENTS ---

export async function getClients(orgId: string): Promise<Client[]> {
  try {
    const q = query(collection(db, 'organizations', orgId, 'clients'), orderBy('createdAt', 'desc'), limit(150));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Client);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `organizations/${orgId}/clients`);
  }
}

export function subscribeToClients(
  orgId: string,
  onUpdate: (clients: Client[]) => void,
  onError?: (err: any) => void
) {
  const q = query(collection(db, 'organizations', orgId, 'clients'), orderBy('createdAt', 'desc'), limit(150));
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(snap.docs.map((d) => d.data() as Client));
    },
    (err) => {
      console.warn('Clients subscription warning:', err.message);
      if (onError) onError(err);
    }
  );
}

export async function createClient(
  orgId: string,
  clientData: Omit<Client, 'id' | 'createdAt'>
): Promise<string> {
  const colRef = collection(db, 'organizations', orgId, 'clients');
  const newDoc = doc(colRef);
  try {
    const client: Client = {
      ...clientData,
      id: newDoc.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(newDoc, client);
    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `organizations/${orgId}/clients/${newDoc.id}`);
  }
}

export async function updateClient(orgId: string, clientId: string, updates: Partial<Client>): Promise<void> {
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'clients', clientId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `organizations/${orgId}/clients/${clientId}`);
  }
}

export async function deleteClient(orgId: string, clientId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'clients', clientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `organizations/${orgId}/clients/${clientId}`);
  }
}

// --- FOLLOW-UPS ---

export async function getFollowUps(orgId: string): Promise<FollowUp[]> {
  try {
    const q = query(collection(db, 'organizations', orgId, 'followUps'), orderBy('date', 'desc'), limit(150));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as FollowUp);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `organizations/${orgId}/followUps`);
  }
}

export function subscribeToFollowUps(
  orgId: string,
  onUpdate: (followUps: FollowUp[]) => void,
  onError?: (err: any) => void
) {
  const q = query(collection(db, 'organizations', orgId, 'followUps'), orderBy('date', 'asc'), limit(150));
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(snap.docs.map((d) => d.data() as FollowUp));
    },
    (err) => {
      console.warn('Follow-ups subscription warning:', err.message);
      if (onError) onError(err);
    }
  );
}

export async function createFollowUp(
  orgId: string,
  data: Omit<FollowUp, 'id' | 'createdAt'>
): Promise<string> {
  const colRef = collection(db, 'organizations', orgId, 'followUps');
  const newDoc = doc(colRef);
  try {
    const followUp: FollowUp = {
      ...data,
      id: newDoc.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(newDoc, followUp);
    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `organizations/${orgId}/followUps/${newDoc.id}`);
  }
}

export async function updateFollowUp(orgId: string, followUpId: string, updates: Partial<FollowUp>): Promise<void> {
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'followUps', followUpId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `organizations/${orgId}/followUps/${followUpId}`);
  }
}

export async function deleteFollowUp(orgId: string, followUpId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'followUps', followUpId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `organizations/${orgId}/followUps/${followUpId}`);
  }
}

// --- TASKS ---

export async function getTasks(orgId: string): Promise<Task[]> {
  try {
    const q = query(collection(db, 'organizations', orgId, 'tasks'), orderBy('dueDate', 'asc'), limit(150));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Task);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `organizations/${orgId}/tasks`);
  }
}

export function subscribeToTasks(
  orgId: string,
  onUpdate: (tasks: Task[]) => void,
  onError?: (err: any) => void
) {
  const q = query(collection(db, 'organizations', orgId, 'tasks'), orderBy('dueDate', 'asc'), limit(150));
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(snap.docs.map((d) => d.data() as Task));
    },
    (err) => {
      console.warn('Tasks subscription warning:', err.message);
      if (onError) onError(err);
    }
  );
}

export async function createTask(orgId: string, data: Omit<Task, 'id' | 'createdAt'>): Promise<string> {
  const colRef = collection(db, 'organizations', orgId, 'tasks');
  const newDoc = doc(colRef);
  try {
    const task: Task = {
      ...data,
      id: newDoc.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(newDoc, task);
    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `organizations/${orgId}/tasks/${newDoc.id}`);
  }
}

export async function updateTask(orgId: string, taskId: string, updates: Partial<Task>): Promise<void> {
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'tasks', taskId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `organizations/${orgId}/tasks/${taskId}`);
  }
}

export async function deleteTask(orgId: string, taskId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `organizations/${orgId}/tasks/${taskId}`);
  }
}

// --- SITE VISITS ---

export async function getSiteVisits(orgId: string): Promise<SiteVisit[]> {
  try {
    const q = query(collection(db, 'organizations', orgId, 'siteVisits'), orderBy('date', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as SiteVisit);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `organizations/${orgId}/siteVisits`);
  }
}

export function subscribeToSiteVisits(
  orgId: string,
  onUpdate: (visits: SiteVisit[]) => void,
  onError?: (err: any) => void
) {
  const q = query(collection(db, 'organizations', orgId, 'siteVisits'), orderBy('date', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(snap.docs.map((d) => d.data() as SiteVisit));
    },
    (err) => {
      console.warn('Site visits subscription warning:', err.message);
      if (onError) onError(err);
    }
  );
}

export async function createSiteVisit(
  orgId: string,
  data: Omit<SiteVisit, 'id' | 'createdAt'>,
  user: { uid: string; displayName: string }
): Promise<string> {
  const colRef = collection(db, 'organizations', orgId, 'siteVisits');
  const newDoc = doc(colRef);
  try {
    const visit: SiteVisit = {
      ...data,
      id: newDoc.id,
      createdAt: new Date().toISOString(),
    };
    await setDoc(newDoc, visit);

    await logActivity(orgId, {
      userId: user.uid,
      userName: user.displayName,
      relatedType: 'siteVisit',
      relatedId: newDoc.id,
      relatedName: visit.propertyTitle,
      activityType: 'Site Visit',
      description: `Scheduled site visit with ${visit.leadName || visit.clientName} for "${visit.propertyTitle}" on ${visit.date}`,
    });

    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `organizations/${orgId}/siteVisits/${newDoc.id}`);
  }
}

export async function updateSiteVisit(orgId: string, visitId: string, updates: Partial<SiteVisit>): Promise<void> {
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'siteVisits', visitId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `organizations/${orgId}/siteVisits/${visitId}`);
  }
}

export async function deleteSiteVisit(orgId: string, visitId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'siteVisits', visitId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `organizations/${orgId}/siteVisits/${visitId}`);
  }
}

// --- DEALS ---

export async function getDeals(orgId: string): Promise<Deal[]> {
  try {
    const q = query(collection(db, 'organizations', orgId, 'deals'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Deal);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `organizations/${orgId}/deals`);
  }
}

export function subscribeToDeals(
  orgId: string,
  onUpdate: (deals: Deal[]) => void,
  onError?: (err: any) => void
) {
  const q = query(collection(db, 'organizations', orgId, 'deals'), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(snap.docs.map((d) => d.data() as Deal));
    },
    (err) => {
      console.warn('Deals subscription warning:', err.message);
      if (onError) onError(err);
    }
  );
}

export async function createDeal(
  orgId: string,
  data: Omit<Deal, 'id' | 'createdAt'>,
  user: { uid: string; displayName: string }
): Promise<string> {
  const colRef = collection(db, 'organizations', orgId, 'deals');
  const newDoc = doc(colRef);
  try {
    const now = new Date().toISOString();
    const deal: Deal = {
      ...data,
      id: newDoc.id,
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(newDoc, deal);

    await logActivity(orgId, {
      userId: user.uid,
      userName: user.displayName,
      relatedType: 'deal',
      relatedId: newDoc.id,
      relatedName: deal.dealName,
      activityType: 'Deal Update',
      description: `Created new deal "${deal.dealName}" in stage "${deal.stage}"`,
    });

    return newDoc.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `organizations/${orgId}/deals/${newDoc.id}`);
  }
}

export async function updateDeal(
  orgId: string,
  dealId: string,
  updates: Partial<Deal>,
  user: { uid: string; displayName: string }
): Promise<void> {
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'deals', dealId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    if (updates.stage) {
      await logActivity(orgId, {
        userId: user.uid,
        userName: user.displayName,
        relatedType: 'deal',
        relatedId: dealId,
        relatedName: updates.dealName || 'Deal',
        activityType: 'Deal Update',
        description: `Deal moved to stage: ${updates.stage}`,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `organizations/${orgId}/deals/${dealId}`);
  }
}

export async function deleteDeal(orgId: string, dealId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'organizations', orgId, 'deals', dealId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `organizations/${orgId}/deals/${dealId}`);
  }
}

// --- ACTIVITIES ---

export async function getActivities(orgId: string, limitCount = 50): Promise<Activity[]> {
  try {
    const q = query(
      collection(db, 'organizations', orgId, 'activities'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Activity);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `organizations/${orgId}/activities`);
  }
}

export function subscribeToActivities(
  orgId: string,
  onUpdate: (activities: Activity[]) => void,
  limitCount = 40,
  onError?: (err: any) => void
) {
  const q = query(
    collection(db, 'organizations', orgId, 'activities'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(
    q,
    (snap) => {
      onUpdate(snap.docs.map((d) => d.data() as Activity));
    },
    (err) => {
      console.warn('Activities subscription warning:', err.message);
      if (onError) onError(err);
    }
  );
}

// --- NOTIFICATIONS ---

export async function getNotifications(orgId: string, userId: string): Promise<AppNotification[]> {
  try {
    const q = query(
      collection(db, 'organizations', orgId, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(30)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => d.data() as AppNotification)
      .filter((n) => n.userId === userId || n.userId === 'all');
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `organizations/${orgId}/notifications`);
  }
}

export function subscribeToNotifications(
  orgId: string,
  userId: string,
  onUpdate: (notifs: AppNotification[]) => void,
  onError?: (err: any) => void
) {
  const q = query(
    collection(db, 'organizations', orgId, 'notifications'),
    orderBy('createdAt', 'desc'),
    limit(30)
  );
  return onSnapshot(
    q,
    (snap) => {
      const all = snap.docs.map((d) => d.data() as AppNotification);
      onUpdate(all.filter((n) => n.userId === userId || n.userId === 'all'));
    },
    (err) => {
      console.warn('Notifications subscription warning:', err.message);
      if (onError) onError(err);
    }
  );
}

export async function markNotificationAsRead(orgId: string, notifId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'organizations', orgId, 'notifications', notifId), { read: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `organizations/${orgId}/notifications/${notifId}`);
  }
}

export async function markAllNotificationsAsRead(orgId: string, userId: string): Promise<void> {
  try {
    const notifs = await getNotifications(orgId, userId);
    const unread = notifs.filter((n) => !n.read);
    const batch = writeBatch(db);
    for (const n of unread) {
      batch.update(doc(db, 'organizations', orgId, 'notifications', n.id), { read: true });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `organizations/${orgId}/notifications`);
  }
}

export async function createNotification(
  orgId: string,
  notif: Omit<AppNotification, 'id' | 'createdAt'>
): Promise<void> {
  try {
    const colRef = collection(db, 'organizations', orgId, 'notifications');
    const newDoc = doc(colRef);
    await setDoc(newDoc, {
      ...notif,
      id: newDoc.id,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn('Could not create notification:', error);
  }
}

// --- DEMO DATA SEEDING & CLEARING ---

export async function seedOrganizationDemoData(
  orgId: string,
  userId: string,
  userName: string
): Promise<{ leads: number; properties: number; clients: number; deals: number }> {
  try {
    const batch = writeBatch(db);

    // 1. Leads
    const leads = generateDemoLeads(userId, userName);
    leads.forEach((l) => {
      const ref = doc(collection(db, 'organizations', orgId, 'leads'));
      batch.set(ref, { ...l, id: ref.id });
    });

    // 2. Properties
    const properties = generateDemoProperties(userId, userName);
    properties.forEach((p) => {
      const ref = doc(collection(db, 'organizations', orgId, 'properties'));
      batch.set(ref, { ...p, id: ref.id });
    });

    // 3. Clients
    const clients = generateDemoClients(userId, userName);
    clients.forEach((c) => {
      const ref = doc(collection(db, 'organizations', orgId, 'clients'));
      batch.set(ref, { ...c, id: ref.id });
    });

    // 4. Follow-ups
    const followUps = generateDemoFollowUps(userId, userName);
    followUps.forEach((f) => {
      const ref = doc(collection(db, 'organizations', orgId, 'followUps'));
      batch.set(ref, { ...f, id: ref.id });
    });

    // 5. Tasks
    const tasks = generateDemoTasks(userId, userName);
    tasks.forEach((t) => {
      const ref = doc(collection(db, 'organizations', orgId, 'tasks'));
      batch.set(ref, { ...t, id: ref.id });
    });

    // 6. Site Visits
    const siteVisits = generateDemoSiteVisits(userId, userName);
    siteVisits.forEach((sv) => {
      const ref = doc(collection(db, 'organizations', orgId, 'siteVisits'));
      batch.set(ref, { ...sv, id: ref.id });
    });

    // 7. Deals
    const deals = generateDemoDeals(userId, userName);
    deals.forEach((d) => {
      const ref = doc(collection(db, 'organizations', orgId, 'deals'));
      batch.set(ref, { ...d, id: ref.id });
    });

    // 8. Activities
    const activities = generateDemoActivities(userName, userId);
    activities.forEach((a) => {
      const ref = doc(collection(db, 'organizations', orgId, 'activities'));
      batch.set(ref, { ...a, id: ref.id });
    });

    await batch.commit();

    // Create a notification about demo data
    await createNotification(orgId, {
      userId,
      title: 'Demo Data Seeded',
      message: 'Successfully seeded 20 Leads, 15 Properties, 10 Clients, and Sales Pipeline deals for testing.',
      type: 'system',
      read: false,
    });

    return {
      leads: leads.length,
      properties: properties.length,
      clients: clients.length,
      deals: deals.length,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `organizations/${orgId}/[seed]`);
  }
}

export async function clearOrganizationDemoData(orgId: string): Promise<number> {
  const subcollections = ['leads', 'properties', 'clients', 'followUps', 'tasks', 'siteVisits', 'deals', 'activities'];
  let totalDeleted = 0;

  try {
    for (const subcol of subcollections) {
      const snap = await getDocs(
        query(collection(db, 'organizations', orgId, subcol), where('isDemo', '==', true))
      );
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((d) => {
          batch.delete(d.ref);
          totalDeleted++;
        });
        await batch.commit();
      }
    }
    return totalDeleted;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `organizations/${orgId}/[clearDemo]`);
  }
}
