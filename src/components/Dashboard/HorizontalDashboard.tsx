import React, { useState } from 'react';
import './Dashboard.css';

// Import Font Awesome icons (you'll need to install @fortawesome/react-fontawesome)
// For now, I'll use Lucide icons as placeholders
import { 
  Zap, 
  Keyboard, 
  Rocket, 
  Circle, 
  PlusCircle 
} from 'lucide-react';

interface DashboardPage {
  id: string;
  icon: React.ReactNode;
  title: string;
  hint?: string | React.ReactNode;
}

const HorizontalDashboard: React.FC = () => {
  const [activePage, setActivePage] = useState(0);

  const pages: DashboardPage[] = [
    {
      id: 'projects',
      icon: <Zap size={80} />,
      title: 'Projects',
      hint: (
        <>
          Create and manage your AI film projects...<br />
          Start building your next masterpiece here.
        </>
      )
    },
    {
      id: 'editor',
      icon: <Keyboard size={80} />,
      title: 'Editor',
      hint: 'Access the video editing workspace'
    },
    {
      id: 'library',
      icon: <Rocket size={80} />,
      title: 'Library',
      hint: 'Browse your media assets and templates'
    },
    {
      id: 'community',
      icon: <Circle size={80} />,
      title: 'Community',
      hint: (
        <>
          Connect with other creators<br />
          <a href="#community" style={{ color: 'yellow' }}>
            Share your work and get inspired
          </a>
        </>
      )
    },
    {
      id: 'settings',
      icon: <PlusCircle size={80} />,
      title: 'More',
      hint: (
        <>
          <span>Settings, preferences & more features</span><br />
          <a href="#settings" style={{ color: 'yellow' }}>
            Customize your FilmStudio experience
          </a>
        </>
      )
    }
  ];

  const handlePageChange = (pageIndex: number) => {
    setActivePage(pageIndex);
  };

  return (
    <div className="dashboard-container">
      {/* Navigation Menu */}
      <ul className={`dashboard-nav ${activePage > 0 ? 'scaled' : ''}`}>
        {pages.map((page, index) => (
          <li 
            key={page.id}
            className={`dashboard-nav-item ${index === activePage ? 'active-nav' : ''}`}
            onClick={() => handlePageChange(index)}
          >
            {React.cloneElement(page.icon as React.ReactElement, { size: 32 })}
          </li>
        ))}
      </ul>

      {/* Pages */}
      {pages.map((page, index) => (
        <div
          key={page.id}
          className={`
            dashboard-page
            ${index === activePage ? 'active slide-in' : 'inactive'}
            ${activePage > 0 && index === 0 ? 'blur-background' : ''}
          `}
        >
          <section 
            className={`
              page-icon 
              ${index === 0 ? 'first-page' : ''}
              ${index === activePage ? 'active-page' : ''}
            `}
          >
            {page.icon}
            <span className="page-title">{page.title}</span>
            {page.hint && (
              <span className="page-hint">{page.hint}</span>
            )}
          </section>
        </div>
      ))}
    </div>
  );
};

export default HorizontalDashboard;
