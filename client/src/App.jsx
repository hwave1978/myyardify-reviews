import { useEffect, useState } from "react";
import Header from "./Header";
import ContractorCard from "./ContractorCard";
import Login from "./Login";
import Feed from "./Feed";
import "./index.css";

function App() {
  const [contractors, setContractors] = useState([]);
  const [feed, setFeed] = useState([]);
  const [reviewForms, setReviewForms] = useState({});
  const [editingReviews, setEditingReviews] = useState({});
  const [homeowner, setHomeowner] = useState(null);

  

  const fetchContractors = async () => {
    const response = await fetch("http://localhost:3001/contractors");
    const data = await response.json();

    setContractors(data);

    const forms = {};

    data.forEach((contractor) => {
      forms[contractor.id] = {
        stars: "5",
        price: "$$",
        comment: ""
      };
    });

    setReviewForms(forms);
  };

  const fetchFeed = async () => {
  const response = await fetch("http://localhost:3001/feed");

  if (!response.ok) {
    setFeed([]);
    return;
  }

  const data = await response.json();
  setFeed(data);
};

  const checkHomeowner = async () => {
    const response = await fetch("http://localhost:3001/homeowner");
    const data = await response.json();

    setHomeowner(data);

    if (data) {
      setTimeout(() => {
        fetchFeed();
      }, 200);
    }
  };

  useEffect(() => {
  fetchContractors();
  checkHomeowner();
  fetchFeed();
  }, []);

  const handleRegister = async (name, email, password) => {
    const response = await fetch("http://localhost:3001/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, password })
    });

    if (!response.ok) {
      alert("Registration failed");
      return;
    }

    const data = await response.json();

    setHomeowner(data);
    fetchContractors();

    setTimeout(() => {
      fetchFeed();
    }, 200);
  };

  const handleLogin = async (email, password) => {
    const response = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      alert("Invalid login");
      return;
    }

    const data = await response.json();

    setHomeowner(data);
    fetchContractors();

    setTimeout(() => {
      fetchFeed();
    }, 200);
  };

  const handleLogout = async () => {
    await fetch("http://localhost:3001/logout", {
      method: "POST"
    });

    setHomeowner(null);
    setFeed([]);

    fetchContractors();
  };

  const handleLike = async (contractorId) => {
    const response = await fetch(
      `http://localhost:3001/contractors/${contractorId}/like`,
      {
        method: "POST"
      }
    );

    if (!response.ok) {
      return;
    }

    fetchContractors();
  };

  const handleFollow = async (contractorId) => {
    await fetch(`http://localhost:3001/contractors/${contractorId}/follow`, {
      method: "POST"
    });

    fetchContractors();

    setTimeout(() => {
      fetchFeed();
    }, 200);
  };

  const handleUnfollow = async (contractorId) => {
    await fetch(`http://localhost:3001/contractors/${contractorId}/unfollow`, {
      method: "POST"
    });

    fetchContractors();

    setTimeout(() => {
      fetchFeed();
    }, 200);
  };

  const handleFormChange = (contractorId, e) => {
    const { name, value } = e.target;

    setReviewForms((prev) => ({
      ...prev,
      [contractorId]: {
        ...prev[contractorId],
        [name]: value
      }
    }));
  };

  const handleSubmitReview = async (contractorId) => {
    if (!homeowner) {
      alert("Please log in first.");
      return;
    }

    const form = reviewForms[contractorId];

    const reviewData = {
      stars: Number(form.stars),
      price: form.price,
      comment: form.comment
    };

    const editingReviewId = editingReviews[contractorId];

    if (editingReviewId) {
      await fetch(
        `http://localhost:3001/contractors/${contractorId}/review/${editingReviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(reviewData)
        }
      );
    } else {
      await fetch(`http://localhost:3001/contractors/${contractorId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reviewData)
      });
    }

    setEditingReviews((prev) => ({
      ...prev,
      [contractorId]: null
    }));

    setReviewForms((prev) => ({
      ...prev,
      [contractorId]: {
        stars: "5",
        price: "$$",
        comment: ""
      }
    }));

    fetchContractors();

    setTimeout(() => {
      fetchFeed();
    }, 200);
  };

  const handleEditReview = (contractorId, review) => {
    setEditingReviews((prev) => ({
      ...prev,
      [contractorId]: review.id
    }));

    setReviewForms((prev) => ({
      ...prev,
      [contractorId]: {
        stars: String(review.stars),
        price: review.price,
        comment: review.comment
      }
    }));
  };

  return (
    <div>
      <Header />

      <Login
        homeowner={homeowner}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
      />

      <Feed feed={feed} />

      <div className="contractor-grid">
        {contractors.map((contractor) => {
          const activeReview =
            contractor.reviews.length > 0 ? contractor.reviews[0] : null;

          return (
            <ContractorCard
              key={contractor.id}
              contractor={contractor}
              activeReview={activeReview}
              reviewForm={reviewForms[contractor.id] || {}}
              editingReviewId={editingReviews[contractor.id]}
              homeowner={homeowner}
              onLike={handleLike}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              onFormChange={handleFormChange}
              onSubmitReview={handleSubmitReview}
              onEditReview={handleEditReview}
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;