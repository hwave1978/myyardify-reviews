import { useEffect, useState } from "react";
import Header from "./Header";
import ContractorCard from "./ContractorCard";
import Login from "./Login";
import "./index.css";

function App() {
  const [contractors, setContractors] = useState([]);
  const [reviewForms, setReviewForms] = useState({});
  const [editingReviews, setEditingReviews] = useState({});
  const [activeIndexes, setActiveIndexes] = useState({});
  const [homeowner, setHomeowner] = useState(null);

  useEffect(() => {
    fetchContractors();
    checkHomeowner();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndexes((prev) => {
        const updated = {};

        contractors.forEach((contractor) => {
          const reviewCount = contractor.reviews.length;

          if (reviewCount === 0) {
            updated[contractor.id] = 0;
          } else {
            updated[contractor.id] =
              ((prev[contractor.id] || 0) + 1) % reviewCount;
          }
        });

        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [contractors]);

  const fetchContractors = async () => {
    const response = await fetch("http://localhost:3001/contractors");
    const data = await response.json();

    setContractors(data);

    const forms = {};

    data.forEach((contractor) => {
      forms[contractor.id] = {
        firstName: "",
        lastInitial: "",
        stars: "5",
        price: "$$",
        comment: ""
      };
    });

    setReviewForms(forms);
  };

  const checkHomeowner = async () => {
    const response = await fetch("http://localhost:3001/homeowner");
    const data = await response.json();

    setHomeowner(data);
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
  };

  const handleLogout = async () => {
    await fetch("http://localhost:3001/logout", {
      method: "POST"
    });

    setHomeowner(null);
  };

  const handleLike = async (contractorId) => {
    await fetch(`http://localhost:3001/contractors/${contractorId}/like`, {
      method: "POST"
    });

    fetchContractors();
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
      alert("Please log in as a homeowner to leave a review.");
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
        firstName: "",
        lastInitial: "",
        stars: "5",
        price: "$$",
        comment: ""
      }
    }));

    fetchContractors();
  };

  const handleEditReview = (contractorId, review) => {
    setEditingReviews((prev) => ({
      ...prev,
      [contractorId]: review.id
    }));

    setReviewForms((prev) => ({
      ...prev,
      [contractorId]: {
        firstName: "",
        lastInitial: "",
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
        onLogout={handleLogout}
      />

      <div className="contractor-grid">
        {contractors.map((contractor) => {
          const activeIndex = activeIndexes[contractor.id] || 0;

          const activeReview =
            contractor.reviews.length > 0
              ? contractor.reviews[activeIndex]
              : null;

          return (
            <ContractorCard
              key={contractor.id}
              contractor={contractor}
              activeReview={activeReview}
              reviewForm={reviewForms[contractor.id] || {}}
              editingReviewId={editingReviews[contractor.id]}
              homeowner={homeowner}
              onLike={handleLike}
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