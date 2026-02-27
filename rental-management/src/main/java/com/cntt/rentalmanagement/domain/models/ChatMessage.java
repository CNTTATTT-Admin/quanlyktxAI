package com.cntt.rentalmanagement.domain.models;

import com.cntt.rentalmanagement.domain.models.audit.DateAudit;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Table(name = "chat_message")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage extends DateAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Boolean fromBot;

    private String intent;

    public ChatMessage(User user, String content, Boolean fromBot, String intent) {
        this.user = user;
        this.content = content;
        this.fromBot = fromBot;
        this.intent = intent;
    }
}
