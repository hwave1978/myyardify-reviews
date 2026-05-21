function ContractorCard({
  contractor,
  activeReview,
  reviewForm,
  editingReviewId,
  homeowner,
  onLike,
  onFormChange,
  onSubmitReview,
  onEditReview
}) {
  const handleShare = async () => {
    let text = `Check out ${contractor.name} on MyYardify Reviews. Services: ${contractor.services}. Area: ${contractor.area}.`;

    if (activeReview) {
      text += ` Homeowner review from ${activeReview.name}: "${activeReview.comment}" Rating: ${activeReview.stars} stars. Price: ${activeReview.price}.`;
    }

    if (navigator.share) {
      await navigator.share({
        title: "MyYardify Reviews",
        text: text
      });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Review information copied.");
    }
  };

  return (
    <div className="contractor-card">
      <h2>{contractor.name}</h2>

      <p className="contractor-info">{contractor.services}</p>
      <p className="contractor-info">{contractor.area}</p>

      <button className="like-button" onClick={() => onLike(contractor.id)}>
        Like {contractor.likes}
      </button>

      <button className="share-button" onClick={handleShare}>
        Share
      </button>

      <div className="rating-display">
        <p>
          Stars:{" "}
          {activeReview ? "★".repeat(activeReview.stars) : "No rating yet"}
        </p>

        <p>
          Price: {activeReview ? activeReview.price : "No price rating yet"}
        </p>
      </div>

      <div className="fade-comment">
        {activeReview ? (
          <p>
            {activeReview.name} - {activeReview.comment}
          </p>
        ) : (
          <p>No homeowner reviews yet.</p>
        )}
      </div>

      {!homeowner && (
        <p className="login-notice">
          Log in as a homeowner to leave a review.
        </p>
      )}

      {homeowner && (
        <div className="review-form">
          <h3>Homeowner Review</h3>

          <select
            name="stars"
            value={reviewForm.stars}
            onChange={(e) => onFormChange(contractor.id, e)}
          >
            <option value="5">5 stars</option>
            <option value="4">4 stars</option>
            <option value="3">3 stars</option>
            <option value="2">2 stars</option>
            <option value="1">1 star</option>
          </select>

          <select
            name="price"
            value={reviewForm.price}
            onChange={(e) => onFormChange(contractor.id, e)}
          >
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
          </select>

          <textarea
            name="comment"
            placeholder="Write your review"
            value={reviewForm.comment}
            onChange={(e) => onFormChange(contractor.id, e)}
          />

          <button onClick={() => onSubmitReview(contractor.id)}>
            {editingReviewId ? "Save Review" : "Post Review"}
          </button>

          {activeReview && activeReview.homeownerId === homeowner.id && (
            <button
              className="edit-button"
              onClick={() => onEditReview(contractor.id, activeReview)}
            >
              Edit Review
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ContractorCard;