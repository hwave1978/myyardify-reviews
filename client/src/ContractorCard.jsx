function ContractorCard({
  contractor,
  activeReview,
  reviewForm,
  editingReviewId,
  homeowner,
  onLike,
  onFollow,
  onUnfollow,
  onFormChange,
  onSubmitReview,
  onEditReview,
}) {
  const handleShare = async () => {
    let text = `Check out ${contractor.name} on MyYardify Reviews. Services: ${contractor.services}. Area: ${contractor.area}.`;

    if (activeReview) {
      text += ` Homeowner review from ${activeReview.name}: "${activeReview.comment}" Rating: ${activeReview.stars} stars. Price: ${activeReview.price}.`;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: contractor.name,
          text,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Contractor info copied.");
      } catch {
        alert("Sharing not supported.");
      }
    }
  };

  return (
    <div className="contractor-card">
      <h2>{contractor.name}</h2>

      <p className="contractor-info">{contractor.services}</p>
      <p className="contractor-info">{contractor.area}</p>

      <button
        className="like-button"
        onClick={() => onLike(contractor.id)}
        disabled={contractor.isLiked}
      >
        {contractor.isLiked
          ? `Liked ${contractor.likes}`
          : `Like ${contractor.likes}`}
      </button>

      {homeowner && !contractor.isFollowing && (
        <button
          className="follow-button"
          onClick={() => onFollow(contractor.id)}
        >
          Follow
        </button>
      )}

      {homeowner && contractor.isFollowing && (
        <button
          className="follow-button"
          onClick={() => onUnfollow(contractor.id)}
        >
          Unfollow
        </button>
      )}

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

      {!homeowner && (
        <p className="login-notice">
          Log in as a homeowner to leave a review or follow contractors.
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
