export default function Btn({ children, onClick }) {
    return (
      <button onClick={onClick} className="chip">
        {children}
      </button>
    );
  }
  