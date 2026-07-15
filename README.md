# 🏔️ Exodia-Web 2026

Welcome to the official repository for **Exodia 2026**, the premier cultural fest of IIT Mandi! 

This platform isn't just a static informational site—it's a highly interactive web experience built to help attendees navigate the campus, discover events, and stay updated in real-time. Whether you're here to check out the code, report a bug, or contribute, we're glad you made it!

## 💡 What's This Project About?
Organizing a massive cultural fest requires a digital hub that can handle chaotic schedules, lost attendees, and real-time updates. We built this platform to solve those exact problems. It serves as the digital backbone of Exodia, allowing users to seamlessly browse events, find their way around the IIT Mandi campus, and catch the latest announcements without refreshing the page.

## ✨ Core Features

* **Smart Campus Navigation:** IIT Mandi is huge. We built an interactive map that uses a pathfinding algorithm (A*) to calculate the fastest, most efficient walking routes between different fest venues in real-time.
* **Fluid UI & Animations:** We use GSAP (GreenSock) to bring the site to life. From smooth scroll-based parallax effects to a custom interactive event carousel, the site is designed to feel dynamic and modern.
* **The Event Hub:** A deeply categorized database of every cultural event. Users can easily filter through events using tags to find schedules, rules, and descriptions that match their interests.
* **Real-Time Live Updates:** Schedules change and flash events happen. Our dedicated announcement system pushes out notifications and sponsor updates instantly.
* **Dynamic Photo Gallery:** A visual recap of the fest. It includes tag-based filtering for specific events and an admin dashboard so our team can easily upload new shots on the fly.

## 🚀 The Tech Stack

We chose tools that prioritize speed, ease of development, and real-time capabilities:

* **Frontend:** React (Building the user interface)
* **Styling:** Tailwind CSS (Rapid, responsive design)
* **Animations:** GSAP (High-performance animations)
* **Backend & Auth:** Supabase (Handling our database, user logins, and real-time data syncing)
* **Deployment:** Vercel (Fast, reliable hosting)

## 🛠️ Getting Started

Follow these instructions to set up the project locally for development and testing.

### Prerequisites

Ensure you have Node.js and npm (or yarn/pnpm) installed on your machine.

### Installation Steps

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/your-org/Exodia-Web.git](https://github.com/your-org/Exodia-Web.git)
    cd Exodia-Web
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or yarn install
    ```

3.  **Configure environment variables**
    Create a `.env` file in the root directory and add your required keys (e.g., Supabase):
    ```env
    REACT_APP_SUPABASE_URL=your_supabase_url
    REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Start the development server**
    ```bash
    npm start
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🗺️ The Map & Routing System

The campus map feature uses a graph-based representation of IIT Mandi's paths and nodes. The A* algorithm ensures efficient pathfinding by evaluating both the actual distance from the start node and the estimated distance to the destination, providing users with the fastest route between event locations.

---

*For any issues, bug reports, or feature requests, please open an issue in this repository.*
