import ContractorCard from "./ContractorCard";

function Feed({
  contractors,
  likeContractor,
  followContractor,
  newComment,
  setNewComment,
}) {
  return (
    <main>
      <h2>Community Feed</h2>

      <p>
        Homeowners can follow contractors,
        like reviews, and leave comments.
      </p>

      {contractors.map((contractor, index) => (
        <ContractorCard
          key={contractor.name}
          contractor={contractor}
          index={index}
          likeContractor={likeContractor}
          followContractor={followContractor}
          newComment={newComment}
          setNewComment={setNewComment}
        />
      ))}
    </main>
  );
}

export default Feed;