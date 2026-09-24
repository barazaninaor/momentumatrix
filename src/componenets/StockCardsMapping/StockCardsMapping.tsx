import "./StockCardsMapping.css";

// Define the structure of a single stock card item
type StockItem = {
  id: string | number;
  symbol: string;
  price: number;
  change: string;
  isPositive: boolean;
};

// Define the props accepted by the StockCardsMapping component
type StockCardsMappingProps = {
  stocks: StockItem[];
};

export const StockCardsMapping: React.FC<StockCardsMappingProps> = ({
  stocks,
}) => {
  return (
    // Container for all stock cards
    <div className="stocks-container">
      {/* Loop through the stocks array and render each card */}
      {stocks.map((stock) => (
        <div key={stock.id} className="stock-card">
          <div className="stock-header">
            <span className="stock-symbol">{stock.symbol}</span>
            <span
              className={`stock-change ${stock.isPositive ? "positive" : "negative"}`}
            >
              {stock.change}
            </span>
          </div>
          <div className="stock-price">${stock.price.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
};
