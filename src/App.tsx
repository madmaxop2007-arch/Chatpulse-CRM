import React, { useState, useEffect } from 'react';
import { ShieldAlert, Copy, ExternalLink, Check } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import type { PageId } from './components/layout/Sidebar';
import { LoadingState } from './components/common/LoadingState';
import { FirebaseConfigPrompt } from './components/setup/FirebaseConfigPrompt';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Onboarding } from './pages/onboarding/Onboarding';

// Main Pages
import { Dashboard } from './pages/dashboard/Dashboard';
import { LeadsList } from './pages/leads/LeadsList';
import { LeadDetail } from './pages/leads/LeadDetail';
import { LeadFormModal } from './pages/leads/LeadFormModal';

import { PropertiesList } from './pages/properties/PropertiesList';
import { PropertyDetail } from './pages/properties/PropertyDetail';
import { PropertyFormModal } from './pages/properties/PropertyFormModal';

import { ClientsList } from './pages/clients/ClientsList';
import { ClientFormModal } from './pages/clients/ClientFormModal';

import { FollowUpsList } from './pages/followups/FollowUpsList';
import { FollowUpFormModal } from './pages/followups/FollowUpFormModal';

import { TasksList } from './pages/tasks/TasksList';
import { TaskFormModal } from './pages/tasks/TaskFormModal';

import { SiteVisitsList } from './pages/sitevisits/SiteVisitsList';
import { SiteVisitFormModal } from './pages/sitevisits/SiteVisitFormModal';

import { DealsPipeline } from './pages/deals/DealsPipeline';
import { DealFormModal } from './pages/deals/DealFormModal';

import { ActivitiesList } from './pages/activities/ActivitiesList';
import { TeamList } from './pages/team/TeamList';
import { InviteMemberModal } from './pages/team/InviteMemberModal';
import { Settings } from './pages/settings/Settings';

// Services
import {
  subscribeToLeads,
  subscribeToProperties,
  subscribeToClients,
  subscribeToFollowUps,
  subscribeToTasks,
  subscribeToSiteVisits,
  subscribeToDeals,
  subscribeToActivities,
  getOrgMembers,
  createLead,
  updateLead,
  deleteLead,
  createProperty,
  updateProperty,
  deleteProperty,
  createClient,
  updateClient,
  deleteClient,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
  createTask,
  updateTask,
  deleteTask,
  createSiteVisit,
  updateSiteVisit,
  deleteSiteVisit,
  createDeal,
  updateDeal,
  deleteDeal,
  addMemberToOrg,
  updateOrgMember,
  logActivity,
} from './services/crmService';

import type {
  Lead,
  Property,
  Client,
  FollowUp,
  Task,
  SiteVisit,
  Deal,
  Activity,
  Member,
  UserRole,
  FollowUpStatus,
  TaskStatus,
  SiteVisitStatus,
  DealStage,
} from './types';

