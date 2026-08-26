import naorImg from "../../assets/naor.jpg";
import { GlassCard } from "../../componenets/GlassCard/GlassCard";
import { MainTitle } from "../../componenets/MainTitle/MainTitle";
import { ResponsiveVideo } from "../../componenets/ResponsiveVideo/ResponsiveVideo";
import "./About.css";

export const About = () => {
  return (
    <div className="about-page">
      <MainTitle MainTitle="About" />

      <GlassCard>
        <img src={naorImg} alt="Naor Barazani" className="profile-img" />

        <h1 className="about-header-title">Naor Barazani</h1>
        <h2 className="subtitle">Algorithmic Trader & AI Full Stack Engineer</h2>

        <div className="quote">
          <p>"Life can only be understood backwards; but it must be lived forwards." — Søren Kierkegaard</p>
        </div>

        <div className="description-text">
          <p>My approach to algorithmic trading stems from a deep background in financial analysis and rigorous logical training. I build automated trading systems, real-time portfolio tracking engines, and high-performance market scanners from the ground up.</p>
          <p>Combining full-stack AI engineering with quantitative strategies, I design robust trading robots and data ingestion pipelines connected directly to live APIs, turning complex market data into seamless, automated execution.</p>
          <p>My systems are built to bridge the gap between advanced market mechanics and modern software architecture, delivering precision, speed, and systematic edge to the trading world.</p>
        </div>

        <ResponsiveVideo 
          videoUrl="https://www.youtube.com/embed/gbMWRa0guhg?hl=en" 
          title="Death as a Motive for Life" 
        />
      </GlassCard>
    </div>
  );
};