import { GlassCard } from "../../componenets/GlassCard/GlassCard";
import { MainTitle } from "../../componenets/MainTitle/MainTitle";

import "./Strategy.css";

export const Strategy = () => {
  return (
    <div className="strategy-page">
      <MainTitle MainTitle="Strategy" />

      <GlassCard className="hero-card">
        <h1 className="strategy-header-title">Quantitative Equity Rotation</h1>
        <h2 className="subtitle">Systematic Momentum & Risk Management</h2>

        {/* Using exact quote class structure from Home page */}
        <div className="footer-quote-section">
          <div className="quote-card">
            <div className="quote">
              <p>"Virtue is greedy for danger and does not think about what it is going to suffer but what it is striving toward."</p>
              <span>— Seneca</span>
            </div>
          </div>
        </div>

        <div className="description-text">
          <p>
            The engine behind our automated portfolio management is a rigorous, rules-based quantitative rotation model. Instead of relying on static allocation or emotional decision-making, the system continuously scans broad equity universes to capture structural market momentum.
          </p>
          <p>
            By combining a strict macroeconomic defense filter with relative-strength ranking algorithms, the strategy dynamically pivots capital toward the strongest performing growth leaders of the current market cycle while actively shielding assets from major drawdowns.
          </p>
          <p>
            Execution is fully automated, removing human bias and ensuring precise rebalancing, risk distribution, and portfolio optimization directly connected to live market channels.
          </p>
          <p>
            The primary objective of the quantitative rotation framework is to consistently outperform the broad S&P 500 benchmark over complete market cycles. Rather than chasing erratic speculative gains, the architecture focuses on capturing robust relative strength while deliberately suppressing excessive portfolio volatility.
          </p>
          <p>
            At the core of the methodology lies a disciplined cross-sectional evaluation process executed on a systematic cycle. The model filters out lagging or structurally impaired equities, ensuring that capital is concentrated exclusively within top-tier market leaders exhibiting verified upward momentum.
          </p>
          <p>
            Through systematic rebalancing and equal-weight distribution, the portfolio adapts seamlessly to shifting market regimes. This disciplined recycling of capital allows the system to remain aggressive during structural bull markets while maintaining robust defensive posture when broader conditions deteriorate.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};