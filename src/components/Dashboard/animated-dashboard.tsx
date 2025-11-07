"use client"

import type React from "react"

import { useState } from "react"
import { Film, Users, FileText, Video, Clapperboard } from "lucide-react"
import "./animated-dashboard.css"

interface DashboardPage {
  id: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  content?: React.ReactNode
  bgColor: string
}

const dashboardPages: DashboardPage[] = [
  {
    id: "projects",
    icon: Film,
    title: "Projects",
    content: (
      <div className="hint">
        <span>Showcase your created movies</span>
        <br />
        <span className="text-yellow-400">or start a new cinematic project</span>
      </div>
    ),
    bgColor: "bg-slate-700",
  },
  {
    id: "stories",
    icon: Users,
    title: "Stories",
    content: (
      <div className="hint">
        <span>Develop chapters and characters</span>
        <br />
        <span className="text-blue-400">for your different narratives</span>
      </div>
    ),
    bgColor: "bg-blue-600",
  },
  {
    id: "scripts",
    icon: FileText,
    title: "Scripts",
    content: (
      <div className="hint">
        <span>Write scripts and prompts</span>
        <br />
        <span className="text-green-400">for each chapter and story</span>
      </div>
    ),
    bgColor: "bg-green-600",
  },
  {
    id: "media",
    icon: Video,
    title: "Media",
    content: (
      <div className="hint">
        <span>View generated images and videos</span>
        <br />
        <span className="text-purple-400">Edit and refine your content</span>
      </div>
    ),
    bgColor: "bg-purple-600",
  },
  {
    id: "studio",
    icon: Clapperboard,
    title: "Studio",
    content: (
      <div className="hint">
        <span>Advanced editing tools</span>
        <br />
        <span className="text-red-400">and production features</span>
      </div>
    ),
    bgColor: "bg-red-600",
  },
]

export default function AnimatedDashboard() {
  const [activePage, setActivePage] = useState(0)

  return (
    <div className="dashboard-container">
      {/* Navigation Menu */}
      <ul className="dashboard-menu">
        {dashboardPages.map((page, index) => {
          const IconComponent = page.icon
          return (
            <li key={page.id}>
              <button
                onClick={() => setActivePage(index)}
                className={`dashboard-menu-icon ${activePage === index ? "active" : ""}`}
                aria-label={`Navigate to ${page.title}`}
              >
                <IconComponent className="w-8 h-8" />
              </button>
            </li>
          )
        })}
      </ul>

      {/* Pages */}
      {dashboardPages.map((page, index) => {
        const IconComponent = page.icon
        return (
          <div
            key={page.id}
            className={`dashboard-page ${page.bgColor} ${
              index === 0 ? "page-home" : "page-secondary"
            } ${activePage === index ? "page-active" : ""}`}
          >
            <section className="dashboard-content">
              <IconComponent className="dashboard-page-icon" />
              <span className="dashboard-title">{page.title}</span>
              {page.content}
            </section>
          </div>
        )
      })}
    </div>
  )
}
