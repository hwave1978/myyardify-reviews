function Feed({ feed }) {
  return (
    <div className="feed-section">
      <h2>Following Feed</h2>

      {feed.length === 0 && (
        <p className="empty-feed">
          Follow contractors to see recent homeowner reviews.
        </p>
      )}

      {feed.map((item) => (
        <div className="feed-card" key={item.reviewId}>
          <h3>{item.contractorName}</h3>

          <p>{item.services}</p>

          <p>{item.area}</p>

          <p>{"★".repeat(item.stars)}</p>

          <p>{item.price}</p>

          <p>
            {item.homeownerName} - {item.comment}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Feed;