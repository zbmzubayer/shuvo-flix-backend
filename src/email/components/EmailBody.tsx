export function EmailBody({ children, style }) {
  const baseStyles = {
    ...style,
    fontFamily: "Helvetica, Arial, sans-serif",
    padding: "32px",
  };

  return (
    <div style={baseStyles}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "32px",
          gap: "12px",
        }}
      >
        <p style={{ fontSize: "18px", color: "#16a34a" }}>FarmFresh</p>
      </div>
      {children}
    </div>
  );
}
