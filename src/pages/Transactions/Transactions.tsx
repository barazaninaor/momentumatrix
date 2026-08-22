import { useEffect, useState } from "react";
import { MainTitle } from "../../componenets/MainTitle/MainTitle";
import { LoadingSpinner } from "../../componenets/LoadingSpinner/LoadingSpinner";
import "./Transactions.css";

interface Transaction {
  id: number;
  portfolio_id: number;
  operation: string;
  ticker: string;
  shares: number;
  price: number;
  timestamp: string;
}

export const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    fetch("http://localhost:8000/transactions/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch transactions");
        return res.json();
      })
      .then((data) => {
        setTransactions(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const totalPages = Math.ceil(transactions.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentTransactions = transactions.slice(startIndex, startIndex + pageSize);

  return (
    <div className="transactions-page">
      <MainTitle MainTitle="Transactions History" />

      <div className="transactions-container">
        {loading && <LoadingSpinner message="Loading transactions..." />}
        
        {error && <div className="error-state">Error: {error}</div>}

        {!loading && !error && transactions.length === 0 && (
          <div className="empty-state">No transactions found in the database.</div>
        )}

        {!loading && !error && transactions.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th className="index-col">#</th>
                    <th>Operation</th>
                    <th>Ticker</th>
                    <th>Date</th>
                    <th className="text-right">Shares</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((tx, index) => {
                    const isBuy = tx.operation?.toUpperCase() === "BUY";
                    const totalValue = tx.shares * tx.price;
                    const formattedDate = tx.timestamp ? tx.timestamp.split("T")[0] : "";
                    const rowNumber = startIndex + index + 1;

                    return (
                      <tr key={tx.id}>
                        <td className="index-cell">{rowNumber}</td>
                        <td>
                          <span className={`badge ${isBuy ? "badge-buy" : "badge-sell"}`}>
                            {tx.operation}
                          </span>
                        </td>
                        <td className="ticker-cell">{tx.ticker}</td>
                        <td className="date-cell">{formattedDate}</td>
                        <td className="text-right">{tx.shares.toLocaleString()}</td>
                        <td className="text-right">${tx.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                        <td className="text-right">${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pagination-container">
              <div className="pagination-buttons">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span className="page-current">Page {currentPage} of {totalPages}</span>
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};