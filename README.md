# # Exodia-Web 2026 🏔️

Welcome to the official repository for **Exodia 2026**, the premier cultural fest of IIT Mandi! This project is designed to deliver a highly interactive, dynamic, and informative web experience for all fest attendees and participants.

## 🚀 Tech Stack

Here is the core architecture powering the Exodia platform:

* **Frontend:** React
* **Database & Authentication:** Supabase
* **Styling:** Tailwind CSS
* **Animations:** GSAP (GreenSock Animation Platform)
* **Deployment:** Vercel

## ✨ Key Features

* **Advanced GSAP Animations:** Extensive use of GSAP to create a fluid and engaging UI, featuring smooth scroll-based parallax effects and a custom-built, highly interactive event carousel.
* **Smart Campus Navigation:** A fully functional interactive map page of the IIT Mandi campus, utilizing the **A* (A-Star) search algorithm** to calculate optimal, real-time routing between fest venues.
* **Comprehensive Event Hub:** Detailed descriptions, schedules, and rules for all cultural events with tag based seperation events.
* **Real-time Announcements:** A dedicated notification and advertisement system to keep attendees updated on schedule changes, flash events, and sponsor announcements.
* **Crazy Photo Gallary:** A Photo gallery with tag based event seperation and a admin management to auto add data.
* **Secure Auth & Data:** Robust user authentication and database management handled seamlessly by Supabase.

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
