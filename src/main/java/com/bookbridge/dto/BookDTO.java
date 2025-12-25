package com.bookbridge.dto;

public class BookDTO {
    private Long id;
    private String title;
    private String author;
    private String category;
    private String condition;
    private String listingType;
    private String location;
    private String edition;
    private String isbn;
    private String price;
    private String description;
    private String bookImage;
    // Add more fields as needed

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }
    public String getListingType() { return listingType; }
    public void setListingType(String listingType) { this.listingType = listingType; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getEdition() { return edition; }
    public void setEdition(String edition) { this.edition = edition; }
    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }
    public String getPrice() { return price; }
    public void setPrice(String price) { this.price = price; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getBookImage() { return bookImage; }
    public void setBookImage(String bookImage) { this.bookImage = bookImage; }
} 