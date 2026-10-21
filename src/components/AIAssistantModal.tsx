import React, { useState } from 'react';
import { useSchool } from '../contexts/SchoolContext';
import { useAuth } from '../contexts/AuthContext';
import {
  X,
  Bot,
  Send,
  Sparkles,
  Mic,
  Calendar,
  ClipboardList,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { classes, settings, students } = useSchool();
  const { currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; actionPath?: string; actionLabel?: string }>>([
    {
      sender: 'ai',
      text: `Xin chào ${currentUser?.full_name || 'Thầy/Cô'}! Tôi là Trợ lý AI của trường ${settings?.school_name || 'PTDTBT THCS Xa Dung'}. Bạn có thể hỏi tôi về sĩ số, danh sách học sinh vắng, tỷ lệ chuyên cần hoặc điều hướng nhanh đến trang báo cáo!`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const handleSend = () => {
    const text = query.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let reply = '';
      let actionPath: string | undefined;
      let actionLabel: string | undefined;

      if (lower.includes('điểm danh') || lower.includes('báo cáo sĩ số')) {
        reply = 'Bạn có thể vào ngay mục "Điểm danh sĩ số" để cập nhật số lượng học sinh có mặt và vắng hôm nay.';
        actionPath = '/attendance';
        actionLabel = 'Đi đến trang Điểm danh';
      } else if (lower.includes('bán trú') || lower.includes('báo ăn') || lower.includes('cơm')) {
        reply = 'Hệ thống quản lý báo ăn bán trú đã sẵn sàng. Bạn có thể xem sổ chấm cơm tháng hoặc báo suất ăn tại đây.';
        actionPath = '/boarding';
        actionLabel = 'Mở Quản lý Bán trú';
      } else if (lower.includes('bỏ học') || lower.includes('dự báo') || lower.includes('nguy cơ')) {
        reply = 'Hệ thống AI vừa quét dữ liệu chuyên cần và phân tích nguy cơ bỏ học sớm của học sinh vùng cao.';
        actionPath = '/ai-dropout-prediction';
        actionLabel = 'Xem AI Dự báo nguy cơ';
      } else if (lower.includes('lớp') || lower.includes('học sinh')) {
        reply = `Toàn trường hiện có ${classes.length} lớp học và ${students.length} học sinh trong danh sách. Bạn có thể xem chi tiết trong phần Quản lý lớp học.`;
        actionPath = '/classes';
        actionLabel = 'Quản lý lớp học';
      } else {
        reply = `Tôi đã ghi nhận câu hỏi: "${text}". Bạn muốn tra cứu báo cáo ngày, xem thống kê tuần hay kiểm tra tỷ lệ chuyên cần hôm nay?`;
        actionPath = '/reports/daily';
        actionLabel = 'Xem Báo cáo hôm nay';
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: reply, actionPath, actionLabel }]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col h-[520px] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-800 text-white px-5 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-amber-300">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm tracking-tight">Trợ lý AI Nhà Trường</h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                  NLP
                </span>
              </div>
              <p className="text-[11px] text-blue-100">Hỗ trợ tra cứu sĩ số và thông tin bán trú</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>

              {m.actionPath && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate(m.actionPath!);
                  }}
                  className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>{m.actionLabel || 'Đi đến trang'}</span>
                </button>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1 text-slate-400 text-xs italic">
              <Bot className="w-3.5 h-3.5 animate-spin" />
              <span>Trợ lý AI đang xử lý dữ liệu...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex flex-wrap gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setQuery('Báo cáo sĩ số hôm nay')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium"
          >
            Báo cáo sĩ số hôm nay
          </button>
          <button
            type="button"
            onClick={() => setQuery('Học sinh có nguy cơ bỏ học')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium"
          >
            Nguy cơ bỏ học
          </button>
          <button
            type="button"
            onClick={() => setQuery('Sổ chấm ăn bán trú tháng này')}
            className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium"
          >
            Sổ chấm cơm bán trú
          </button>
        </div>

        {/* Input footer */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi trợ lý AI bằng ngôn ngữ tự nhiên..."
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!query.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
