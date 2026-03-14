import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./Leaderboard.css";

// Helper to determine badge colors based on rank parsing
function getRankStyle(rankName) {
  const r = (rankName || "").toLowerCase();
  if (r === "mastery") return { color: "#fbbf24", glow: "rgba(251, 191, 36, 0.2)" }; // amber
  if (r === "consistent" || r === "focused") return { color: "#60a5fa", glow: "rgba(96, 165, 250, 0.2)" }; // blue
  if (r === "resilient" || r === "disciplined") return { color: "#a78bfa", glow: "rgba(167, 139, 250, 0.2)" }; // purple
  
  // default (seedling, sprout, routine...) uses the app's emerald accent
  return { color: "var(--accent)", glow: "var(--accent-glow)" };
}

export default function Leaderboard({ leaderboardData, currentUserXp, currentUserId, loading }) {
  const listRef = useRef(null);

  // Animate the list items stumbling in when data finishes loading
  useEffect(() => {
    if (!loading && leaderboardData && leaderboardData.length > 0 && listRef.current) {
      const items = listRef.current.querySelectorAll(".leaderboard-item");
      gsap.fromTo(
        items,
        { opacity: 0, x: -10 },
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          stagger: 0.05,
          ease: "power2.out",
          clearProps: "all"
        }
      );
    }
  }, [loading, leaderboardData]);

  const hasData = leaderboardData && leaderboardData.length > 0;

  return (
    <div className="leaderboard-section">
      <div className="leaderboard-card-header">
        <span className="leaderboard-card-title">Leaderboard</span>
        {currentUserXp && (
          <div className="leaderboard-user-xp">
            <span className="user-xp-label">Your Rank:</span>
            <span className="user-xp-value" style={{ color: getRankStyle(currentUserXp.rank).color }}>
              {currentUserXp.rank}
            </span>
            <span className="user-xp-divider">•</span>
            <span className="user-xp-total">{currentUserXp.xp_total} XP</span>
          </div>
        )}
      </div>

      <div className="leaderboard-content">
        {loading ? (
          <div className="leaderboard-message">
             <div className="leaderboard-spinner"></div>
             Loading ranks...
          </div>
        ) : !hasData ? (
          <div className="leaderboard-message empty">
            No leaderboard data available yet.
          </div>
        ) : (
          <div className="leaderboard-list" ref={listRef}>
            {leaderboardData.map((user, index) => {
              const isCurrentUser = user.user_id === currentUserId;
              const rankStyle = getRankStyle(user.rank);
              
              return (
                <div 
                  key={user.user_id} 
                  className={`leaderboard-item ${isCurrentUser ? "is-current-user" : ""}`}
                >
                  <div className="lb-rank-num">
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                  </div>
                  
                  <div className="lb-user-info">
                    <div className="lb-user-name">
                      {user.display_name || "Unknown User"}
                      {isCurrentUser && <span className="lb-you-badge">YOU</span>}
                    </div>
                    <div 
                      className="lb-tier-badge" 
                      style={{ 
                        color: rankStyle.color, 
                        backgroundColor: rankStyle.glow,
                        border: `1px solid ${rankStyle.color}40`
                      }}
                    >
                      {user.rank}
                    </div>
                  </div>
                  
                  <div className="lb-xp-total">
                    {user.xp_total} <span className="lb-xp-label">XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
