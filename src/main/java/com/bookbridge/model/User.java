package com.bookbridge.model;

import jakarta.persistence.*;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 100)
    @Column(name = "full_name")
    private String fullName;

    @NotBlank
    @Email
    @Size(max = 100)
    @Column(unique = true)
    private String email;
    
    
    @Size(max = 100)
    @Column(name = "username")
    private String username;

    @NotBlank
    @Size(min = 6, max = 100)
    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type")
    private UserType userType;

    @Enumerated(EnumType.STRING)
    private UserStatus status = UserStatus.ACTIVE;

    // Individual user fields
    @Column(name = "id_card_number")
    private String idCardNumber;

    @Column(name = "id_card_photo")
    private String idCardPhoto;

    // Organization fields
    @Column(name = "organization_name")
    private String organizationName;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "business_registration_number")
    private String businessRegistrationNumber;

    @Column(name = "pan_number")
    private String panNumber;

    @Column(name = "document_photo")
    private String documentPhoto;

    // Common fields
    private String location;

    @Column(name = "profile_image")
    private String profileImage;

    private String phone;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    


    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Book> books;

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Message> sentMessages;

    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Message> receivedMessages;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Order> orders;

    // Constructors
    public User() {}

    public User(String fullName, String email, String password, UserType userType) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.userType = userType;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public UserType getUserType() { return userType; }
    public void setUserType(UserType userType) { this.userType = userType; }

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }

    public String getIdCardNumber() { return idCardNumber; }
    public void setIdCardNumber(String idCardNumber) { this.idCardNumber = idCardNumber; }

    public String getIdCardPhoto() { return idCardPhoto; }
    public void setIdCardPhoto(String idCardPhoto) { this.idCardPhoto = idCardPhoto; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getBusinessRegistrationNumber() { return businessRegistrationNumber; }
    public void setBusinessRegistrationNumber(String businessRegistrationNumber) { this.businessRegistrationNumber = businessRegistrationNumber; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public String getDocumentPhoto() { return documentPhoto; }
    public void setDocumentPhoto(String documentPhoto) { this.documentPhoto = documentPhoto; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }

    public LocalDateTime getResetTokenExpiry() { return resetTokenExpiry; }
    public void setResetTokenExpiry(LocalDateTime resetTokenExpiry) { this.resetTokenExpiry = resetTokenExpiry; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<Book> getBooks() { return books; }
    public void setBooks(List<Book> books) { this.books = books; }

    public List<Message> getSentMessages() { return sentMessages; }
    public void setSentMessages(List<Message> sentMessages) { this.sentMessages = sentMessages; }

    public List<Message> getReceivedMessages() { return receivedMessages; }
    public void setReceivedMessages(List<Message> receivedMessages) { this.receivedMessages = receivedMessages; }

    public List<Order> getOrders() { return orders; }
    public void setOrders(List<Order> orders) { this.orders = orders; }

    // Enums
    public enum UserType {
        INDIVIDUAL, ORGANIZATION, ADMIN
    }

    public enum UserStatus {
        ACTIVE, BLOCKED, DELETED
    }
}
