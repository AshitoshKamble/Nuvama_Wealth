import { ChevronLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  backTo?: string;
  rightAction?: React.ReactNode;
  sticky?: boolean;
}

export function Header({
  title,
  showBack = false,
  backTo,
  rightAction,
  sticky = true,
}: HeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header
      className={`
        bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3
        ${sticky ? 'sticky top-0 z-30' : ''}
      `}
    >
      {showBack && (
        <button
          onClick={handleBack}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      <h1 className="text-lg font-semibold flex-1 truncate">{title}</h1>
      {rightAction}
    </header>
  );
}
