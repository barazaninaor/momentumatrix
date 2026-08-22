import './GlassCard.css';

interface GlassCardProps {
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children }) => {
  return <div className="glass-card">{children}</div>;
};