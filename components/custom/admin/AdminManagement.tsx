"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui";
import TagsManagement from "./TagsManagement";
import StatusesManagement from "./StatusesManagement";
import PrioritiesManagement from "./PrioritiesManagement";

interface AdminManagementProps {
  isAdmin: boolean;
}

type PanelType = "tags" | "statuses" | "priorities";

interface PanelState {
  isOpen: boolean;
  isAnimating: boolean;
}

export default function AdminManagement({ isAdmin }: AdminManagementProps) {
  const [panels, setPanels] = useState<Record<PanelType, PanelState>>({
    tags: { isOpen: false, isAnimating: false },
    statuses: { isOpen: false, isAnimating: false },
    priorities: { isOpen: false, isAnimating: false },
  });

  const panelRefs = useRef<Record<PanelType, HTMLDivElement | null>>({
    tags: null,
    statuses: null,
    priorities: null,
  });

  const togglePanel = (panelType: PanelType) => {
    setPanels(prev => ({
      ...prev,
      [panelType]: {
        ...prev[panelType],
        isAnimating: true,
      },
    }));

    // Small delay to ensure the animation state is set
    setTimeout(() => {
      setPanels(prev => ({
        ...prev,
        [panelType]: {
          isOpen: !prev[panelType].isOpen,
          isAnimating: false,
        },
      }));

      // Focus the panel when it opens
      if (!panels[panelType].isOpen) {
        setTimeout(() => {
          const panelElement = panelRefs.current[panelType];
          if (panelElement) {
            const firstFocusableElement = panelElement.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement;
            if (firstFocusableElement) {
              firstFocusableElement.focus();
            }
          }
        }, 600); // Wait for animation to complete
      }
    }, 50);
  };

  const expandAll = () => {
    setPanels(prev => ({
      tags: { ...prev.tags, isAnimating: true },
      statuses: { ...prev.statuses, isAnimating: true },
      priorities: { ...prev.priorities, isAnimating: true },
    }));

    setTimeout(() => {
      setPanels(prev => ({
        tags: { isOpen: true, isAnimating: false },
        statuses: { isOpen: true, isAnimating: false },
        priorities: { isOpen: true, isAnimating: false },
      }));
    }, 50);
  };

  const collapseAll = () => {
    setPanels(prev => ({
      tags: { ...prev.tags, isAnimating: true },
      statuses: { ...prev.statuses, isAnimating: true },
      priorities: { ...prev.priorities, isAnimating: true },
    }));

    setTimeout(() => {
      setPanels(prev => ({
        tags: { isOpen: false, isAnimating: false },
        statuses: { isOpen: false, isAnimating: false },
        priorities: { isOpen: false, isAnimating: false },
      }));
    }, 50);
  };

  const getOpenPanelsCount = () => {
    return Object.values(panels).filter(panel => panel.isOpen).length;
  };

  const openPanelsCount = getOpenPanelsCount();

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      // Close all panels when Escape is pressed
      collapseAll();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Admin Management</h2>
        
        {/* Control Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={expandAll}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Expand All
          </Button>
          <Button
            onClick={collapseAll}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Panel Toggle Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => togglePanel("tags")}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              togglePanel("tags");
            }
          }}
          className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            panels.tags.isOpen
              ? "bg-blue-600 text-white shadow-lg transform scale-105"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
          }`}
          aria-expanded={panels.tags.isOpen}
          aria-controls="tags-panel"
        >
          Manage Tags
          {panels.tags.isOpen && (
            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </Button>

        <Button
          onClick={() => togglePanel("statuses")}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              togglePanel("statuses");
            }
          }}
          className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            panels.statuses.isOpen
              ? "bg-blue-600 text-white shadow-lg transform scale-105"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
          }`}
          aria-expanded={panels.statuses.isOpen}
          aria-controls="statuses-panel"
        >
          Manage Statuses
          {panels.statuses.isOpen && (
            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </Button>

        <Button
          onClick={() => togglePanel("priorities")}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              togglePanel("priorities");
            }
          }}
          className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
            panels.priorities.isOpen
              ? "bg-blue-600 text-white shadow-lg transform scale-105"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
          }`}
          aria-expanded={panels.priorities.isOpen}
          aria-controls="priorities-panel"
        >
          Manage Priorities
          {panels.priorities.isOpen && (
            <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </Button>
      </div>

      {/* Panels Container */}
      {openPanelsCount > 0 && (
        <div className="flex flex-wrap gap-6 pb-4">
          {/* Tags Panel */}
          <div
            id="tags-panel"
            ref={(el) => {
              panelRefs.current.tags = el;
            }}
            className={`transform transition-all duration-500 ease-out flex-shrink-0 ${
              panels.tags.isOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4 pointer-events-none"
            } ${
              panels.tags.isAnimating ? "transition-all duration-500 ease-out" : ""
            }`}
            style={{
              animationDelay: panels.tags.isOpen ? '0ms' : '0ms',
              minWidth: panels.tags.isOpen ? '400px' : '0px',
              flexBasis: panels.tags.isOpen ? '400px' : '0px',
            }}
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] w-full">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Tags Management</h3>
                <Button
                  onClick={() => togglePanel("tags")}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                  aria-label="Close Tags Management"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              <div className="p-6">
                <TagsManagement isAdmin={isAdmin} />
              </div>
            </div>
          </div>

          {/* Statuses Panel */}
          <div
            id="statuses-panel"
            ref={(el) => {
              panelRefs.current.statuses = el;
            }}
            className={`transform transition-all duration-500 ease-out flex-shrink-0 ${
              panels.statuses.isOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4 pointer-events-none"
            } ${
              panels.statuses.isAnimating ? "transition-all duration-500 ease-out" : ""
            }`}
            style={{
              animationDelay: panels.statuses.isOpen ? '100ms' : '0ms',
              minWidth: panels.statuses.isOpen ? '400px' : '0px',
              flexBasis: panels.statuses.isOpen ? '400px' : '0px',
            }}
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] w-full">
              <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Statuses Management</h3>
                <Button
                  onClick={() => togglePanel("statuses")}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                  aria-label="Close Statuses Management"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              <div className="p-6">
                <StatusesManagement isAdmin={isAdmin} />
              </div>
            </div>
          </div>

          {/* Priorities Panel */}
          <div
            id="priorities-panel"
            ref={(el) => {
              panelRefs.current.priorities = el;
            }}
            className={`transform transition-all duration-500 ease-out flex-shrink-0 ${
              panels.priorities.isOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 translate-y-4 pointer-events-none"
            } ${
              panels.priorities.isAnimating ? "transition-all duration-500 ease-out" : ""
            }`}
            style={{
              animationDelay: panels.priorities.isOpen ? '200ms' : '0ms',
              minWidth: panels.priorities.isOpen ? '400px' : '0px',
              flexBasis: panels.priorities.isOpen ? '400px' : '0px',
            }}
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] w-full">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Priorities Management</h3>
                <Button
                  onClick={() => togglePanel("priorities")}
                  className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                  aria-label="Close Priorities Management"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
              <div className="p-6">
                <PrioritiesManagement isAdmin={isAdmin} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {openPanelsCount === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No panels open</h3>
          <p className="mt-1 text-sm text-gray-500">Click on a management button above to get started.</p>
        </div>
      )}
    </div>
  );
} 