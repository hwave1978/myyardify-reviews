import { useEffect, useState } from "react";

function Feed({ feed }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (feed.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % feed.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [feed]);

  const activeFeed = feed[activeIndex];

  return (
    <div className="feed-section">
      <h2>Following Feed</h2>

      {!activeFeed ? (
        <p>Follow contractors to see recent homeowner reviews.</p>
      ) : (
        <div className="feed-fade-message" key={activeFeed.reviewId}>
          <strong>{activeFeed.contractorName}</strong>
          <p>
            {activeFeed.homeownerName} - {activeFeed.comment}
          </p>
        </div>
      )}
    </div>
  );
}

export default Feed;