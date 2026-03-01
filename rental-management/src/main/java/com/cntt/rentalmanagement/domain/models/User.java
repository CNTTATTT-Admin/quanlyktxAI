package com.cntt.rentalmanagement.domain.models;

import com.cntt.rentalmanagement.domain.enums.AuthProvider;
import com.cntt.rentalmanagement.domain.models.audit.DateAudit;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIdentityInfo(
		  generator = ObjectIdGenerators.PropertyGenerator.class,
		  property = "id")
public class User extends DateAudit {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String name;

	@Email
	@Column(nullable = false)
	private String email;

	private String imageUrl;

	@Column(nullable = false)
	private Boolean emailVerified = false;

	@JsonIgnore
	private String password;

	@NotNull
	@Enumerated(EnumType.STRING)
	private AuthProvider provider;

	private String providerId;

	@Column(name = "is_locked")
	private Boolean isLocked;

	@Column(name = "is_confirmed")
	private Boolean isConfirmed;

	private String address;

	@Column(name = "phone", unique = true)
	private String phone;

	private String zaloUrl;

	private String facebookUrl;

	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
	private Set<Role> roles = new HashSet<>();

	@JsonIgnore
	@OneToMany(mappedBy = "user")
	private List<Room> rooms;

    @OneToMany(mappedBy = "user")
	@JsonIgnore
    private List<Rate> rates;
    
    @OneToMany(mappedBy = "user")
	@JsonIgnore
    private List<Comment> comments;

	@OneToMany(mappedBy = "user")
	@JsonIgnore
	private List<BlogStore> stores;

    @ManyToOne
    @JoinColumn(name = "allocated_room_id")
    @JsonIgnore
    private Room allocatedRoom;

    public Long getAllocatedRoomId() {
        return allocatedRoom != null ? allocatedRoom.getId() : null;
    }

    @Column(name = "face_vector", columnDefinition = "TEXT")
    private String faceVector;
}
