import React from "react"
import PropTypes from "prop-types"

/**
 * SummaryCard - reusable frosted-glass card with glowing accent
 * Tailwind classes are used; the layout will still render without Tailwind.
 */
const SummaryCard = ({ title, accent = "indigo", icon: Icon, children, className = "" }) => {
  const accentRing = {
    indigo: "ring-indigo-400/40",
    teal: "ring-teal-300/35",
    amber: "ring-amber-300/35",
    pink: "ring-pink-300/35"
  }[accent] || "ring-indigo-400/40"

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border bg-white/6 backdrop-blur-md
        border-white/10 shadow-lg transition-transform transform hover:-translate-y-1
        ${accentRing} ${className}
      `}
      style={{ boxShadow: "0 8px 30px rgba(2,6,23,0.35)" }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="flex-none p-2 rounded-md bg-white/8 text-white">
              <Icon size={20} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white/90 truncate">{title}</h3>
            <div className="mt-2 text-sm text-white/70">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

SummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  accent: PropTypes.oneOf(["indigo","teal","amber","pink"]),
  icon: PropTypes.elementType,
  children: PropTypes.node,
  className: PropTypes.string
}

export default SummaryCard