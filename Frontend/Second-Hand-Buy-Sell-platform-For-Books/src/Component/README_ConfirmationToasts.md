# Confirmation Toast System

This document explains how to use the modern confirmation toast system that replaces the default browser `window.confirm()` dialogs.

## Overview

The confirmation toast system provides a modern, user-friendly alternative to browser confirm dialogs. It uses react-toastify to display styled confirmation dialogs that match your application's design.

## Available Functions

### 1. `showConfirmationToast(message, onConfirm, onCancel)`
Generic confirmation function for any type of confirmation.

**Parameters:**
- `message` (string): The confirmation message to display
- `onConfirm` (function): Function to execute when user confirms
- `onCancel` (function): Function to execute when user cancels (optional)

**Example:**
```javascript
import { showConfirmationToast } from './ConfirmationToast';

const handleAction = () => {
  showConfirmationToast(
    'Are you sure you want to perform this action?',
    () => {
      // User confirmed - perform action
      console.log('Action confirmed');
    },
    () => {
      // User cancelled
      console.log('Action cancelled');
    }
  );
};
```

### 2. `showDeleteConfirmation(itemName, onConfirm)`
Specific function for delete confirmations.

**Parameters:**
- `itemName` (string): Name of the item being deleted
- `onConfirm` (function): Function to execute when user confirms deletion

**Example:**
```javascript
import { showDeleteConfirmation } from './ConfirmationToast';

const handleDeleteBook = (bookId, bookTitle) => {
  showDeleteConfirmation(bookTitle, () => {
    // Perform delete operation
    deleteBook(bookId);
  });
};
```

### 3. `showLogoutConfirmation(onConfirm)`
Specific function for logout confirmations.

**Parameters:**
- `onConfirm` (function): Function to execute when user confirms logout

**Example:**
```javascript
import { showLogoutConfirmation } from './ConfirmationToast';

const handleLogout = () => {
  showLogoutConfirmation(() => {
    // Perform logout
    localStorage.removeItem('user');
    navigate('/');
  });
};
```

### 4. `showUnsavedChangesConfirmation(onConfirm)`
Specific function for unsaved changes confirmations.

**Parameters:**
- `onConfirm` (function): Function to execute when user confirms leaving without saving

**Example:**
```javascript
import { showUnsavedChangesConfirmation } from './ConfirmationToast';

const handleNavigation = () => {
  if (hasUnsavedChanges) {
    showUnsavedChangesConfirmation(() => {
      // Navigate away
      navigate('/other-page');
    });
  } else {
    navigate('/other-page');
  }
};
```

## Features

- **Modern Design**: Styled to match your application's theme
- **Responsive**: Works well on all screen sizes
- **Accessible**: Proper keyboard navigation and screen reader support
- **Customizable**: Easy to modify styles and behavior
- **Reusable**: Can be used throughout the application
- **Non-blocking**: Doesn't freeze the UI like `window.confirm()`

## Styling

The confirmation toasts use inline styles that can be easily customized. The default styling includes:

- Clean white background with subtle border
- Rounded corners and shadow
- Responsive button layout
- Hover effects on buttons
- Proper spacing and typography

## Migration from window.confirm()

To migrate from `window.confirm()`:

**Before:**
```javascript
if (window.confirm('Are you sure?')) {
  // Perform action
}
```

**After:**
```javascript
showConfirmationToast('Are you sure?', () => {
  // Perform action
});
```

## Best Practices

1. **Use specific functions** when available (e.g., `showDeleteConfirmation` for deletes)
2. **Provide clear messages** that explain what will happen
3. **Handle both confirm and cancel cases** when needed
4. **Keep confirmation messages concise** but informative
5. **Use consistent language** across your application 