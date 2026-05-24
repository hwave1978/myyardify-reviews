function Feed({ feed }) {
  const recentFeed = feed.slice(0, 3);

  return (
    <div className="feed-section">
      <h2>Following Feed</h2>

      {recentFeed.length === 0 ? (
        <p>Follow contractors to see recent homeowner reviews.</p>
      ) : (
        recentFeed.map((item) => (
          <div className="feed-item" key={item.reviewId}>
            <strong>{item.contractorName}</strong>
            <p>
              {item.homeownerName} - {item.comment}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default Feed;