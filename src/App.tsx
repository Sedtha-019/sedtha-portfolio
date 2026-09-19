import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import WorkExperience from './components/WorkExperience';
import Training from './components/Training';
import Certificates from './components/Certificates';
import Contact from './components/Contact';
import TechStack from './components/TechStack';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground relative">
        {/* Ambient background blobs — dark mode only */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden dark:block">
          <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-[25%] right-[8%] w-[400px] h-[400px] rounded-full bg-secondary/5 blur-[120px]" />
          <div className="absolute bottom-[15%] left-[40%] w-[350px] h-[350px] rounded-full bg-primary/4 blur-[100px]" />
        </div>

        <Navbar />
        <main className="relative z-10">
          <section id="home"><Home /></section>
          <TechStack />
          <section id="about"><About /></section>
          <section id="experience"><WorkExperience /></section>
          <section id="skills"><Skills /></section>
          <section id="projects"><Projects /></section>
          <section id="training"><Training /></section>
          <Certificates />
          <section id="contact"><Contact /></section>
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
};

export default App;
