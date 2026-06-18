// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import './VerifyEmail.css'

// const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

// function VerifyEmail({ navigateToPage }) {
//   const [status, setStatus] = useState("loading");
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const token = params.get("token");

//     if (!token) {
//       setStatus("error");
//       setMessage("Invalid verification link");
//       return;
//     }

//     const verify = async () => {
//       try {
//         const response = await axios.get(`${BACKEND_URL}/api/auth/verify/${token}`);

//         setStatus("success");
//         setMessage(response.data.message || "Email verified successfully!");

//         // After 3 seconds → go to login page
//         setTimeout(() => {
//           if (navigateToPage) navigateToPage("login");
//           else window.location.href = "/login";
//         }, 2500);

//       } catch (error) {
//         setStatus("error");
//         setMessage(
//           error.response?.data?.detail || "Verification failed. Try again later."
//         );
//       }
//     };

//     verify();
//   }, []);

//   return (
//     <div className="verify-email-page">
//       <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
//         <div className="verify-email-form-card" style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}>
//           <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#0f172a", marginBottom: "1.5rem" }}>
//             Email Verification
//           </h2>

//           {status === "loading" && (
//             <p style={{ color: "#475569", fontSize: "1rem" }}>Verifying your email...</p>
//           )}

//           {status === "success" && (
//             <div>
//               <div className="info-icon" style={{ margin: "0 auto 1rem" }}>
//                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "32px", height: "32px" }}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//               <p style={{ color: "#15803d", fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
//                 {message}
//               </p>
//             </div>
//           )}

//           {status === "error" && (
//             <div>
//               <div className="info-icon" style={{ margin: "0 auto 1rem", background: "linear-gradient(135deg, #fee2e2, #fecaca)", color: "#dc2626" }}>
//                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "32px", height: "32px" }}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
//                 </svg>
//               </div>
//               <p style={{ color: "#dc2626", fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
//                 {message}
//               </p>
//             </div>
//           )}

//           {status !== "loading" && (
//             <p style={{ marginTop: "1.5rem", color: "#475569", fontSize: "0.95rem" }}>
//               Redirecting you to login page...
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default VerifyEmail;



import React, { useEffect, useState } from "react";
import axios from "axios";
import './VerifyEmail.css'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

function VerifyEmail({ navigateToPage }) {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check if this is the correct route - avoid running on /verify-email-change
    const currentPath = window.location.pathname;
    if (currentPath.includes('verify-email-change')) {
      console.log('Wrong component - this is email change verification');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    const verify = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/verify/${token}`);

        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");

        // After 3 seconds → go to login page
        setTimeout(() => {
          if (navigateToPage) navigateToPage("login");
          else window.location.href = "/login";
        }, 2500);

      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.detail || "Verification failed. Try again later."
        );
      }
    };

    verify();
  }, []);

  return (
    <div className="verify-email-page">
      <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
        <div className="verify-email-form-card" style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "700", color: "#0f172a", marginBottom: "1.5rem" }}>
            Email Verification
          </h2>

          {status === "loading" && (
            <p style={{ color: "#475569", fontSize: "1rem" }}>Verifying your email...</p>
          )}

          {status === "success" && (
            <div>
              <div className="info-icon" style={{ margin: "0 auto 1rem" }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "32px", height: "32px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p style={{ color: "#15803d", fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                {message}
              </p>
            </div>
          )}

          {status === "error" && (
            <div>
              <div className="info-icon" style={{ margin: "0 auto 1rem", background: "linear-gradient(135deg, #fee2e2, #fecaca)", color: "#dc2626" }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "32px", height: "32px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <p style={{ color: "#dc2626", fontWeight: "600", fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                {message}
              </p>
            </div>
          )}

          {status !== "loading" && (
            <p style={{ marginTop: "1.5rem", color: "#475569", fontSize: "0.95rem" }}>
              Redirecting you to login page...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;