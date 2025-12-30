import React, { useState } from 'react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import RegistrationForm from './components/RegistrationForm';
import EventDetails from './components/EventDetails';
import ParticipantLogin from './components/ParticipantLogin';
import ParticipantDashboard from './components/ParticipantDashboard';
import OrganizerLogin from './components/OrganizerLogin';
import OrganizerDashboard from './components/OrganizerDashboard';
import { ToastProvider } from './components/Toast';
import { HikeEvent, User, Organizer } from './types';

const App: React.FC = () => {
  // Using simple state-based routing
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedEvent, setSelectedEvent] = useState<HikeEvent | undefined>(undefined);
  
  // Participant Session State
  const [participantRecords, setParticipantRecords] = useState<User[]>([]);

  // Organizer Session State
  const [currentOrganizer, setCurrentOrganizer] = useState<Organizer | null>(null);

  const handleRegisterClick = (event?: HikeEvent) => {
    setSelectedEvent(event);
    setCurrentPage('register');
  };

  const handleViewDetails = (event: HikeEvent) => {
    setSelectedEvent(event);
    setCurrentPage('event-details');
  };

  const handleNavigate = (page: string) => {
    // If navigating to login but we are already logged in, go to dashboard
    if (page === 'login' && participantRecords.length > 0) {
      setCurrentPage('participant-dashboard');
      return;
    }

    if (page === 'organizer-login' && currentOrganizer) {
      setCurrentPage('organizer-dashboard');
      return;
    }

    if (page !== 'register' && page !== 'event-details') {
      setSelectedEvent(undefined); // Reset if navigating away
    }
    setCurrentPage(page);
  };

  const handleLoginSuccess = (records: User[]) => {
    setParticipantRecords(records);
    setCurrentPage('participant-dashboard');
  };

  const handleOrganizerLoginSuccess = (organizer: Organizer) => {
    setCurrentOrganizer(organizer);
    setCurrentPage('organizer-dashboard');
  };

  const handleLogout = () => {
    setParticipantRecords([]);
    setCurrentOrganizer(null);
    setCurrentPage('landing');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onRegisterClick={handleRegisterClick} onViewDetails={handleViewDetails} />;
      case 'event-details':
        return selectedEvent ? (
          <EventDetails 
            event={selectedEvent} 
            onRegister={() => handleRegisterClick(selectedEvent)}
            onBack={() => setCurrentPage('landing')}
          />
        ) : (
          <LandingPage onRegisterClick={handleRegisterClick} onViewDetails={handleViewDetails} />
        );
      case 'register':
        return <RegistrationForm selectedEvent={selectedEvent} />;
      case 'login':
        return <ParticipantLogin onLoginSuccess={handleLoginSuccess} />;
      case 'participant-dashboard':
        return participantRecords.length > 0 ? (
          <ParticipantDashboard records={participantRecords} onLogout={handleLogout} />
        ) : (
          <ParticipantLogin onLoginSuccess={handleLoginSuccess} />
        );
      case 'organizer-login':
        return <OrganizerLogin onLoginSuccess={handleOrganizerLoginSuccess} />;
      case 'organizer-dashboard':
        return currentOrganizer ? (
          <OrganizerDashboard organizer={currentOrganizer} onLogout={handleLogout} />
        ) : (
          <OrganizerLogin onLoginSuccess={handleOrganizerLoginSuccess} />
        );
      default:
        return <LandingPage onRegisterClick={handleRegisterClick} onViewDetails={handleViewDetails} />;
    }
  };

  return (
    <ToastProvider>
      <Layout currentPage={currentPage} onNavigate={handleNavigate}>
        {renderPage()}
      </Layout>
    </ToastProvider>
  );
};

export default App;