package movie.swp391.response;

import java.time.LocalDateTime;

public class ConversationSummary {
    private String customer;
    private String lastMessage;
    private LocalDateTime lastTime;
    private int unreadCount;

    public ConversationSummary() {
    }

    public ConversationSummary(String customer, String lastMessage, LocalDateTime lastTime, int unreadCount) {
        this.customer = customer;
        this.lastMessage = lastMessage;
        this.lastTime = lastTime;
        this.unreadCount = unreadCount;
    }

    public String getCustomer() {
        return customer;
    }

    public void setCustomer(String customer) {
        this.customer = customer;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public LocalDateTime getLastTime() {
        return lastTime;
    }

    public void setLastTime(LocalDateTime lastTime) {
        this.lastTime = lastTime;
    }

    public int getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(int unreadCount) {
        this.unreadCount = unreadCount;
    }
}
