"use client"

import { Tag } from "@/lib/types"

interface TagChipProps {
  tag: Tag
  isSelected?: boolean
  onClick?: () => void
  size?: "sm" | "md" | "lg"
  className?: string
}

export default function TagChip({ 
  tag, 
  isSelected = false, 
  onClick, 
  size = "md",
  className = "" 
}: TagChipProps) {
  // Helper function to determine text color based on background color
  const getTextColor = (backgroundColor: string) => {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    
    // Return white for dark backgrounds, dark gray for light backgrounds
    return luminance > 0.5 ? '#374151' : '#ffffff'
  }

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  }

  const baseClasses = `
    inline-flex items-center gap-2 rounded-full font-medium
    transition-all duration-200 ease-in-out
    shadow-sm border border-transparent
    ${sizeClasses[size]}
    ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''}
    ${className}
  `

  const selectedClasses = isSelected 
    ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg' 
    : ''

  const textColor = tag.color ? getTextColor(tag.color) : '#374151'
  const backgroundColor = tag.color || '#f3f4f6'

  return (
    <div
      className={`${baseClasses} ${selectedClasses}`}
      style={{
        backgroundColor,
        color: textColor,
        borderColor: isSelected ? '#3b82f6' : 'transparent'
      }}
      onClick={onClick}
    >
      {/* Color swatch */}
      <div 
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ 
          backgroundColor: tag.color || '#9ca3af',
          border: `1px solid ${textColor === '#ffffff' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}`
        }}
      />
      <span className="truncate">{tag.name}</span>
      {isSelected && (
        <svg 
          className="w-3 h-3 flex-shrink-0 ml-1" 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
            clipRule="evenodd" 
          />
        </svg>
      )}
    </div>
  )
} 