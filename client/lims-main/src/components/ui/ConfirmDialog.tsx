import { Modal } from './Modal';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'warning';
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  isLoading = false
}: ConfirmDialogProps) => {
  const getColors = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 shadow-red-100';
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600 shadow-blue-100';
      default:
        return 'bg-amber-500 hover:bg-amber-600 shadow-amber-100';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="max-w-md">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-2 rounded-xl shrink-0",
            type === 'danger' ? "bg-red-50 text-red-500" :
            type === 'info' ? "bg-blue-50 text-blue-500" : "bg-amber-50 text-amber-500"
          )}>
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "px-6 py-2 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50",
              getColors()
            )}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