const MainApp: React.FC = () => {
  const { currentUser, userProfile, organization, loading, isConfigured } = useAuth();
  const { showToast } = useToast();

  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot'>('login');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');

  // Selected Detail IDs
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Firestore Collections State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisit[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Modals Open State
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const [propModalOpen, setPropModalOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);

  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);
  const [followUpDefaultRelated, setFollowUpDefaultRelated] = useState<
    { type: 'lead' | 'client'; id: string; name: string } | undefined
  >(undefined);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskDefaultRelated, setTaskDefaultRelated] = useState<
    { leadId?: string; leadName?: string; clientId?: string; clientName?: string } | undefined
  >(undefined);

  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);
  const [visitDefaultProp, setVisitDefaultProp] = useState<Property | null>(null);
  const [visitDefaultLead, setVisitDefaultLead] = useState<Lead | null>(null);

  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [dealDefaultClient, setDealDefaultClient] = useState<Client | null>(null);
  const [dealDefaultLead, setDealDefaultLead] = useState<Lead | null>(null);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [hasPermissionWarning, setHasPermissionWarning] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  const orgId = userProfile?.organizationId || '';
  const agentName = userProfile?.displayName || 'Agent';
  const agentId = userProfile?.uid || '';

  const handleCopyRules = () => {
    const rulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default deny unauthenticated access
    match /{document=**} {
      allow read, write: if false;
    }

    // Require Firebase Authentication for CRM operations
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }

    match /organizations/{orgId} {
      allow read, write: if request.auth != null;

      match /{allChildren=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
}`;
    navigator.clipboard.writeText(rulesCode);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 3000);
  };

  // Firestore Subscriptions
  useEffect(() => {
    if (!orgId) return;

    const unsubs: (() => void)[] = [];

    const handleSubError = (err: any) => {
      if (err?.code === 'permission-denied' || String(err?.message || '').toLowerCase().includes('permission')) {
        setHasPermissionWarning(true);
      }
    };

    const handleSuccessData = () => {
      setHasPermissionWarning(false);
    };

    unsubs.push(
      subscribeToLeads(
        orgId,
        (data) => {
          setLeads(data);
          handleSuccessData();
        },
        handleSubError
      )
    );
    unsubs.push(
      subscribeToProperties(
        orgId,
        (data) => {
          setProperties(data);
          handleSuccessData();
        },
        handleSubError
      )
    );
    unsubs.push(
      subscribeToClients(
        orgId,
        (data) => {
          setClients(data);
          handleSuccessData();
        },
        handleSubError
      )
    );
    unsubs.push(
      subscribeToFollowUps(
        orgId,
        (data) => {
          setFollowUps(data);
          handleSuccessData();
        },
        handleSubError
      )
    );
    unsubs.push(
      subscribeToTasks(
        orgId,
        (data) => {
          setTasks(data);
          handleSuccessData();
        },
        handleSubError
      )
    );
    unsubs.push(
      subscribeToSiteVisits(
        orgId,
        (data) => {
          setSiteVisits(data);
          handleSuccessData();
        },
        handleSubError
      )
    );
    unsubs.push(
      subscribeToDeals(
        orgId,
        (data) => {
          setDeals(data);
          handleSuccessData();
        },
        handleSubError
      )
    );
    unsubs.push(
      subscribeToActivities(
        orgId,
        (data) => {
          setActivities(data);
          handleSuccessData();
        },
        40,
        handleSubError
      )
    );

    // Load members
    getOrgMembers(orgId)
      .then((m) => {
        if (m && m.length > 0) {
          setMembers(m);
        } else if (userProfile) {
          setMembers([
            {
              userId: userProfile.uid,
              name: userProfile.displayName || 'Agent',
              email: userProfile.email,
              role: userProfile.role || 'owner',
              phone: userProfile.phoneNumber,
              status: 'active',
              joinedAt: userProfile.createdAt,
            },
          ]);
        }
      })
      .catch((e) => {
        console.warn('Could not load members:', e);
      });

    return () => {
      unsubs.forEach((u) => u && u());
    };
  }, [orgId]);

  // Loading check
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <LoadingState message="Initializing ChatPulse CRM &amp; verifying credentials..." />
      </div>
    );
  }

  // Not configured check
  if (!isConfigured) {
    return <FirebaseConfigPrompt />;
  }

  // Unauthenticated user
  if (!currentUser) {
    if (authView === 'register') {
      return (
        <Register
          onGoToLogin={() => setAuthView('login')}
          onRegistered={() => setShowOnboarding(true)}
        />
      );
    }
    if (authView === 'forgot') {
      return <ForgotPassword onBackToLogin={() => setAuthView('login')} />;
    }
    return (
      <Login
        onGoToRegister={() => setAuthView('register')}
        onGoToForgotPassword={() => setAuthView('forgot')}
      />
    );
  }

  // First time onboarding check
  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  // --- CRUD HANDLERS ---

  // Leads
  const handleLeadSubmit = async (data: Omit<Lead, 'id' | 'createdAt'>) => {
    if (!orgId) return;
    if (editingLead) {
      await updateLead(orgId, editingLead.id, data, { uid: agentId, displayName: agentName });
      showToast('Lead updated successfully!');
    } else {
      await createLead(orgId, data, { uid: agentId, displayName: agentName });
      showToast('New lead added to pipeline!');
    }
    setEditingLead(null);
  };

  const handleDeleteLead = async (id: string) => {
    if (!orgId) return;
    await deleteLead(orgId, id);
    if (selectedLeadId === id) setSelectedLeadId(null);
  };

  const handleConvertToClient = async (lead: Lead) => {
    if (!orgId) return;
    try {
      await createClient(orgId, {
        name: lead.name,
        phone: lead.phone,
        email: lead.email || '',
        whatsapp: lead.whatsapp || lead.phone,
        clientType: lead.purpose === 'Rent' ? 'Tenant' : lead.purpose === 'Investment' ? 'Investor' : 'Buyer',
        budget: lead.budgetMax || lead.budgetMin,
        preferredLocation: lead.preferredLocation,
        propertyType: lead.propertyType,
        requirements: `${lead.bedrooms ? lead.bedrooms + ' ' : ''}${lead.propertyType} in ${lead.preferredLocation}`,
        assignedAgentId: agentId,
        assignedAgentName: agentName,
        notes: lead.notes,
        isDemo: lead.isDemo,
      });

      // Update lead status to Won
      await updateLead(orgId, lead.id, { status: 'Won' }, { uid: agentId, displayName: agentName });
      showToast(`Converted "${lead.name}" to verified client & marked lead as Won!`, 'success');
      setCurrentPage('clients');
    } catch (err: any) {
      showToast('Failed to convert lead: ' + err.message, 'error');
    }
  };

  const handleImportLeads = async (imported: Omit<Lead, 'id' | 'createdAt'>[]) => {
    if (!orgId) return;
    for (const l of imported) {
      await createLead(orgId, l, { uid: agentId, displayName: agentName });
    }
  };

  // Properties
  const handlePropSubmit = async (data: Omit<Property, 'id' | 'createdAt'>) => {
    if (!orgId) return;
    if (editingProp) {
      await updateProperty(orgId, editingProp.id, data);
      showToast('Property listing updated.');
    } else {
      await createProperty(orgId, data, { uid: agentId, displayName: agentName });
      showToast('New property published to inventory!');
    }
    setEditingProp(null);
  };

  const handleDeleteProp = async (id: string) => {
    if (!orgId) return;
    await deleteProperty(orgId, id);
    if (selectedPropertyId === id) setSelectedPropertyId(null);
  };

  // Clients
  const handleClientSubmit = async (data: Omit<Client, 'id' | 'createdAt'>) => {
    if (!orgId) return;
    if (editingClient) {
      await updateClient(orgId, editingClient.id, data);
      showToast('Client details updated.');
    } else {
      await createClient(orgId, data);
      showToast('Client record added.');
    }
    setEditingClient(null);
  };

  const handleDeleteClient = async (id: string) => {
    if (!orgId) return;
    await deleteClient(orgId, id);
  };

  // Follow-ups
  const handleFollowUpSubmit = async (data: Omit<FollowUp, 'id' | 'createdAt'>) => {
    if (!orgId) return;
    if (editingFollowUp) {
      await updateFollowUp(orgId, editingFollowUp.id, data);
      showToast('Follow-up updated.');
    } else {
      await createFollowUp(orgId, data);
      showToast('Follow-up scheduled.');
    }
    setEditingFollowUp(null);
  };

  const handleDeleteFollowUp = async (id: string) => {
    if (!orgId) return;
    await deleteFollowUp(orgId, id);
  };

  const handleUpdateFollowUpStatus = async (id: string, status: FollowUpStatus) => {
    if (!orgId) return;
    await updateFollowUp(orgId, id, { status });
    showToast(`Follow-up marked as ${status}`);
  };

  // Tasks
  const handleTaskSubmit = async (data: Omit<Task, 'id' | 'createdAt'>) => {
    if (!orgId) return;
    if (editingTask) {
      await updateTask(orgId, editingTask.id, data);
      showToast('Task updated.');
    } else {
      await createTask(orgId, data);
      showToast('Task added.');
    }
    setEditingTask(null);
  };

  const handleDeleteTask = async (id: string) => {
    if (!orgId) return;
    await deleteTask(orgId, id);
  };

  const handleUpdateTaskStatus = async (id: string, status: TaskStatus) => {
    if (!orgId) return;
    await updateTask(orgId, id, { status });
    showToast(`Task status updated to ${status}`);
  };

  // Site Visits
  const handleVisitSubmit = async (data: Omit<SiteVisit, 'id' | 'createdAt'>) => {
    if (!orgId) return;
    if (editingVisit) {
      await updateSiteVisit(orgId, editingVisit.id, data);
      showToast('Site visit updated.');
    } else {
      await createSiteVisit(orgId, data, { uid: agentId, displayName: agentName });
      showToast('Site visit scheduled!');
    }
    setEditingVisit(null);
  };

  const handleDeleteVisit = async (id: string) => {
    if (!orgId) return;
    await deleteSiteVisit(orgId, id);
  };

  const handleUpdateVisitStatus = async (id: string, status: SiteVisitStatus) => {
    if (!orgId) return;
    await updateSiteVisit(orgId, id, { status });
    showToast(`Site visit marked as ${status}`);
  };

  // Deals
  const handleDealSubmit = async (data: Omit<Deal, 'id' | 'createdAt'>) => {
    if (!orgId) return;
    if (editingDeal) {
      await updateDeal(orgId, editingDeal.id, data, { uid: agentId, displayName: agentName });
      showToast('Deal updated.');
    } else {
      await createDeal(orgId, data, { uid: agentId, displayName: agentName });
      showToast('New deal added to pipeline!');
    }
    setEditingDeal(null);
  };

  const handleDeleteDeal = async (id: string) => {
    if (!orgId) return;
    await deleteDeal(orgId, id);
  };

  const handleUpdateDealStage = async (id: string, stage: DealStage) => {
    if (!orgId) return;
    await updateDeal(orgId, id, { stage }, { uid: agentId, displayName: agentName });
    showToast(`Deal moved to ${stage}`);
  };

  // Team
  const handleInviteMember = async (newMember: Omit<Member, 'joinedAt'>) => {
    if (!orgId) return;
    await addMemberToOrg(orgId, {
      ...newMember,
      joinedAt: new Date().toISOString(),
    });
    setMembers(await getOrgMembers(orgId));
    showToast(`Invited ${newMember.name} as ${newMember.role}`);
  };

  const handleUpdateRole = async (userId: string, role: UserRole) => {
    if (!orgId) return;
    await updateOrgMember(orgId, userId, { role });
    setMembers(await getOrgMembers(orgId));
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    if (!orgId) return;
    const next = currentStatus === 'active' ? 'inactive' : 'active';
    await updateOrgMember(orgId, userId, { status: next as any });
    setMembers(await getOrgMembers(orgId));
  };

  // Render active page
  const renderPage = () => {
    // If viewing lead detail
    if (selectedLeadId) {
      const activeLead = leads.find((l) => l.id === selectedLeadId);
      if (activeLead) {
        return (
          <LeadDetail
            lead={activeLead}
            activities={activities}
            followUps={followUps}
            siteVisits={siteVisits}
            tasks={tasks}
            onBack={() => setSelectedLeadId(null)}
            onEdit={() => {
              setEditingLead(activeLead);
              setLeadModalOpen(true);
            }}
            onUpdateStatus={(st) =>
              updateLead(orgId, activeLead.id, { status: st }, { uid: agentId, displayName: agentName })
            }
            onUpdatePriority={(pr) =>
              updateLead(orgId, activeLead.id, { priority: pr }, { uid: agentId, displayName: agentName })
            }
            onAddNote={async (text) => {
              await logActivity(orgId, {
                userId: agentId,
                userName: agentName,
                relatedType: 'lead',
                relatedId: activeLead.id,
                relatedName: activeLead.name,
                activityType: 'Note',
                description: text,
              });
            }}
            onAddFollowUp={() => {
              setFollowUpDefaultRelated({ type: 'lead', id: activeLead.id, name: activeLead.name });
              setFollowUpModalOpen(true);
            }}
            onScheduleSiteVisit={() => {
              setVisitDefaultLead(activeLead);
              setVisitModalOpen(true);
            }}
            onCreateTask={() => {
              setTaskDefaultRelated({ leadId: activeLead.id, leadName: activeLead.name });
              setTaskModalOpen(true);
            }}
            onConvertToClient={() => handleConvertToClient(activeLead)}
          />
        );
      }
    }

    // If viewing property detail
    if (selectedPropertyId) {
      const activeProp = properties.find((p) => p.id === selectedPropertyId);
      if (activeProp) {
        return (
          <PropertyDetail
            property={activeProp}
            leads={leads}
            siteVisits={siteVisits}
            onBack={() => setSelectedPropertyId(null)}
            onEdit={() => {
              setEditingProp(activeProp);
              setPropModalOpen(true);
            }}
            onDelete={() => handleDeleteProp(activeProp.id)}
            onScheduleSiteVisit={() => {
              setVisitDefaultProp(activeProp);
              setVisitModalOpen(true);
            }}
            onSelectLead={(lId) => {
              setSelectedPropertyId(null);
              setSelectedLeadId(lId);
            }}
          />
        );
      }
    }

    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={(p) => setCurrentPage(p)}
            onOpenNewLead={() => {
              setEditingLead(null);
              setLeadModalOpen(true);
            }}
            onSelectLead={(id) => setSelectedLeadId(id)}
            onSelectProperty={(id) => setSelectedPropertyId(id)}
          />
        );
      case 'leads':
        return (
          <LeadsList
            leads={leads}
            onOpenCreate={() => {
              setEditingLead(null);
              setLeadModalOpen(true);
            }}
            onEditLead={(lead) => {
              setEditingLead(lead);
              setLeadModalOpen(true);
            }}
            onDeleteLead={handleDeleteLead}
            onViewLead={(id) => setSelectedLeadId(id)}
            onAddFollowUpForLead={(lead) => {
              setFollowUpDefaultRelated({ type: 'lead', id: lead.id, name: lead.name });
              setFollowUpModalOpen(true);
            }}
            onScheduleSiteVisitForLead={(lead) => {
              setVisitDefaultLead(lead);
              setVisitModalOpen(true);
            }}
            onConvertToClient={handleConvertToClient}
            onImportLeads={handleImportLeads}
          />
        );
      case 'properties':
        return (
          <PropertiesList
            properties={properties}
            onOpenCreate={() => {
              setEditingProp(null);
              setPropModalOpen(true);
            }}
            onEditProperty={(prop) => {
              setEditingProp(prop);
              setPropModalOpen(true);
            }}
            onDeleteProperty={handleDeleteProp}
            onViewProperty={(id) => setSelectedPropertyId(id)}
            onScheduleSiteVisitForProperty={(prop) => {
              setVisitDefaultProp(prop);
              setVisitModalOpen(true);
            }}
          />
        );
      case 'clients':
        return (
          <ClientsList
            clients={clients}
            onOpenCreate={() => {
              setEditingClient(null);
              setClientModalOpen(true);
            }}
            onEditClient={(c) => {
              setEditingClient(c);
              setClientModalOpen(true);
            }}
            onDeleteClient={handleDeleteClient}
            onCreateDealForClient={(c) => {
              setDealDefaultClient(c);
              setDealModalOpen(true);
            }}
            onAddFollowUpForClient={(c) => {
              setFollowUpDefaultRelated({ type: 'client', id: c.id, name: c.name });
              setFollowUpModalOpen(true);
            }}
          />
        );
      case 'followups':
        return (
          <FollowUpsList
            followUps={followUps}
            onOpenCreate={() => {
              setEditingFollowUp(null);
              setFollowUpDefaultRelated(undefined);
              setFollowUpModalOpen(true);
            }}
            onEditFollowUp={(f) => {
              setEditingFollowUp(f);
              setFollowUpModalOpen(true);
            }}
            onDeleteFollowUp={handleDeleteFollowUp}
            onUpdateStatus={handleUpdateFollowUpStatus}
          />
        );
      case 'tasks':
        return (
          <TasksList
            tasks={tasks}
            onOpenCreate={() => {
              setEditingTask(null);
              setTaskDefaultRelated(undefined);
              setTaskModalOpen(true);
            }}
            onEditTask={(t) => {
              setEditingTask(t);
              setTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onUpdateStatus={handleUpdateTaskStatus}
          />
        );
      case 'sitevisits':
        return (
          <SiteVisitsList
            siteVisits={siteVisits}
            onOpenCreate={() => {
              setEditingVisit(null);
              setVisitDefaultLead(null);
              setVisitDefaultProp(null);
              setVisitModalOpen(true);
            }}
            onEditVisit={(v) => {
              setEditingVisit(v);
              setVisitModalOpen(true);
            }}
            onDeleteVisit={handleDeleteVisit}
            onUpdateStatus={handleUpdateVisitStatus}
          />
        );
      case 'deals':
        return (
          <DealsPipeline
            deals={deals}
            onOpenCreate={() => {
              setEditingDeal(null);
              setDealDefaultClient(null);
              setDealDefaultLead(null);
              setDealModalOpen(true);
            }}
            onEditDeal={(d) => {
              setEditingDeal(d);
              setDealModalOpen(true);
            }}
            onDeleteDeal={handleDeleteDeal}
            onUpdateStage={handleUpdateDealStage}
          />
        );
      case 'activities':
        return <ActivitiesList activities={activities} />;
      case 'team':
        return (
          <TeamList
            members={members}
            onOpenInvite={() => setInviteModalOpen(true)}
            onUpdateRole={handleUpdateRole}
            onToggleStatus={handleToggleStatus}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={(p) => setCurrentPage(p)} onOpenNewLead={() => setLeadModalOpen(true)} />;
    }
  };

  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={(page) => {
        setSelectedLeadId(null);
        setSelectedPropertyId(null);
        setCurrentPage(page);
      }}
      onOpenNewLead={() => {
        setEditingLead(null);
        setLeadModalOpen(true);
      }}
    >
      {hasPermissionWarning && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50/95 border border-amber-200/90 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">Firestore Security Rules Action</p>
              <p className="text-xs text-amber-800/90 mt-0.5 max-w-2xl">
                Publish the provided rules in Firebase Console to enable unrestricted real-time synchronization for your leads, properties, and deals.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={handleCopyRules}
              className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100/70 rounded-lg text-xs font-semibold text-amber-900 flex items-center justify-center gap-1.5 transition-colors flex-1 md:flex-none cursor-pointer shadow-2xs"
            >
              {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-700" />}
              {copiedRules ? 'Copied Rules!' : 'Copy Rules'}
            </button>
            <a
              href="https://console.firebase.google.com/project/chatpulse-crm/firestore/rules"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors flex-1 md:flex-none shadow-2xs"
            >
              <span>Console Rules</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setHasPermissionWarning(false)}
              className="p-1.5 text-amber-700/60 hover:text-amber-900 hover:bg-amber-100 rounded-lg transition text-xs font-bold"
              title="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      {renderPage()}

      {/* --- ALL MODALS --- */}
      <LeadFormModal
        isOpen={leadModalOpen}
        onClose={() => {
          setLeadModalOpen(false);
          setEditingLead(null);
        }}
        onSubmit={handleLeadSubmit}
        initialData={editingLead}
        agentName={agentName}
        agentId={agentId}
      />

      <PropertyFormModal
        isOpen={propModalOpen}
        onClose={() => {
          setPropModalOpen(false);
          setEditingProp(null);
        }}
        onSubmit={handlePropSubmit}
        initialData={editingProp}
        agentName={agentName}
        agentId={agentId}
        orgId={orgId}
      />

      <ClientFormModal
        isOpen={clientModalOpen}
        onClose={() => {
          setClientModalOpen(false);
          setEditingClient(null);
        }}
        onSubmit={handleClientSubmit}
        initialData={editingClient}
        agentName={agentName}
        agentId={agentId}
      />

      <FollowUpFormModal
        isOpen={followUpModalOpen}
        onClose={() => {
          setFollowUpModalOpen(false);
          setEditingFollowUp(null);
          setFollowUpDefaultRelated(undefined);
        }}
        onSubmit={handleFollowUpSubmit}
        initialData={editingFollowUp}
        agentName={agentName}
        agentId={agentId}
        defaultRelated={followUpDefaultRelated}
      />

      <TaskFormModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
          setTaskDefaultRelated(undefined);
        }}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        agentName={agentName}
        agentId={agentId}
        defaultRelated={taskDefaultRelated}
      />

      <SiteVisitFormModal
        isOpen={visitModalOpen}
        onClose={() => {
          setVisitModalOpen(false);
          setEditingVisit(null);
          setVisitDefaultProp(null);
          setVisitDefaultLead(null);
        }}
        onSubmit={handleVisitSubmit}
        initialData={editingVisit}
        agentName={agentName}
        agentId={agentId}
        properties={properties}
        leads={leads}
        defaultProperty={visitDefaultProp}
        defaultLead={visitDefaultLead}
      />

      <DealFormModal
        isOpen={dealModalOpen}
        onClose={() => {
          setDealModalOpen(false);
          setEditingDeal(null);
          setDealDefaultClient(null);
          setDealDefaultLead(null);
        }}
        onSubmit={handleDealSubmit}
        initialData={editingDeal}
        agentName={agentName}
        agentId={agentId}
        properties={properties}
        leads={leads}
        clients={clients}
        defaultClient={dealDefaultClient}
        defaultLead={dealDefaultLead}
      />

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={handleInviteMember}
      />
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </AuthProvider>
  );
}
