import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { hideNewMessagePopup } from '../../store/slices/chatSlice';
import { RootState } from '../../store/store';

const NewMessagePopup: React.FC = () => {
  const dispatch = useDispatch();
  const { show, message, senderName } = useSelector((state: RootState) => state.chat.newMessagePopup);

  const handleClose = () => {
    dispatch(hideNewMessagePopup());
  };

  const handleOpenChat = () => {
    // Dispatch custom event to open chat
    window.dispatchEvent(new CustomEvent('openChat', { detail: senderName }));
    handleClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.8 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Card className="w-80 p-4 bg-white shadow-lg border border-orange-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-gray-900">رسالة جديدة</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">من: {senderName}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{message}</p>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  onClick={handleOpenChat}
                >
                  فتح المحادثة
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                >
                  تجاهل
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewMessagePopup;