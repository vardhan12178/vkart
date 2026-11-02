import React from "react";
import { FaPaperPlane } from "react-icons/fa";
import usePermission from "./usePermission";
import ConversationList from "./support/ConversationList";
import MessageStream from "./support/MessageStream";
import ReplyBar from "./support/ReplyBar";
import ThreadHeader from "./support/ThreadHeader";
import useSupport from "./support/useSupport";

export default function AdminSupport() {
  const { canWrite } = usePermission("support");
  const s = useSupport(canWrite);
  const { selectedId, conversation } = s;

  return (
    <div className="premium-admin-page min-h-screen bg-transparent p-2.5 sm:p-8 font-sans text-[#24231f]">
      <div className="max-w-7xl mx-auto space-y-3 sm:space-y-6">
        <div
          className={`flex items-center justify-between gap-3 ${selectedId ? "hidden lg:flex" : "flex"}`}
        >
          <div>
            <h1 className="font-editorial text-xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Customer Support
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              Respond to real-time customer conversations.
            </p>
          </div>
        </div>

        <div
          className={`grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 sm:gap-6 ${selectedId ? "h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-11rem)]" : "h-[calc(100vh-10rem)]"} min-h-[520px]`}
        >
          {/* Hidden on phones while a conversation is open */}
          <div
            className={`bg-white rounded-2xl border border-slate-200/70 shadow-xs flex flex-col overflow-hidden ${selectedId ? "hidden lg:flex" : "flex"}`}
          >
            <ConversationList
              activeTab={s.activeTab}
              setActiveTab={s.setActiveTab}
              loading={s.loadingList}
              conversations={s.conversations}
              selectedId={selectedId}
              onSelect={s.setSelectedId}
            />
          </div>

          {/* Hidden on phones until a conversation is picked */}
          <div
            className={`bg-white rounded-2xl border border-slate-200/70 shadow-xs flex flex-col overflow-hidden ${!selectedId ? "hidden lg:flex" : "flex"}`}
          >
            {!selectedId && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-2 text-slate-300">
                  <FaPaperPlane size={18} />
                </div>
                <p className="text-sm font-bold text-slate-700">No conversation selected</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a customer thread from the queue to start responding.
                </p>
              </div>
            )}

            {selectedId && conversation && (
              <>
                <ThreadHeader
                  conversation={conversation}
                  canWrite={canWrite}
                  onBack={() => s.setSelectedId(null)}
                  onAction={s.runAction}
                />
                <MessageStream conversation={conversation} customerTyping={s.customerTyping} />
                {canWrite && conversation.status !== "CLOSED" && (
                  <ReplyBar value={s.replyText} onChange={s.changeReply} onSend={s.send} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
