import AnnouncementBar from "../components/home/AnnouncementBar";
import Hero from "../components/home/Hero";
import Highlights from "../components/home/Highlights";
import Vision from "../components/home/Vision";
import Experience from "../components/home/Experience";
import Schedule from "../components/home/Schedule";
import Registration from "../components/home/Registration";
import FAQ from "../components/home/FAQ";
import RegistrationDeadline from "../components/home/RegistrationDeadline";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function Home() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main>
        <Hero />
         <RegistrationDeadline />
        <Highlights />
        <Vision />
        <Experience />
        {/* <Schedule /> */}
        <Registration />
        <FAQ />
      </main>

      <Footer />
    </>
  );
}

export default Home;