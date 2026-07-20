interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  elevated?: boolean;
  hoverable?: boolean;
}

export function Card({
  children,
  className = '',
  onClick,
  elevated = false,
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={`
        ${elevated ? 'card-elevated' : 'card'}
        ${hoverable ? 'hover:shadow-md cursor-pointer transition-shadow' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
