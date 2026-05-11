// client/src/pages/auth/AboutUs.jsx
import React, { useEffect } from 'react';

export default function AboutUs() {
  useEffect(() => {
    const animateValue = (obj, start, end, duration) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.textContent = Math.floor(progress * (end - start) + start) + '+';
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    const stats = document.querySelectorAll('.stat-card h3');
    stats.forEach((stat) => {
      const target = parseInt(stat.textContent.replace(/[^0-9]/g, ''), 10) || 0;
      animateValue(stat, 0, target, 1000);
    });
  }, []);

  return (
    <div className="font-montserrat">
      {/* Embedded page-specific styles (unchanged) */}
      <style>{`
        .about-hero {
            width: 100%;
            height: 420px;
            margin: 0 auto 60px auto;
            background-image: url('/images/car1003.png');
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-color: #333333;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 20px;
            border-bottom: 5px solid #ff6b00;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        .about-hero::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.45); z-index:1; }
        .about-hero h1, .about-hero p { position: relative; z-index:2; color:#fff }
        .about-hero h1 { font-size:56px; font-weight:800; letter-spacing:-1px; margin-bottom:10px; }
        .about-hero h1:hover { color:#ff6b00; text-shadow:0 0 10px rgba(255,255,255,0.7); }
        .about-hero p { font-size:22px; font-weight:500; color:#f0f0f0; }
        .oneL { color:#ff6b00; font-weight:900; }

        section { padding: 4rem 2rem; max-width:1200px; margin:0 auto; position:relative; overflow:hidden; }
        section::after { content:''; position:absolute; bottom:0; left:0; width:100%; height:2px; background: linear-gradient(90deg,#ff6b00,#ff9a44,transparent); }
        section h2 { color:#ff6b00; font-size:2.5rem; text-align:center; margin-bottom:3rem; }

        .stats-container { display:grid; grid-template-columns: repeat(auto-fit, minmax(250px,1fr)); gap:2rem; margin-top:2rem; }
        .stat-card { background:#fff; padding:2rem; border-radius:1rem; text-align:center; border:1px solid #ff6b00; transition:transform .3s; box-shadow:0 5px 15px rgba(255,107,0,0.1); }
        .stat-card:hover { transform: translateY(-5px); box-shadow:0 10px 30px rgba(255,107,0,0.2); }
        .stat-card h3 { color:#ff6b00; font-size:2.5rem; margin-bottom:.5rem; }
        .stat-card p { color:#666; }

        .mission-cards { display:grid; grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap:2rem; }
        .mission-card { background:#fff; padding:2rem; border-radius:1rem; border:1px solid #ff6b00; box-shadow:0 5px 15px rgba(255,107,0,0.1); }
        .mission-card h3 { color:#ff6b00; font-size:1.5rem; margin-bottom:1rem; }

        .team-container { display:grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap:2rem; }
        .team-card { background:#fff; border-radius:1rem; overflow:hidden; border:1px solid #ff6b00; box-shadow:0 5px 15px rgba(255,107,0,0.1); }
        .team-card img { width:100%; height:300px; object-fit:cover; }
        .team-card h3 { color:#ff6b00; font-size:1.3rem; margin:1rem; }
        .team-card .position { color:#666; margin:0 1rem; }
        .team-card .bio { padding:1rem; line-height:1.6; color:#333; }

        .contact-container { background:#fff; border-radius:1rem; padding:2rem; border:1px solid #ff6b00; box-shadow:0 5px 15px rgba(255,107,0,0.1); }
        .contact-info { display:grid; grid-template-columns: repeat(auto-fit, minmax(250px,1fr)); gap:2rem; }
        .contact-card h3 { color:#ff6b00; margin-bottom:1rem; }

        @media (max-width:768px) {
          .about-hero { height:320px; margin-bottom:30px; }
          .about-hero h1 { font-size:40px; }
          .about-hero p { font-size:18px; }
        }
        /* Reduce extra space before footer */
        .contact-section { padding-bottom: 1.5rem; margin-bottom: 0; }
        /* Ensure footer aligns closely (if footer has top margin) */
        .contact-container { margin-bottom: 0; }
      `}</style>

      {/* Hero Section */}
      <div className="about-hero">
        <h1>About <span className="oneL">DriveBidRent</span></h1>
        <p>Your Trusted Partner in Automotive Solutions - Updated for CI/CD verification on April 20, 2026.</p>
      </div>

      {/* Our Story Section */}
      <section className="our-story">
        <h2>Our Story</h2>
        <div className="story-content">
          <div className="story-text">
            <p>
              Founded in 2025, DriveBidRent emerged from a simple vision: to revolutionize the way people buy, sell, and rent vehicles. We understood the challenges faced by both buyers and sellers in the traditional automotive market and set out to create a platform that would make the process seamless, transparent, and enjoyable.
            </p>
            <p>
              What started as a small startup has now grown into a trusted platform serving thousands of satisfied customers across the country.
            </p>
          </div>

          <div className="stats-container">
            <div className="stat-card">
              <h3>5000+</h3>
              <p>Happy Customers</p>
            </div>
            <div className="stat-card">
              <h3>1000+</h3>
              <p>Successful Auctions</p>
            </div>
            <div className="stat-card">
              <h3>500+</h3>
              <p>Rental cars</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="our-mission">
        <h2>Our Mission</h2>
        <div className="mission-cards">
          <div className="mission-card">
            <h3>Trust & Transparency</h3>
            <p>We believe in complete transparency in every transaction, ensuring both buyers and sellers have access to accurate information and fair pricing.</p>
          </div>
          <div className="mission-card">
            <h3>Quality Service</h3>
            <p>Our commitment to quality extends beyond just vehicles. We ensure every aspect of our service meets the highest standards of excellence.</p>
          </div>
          <div className="mission-card">
            <h3>Customer First</h3>
            <p>Your satisfaction is our priority. We're dedicated to providing personalized solutions that meet your specific needs and preferences.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="our-team">
        <h2>Meet Our Team</h2>
        <div className="team-container">
          <div className="team-card">
            <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="M V Tejesh" />
            <h3>M V Tejesh</h3>
            <p className="position">Captain</p>
            <p className="bio">The captain of this project and makes driver dashboard and ensures smooth operational functions.</p>
          </div>
          <div className="team-card">
            <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="V Jeevan Guptha" />
            <h3>V Jeevan Guptha</h3>
            <p className="position">Front-end designer</p>
            <p className="bio">Jeevan designed the buyer dashboard page and UI/UX designer of this project.</p>
          </div>
          <div className="team-card">
            <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="Sk Toufeeq" />
            <h3>Sk Toufeeq</h3>
            <p className="position">Chief Technology Officer</p>
            <p className="bio">Toufeeq leads our technical innovations and platform development initiatives.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <h2>Get in Touch</h2>
        <div className="contact-container">
          <div className="contact-info">
            <div className="contact-card">
              <h3>Visit Us</h3>
              <p>SB-2, Sagar Colony</p>
              <p>Hyderabad, India</p>
            </div>
            <div className="contact-card">
              <h3>Contact Us</h3>
              <p>Email: <a href="mailto:jeevanvankadara@gmail.com">jeevanvankadara@gmail.com</a></p>
              <p>Phone: <a href="tel:+919876543210">+91 9876543210</a></p>
            </div>
            <div className="contact-card">
              <h3>Business Hours</h3>
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday: 10:00 AM - 4:00 PM</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}