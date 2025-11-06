# PHASE 9 TESTING GUIDE

## Overview
This guide provides comprehensive testing instructions for the User Settings page functionality.

## 🔐 Prerequisites
- User must be logged in
- Firebase Auth and Firestore must be properly configured
- Test user account should exist

## 🧪 Test Cases

### Test Group 1: Page Access & Navigation

#### TC1.1: Access Settings Page
**Steps:**
1. Log in as a regular user
2. Click on profile menu in navbar
3. Click "Settings"

**Expected Result:**
- Settings page loads successfully
- Page title shows "Account Settings"
- Two tabs are visible: "Profile Settings" and "Security Settings"
- Profile Settings tab is active by default

**Status:** ⬜ Pass ⬜ Fail

---

#### TC1.2: Tab Navigation
**Steps:**
1. Navigate to Settings page
2. Click on "Security Settings" tab
3. Click on "Profile Settings" tab

**Expected Result:**
- Tabs switch smoothly with animation
- Active tab has orange underline
- Content changes based on selected tab
- No errors in console

**Status:** ⬜ Pass ⬜ Fail

---

### Test Group 2: Profile Settings

#### TC2.1: Display Current User Information
**Steps:**
1. Navigate to Settings > Profile Settings

**Expected Result:**
- Username displays correctly
- Email displays correctly
- Account creation date displays in readable format
- All icons render properly

**Status:** ⬜ Pass ⬜ Fail

---

#### TC2.2: Open Edit Username Modal
**Steps:**
1. Navigate to Profile Settings
2. Click "Edit Username" button

**Expected Result:**
- Modal opens with smooth animation
- Current username is pre-filled
- Input field is focused
- Cancel and Save buttons are visible
- Close (X) button is visible

**Status:** ⬜ Pass ⬜ Fail

---

#### TC2.3: Username Validation - Too Short
**Steps:**
1. Open Edit Username modal
2. Enter "ab" (2 characters)
3. Click Save

**Expected Result:**
- Error message: "Username must be at least 3 characters long"
- Username is not updated
- Save button may be disabled or operation fails

**Status:** ⬜ Pass ⬜ Fail

---

#### TC2.4: Username Validation - Too Long
**Steps:**
1. Open Edit Username modal
2. Enter 31+ characters
3. Click Save

**Expected Result:**
- Error message: "Username cannot exceed 30 characters"
- Username is not updated

**Status:** ⬜ Pass ⬜ Fail

---

#### TC2.5: Username Validation - Invalid Characters
**Steps:**
1. Open Edit Username modal
2. Enter "user@name" or "user name" (with special chars/spaces)
3. Click Save

**Expected Result:**
- Error message: "Username can only contain letters, numbers, and underscores"
- Username is not updated

**Status:** ⬜ Pass ⬜ Fail

---

#### TC2.6: Username Update - Success
**Steps:**
1. Open Edit Username modal
2. Enter valid username (e.g., "newuser123")
3. Click Save
4. Wait for operation to complete

**Expected Result:**
- Loading spinner appears on Save button
- Success toast notification appears
- Modal closes automatically
- New username displays on page
- Username updated in Firebase Auth
- Username updated in Firestore

**Status:** ⬜ Pass ⬜ Fail

---

#### TC2.7: Cancel Username Edit
**Steps:**
1. Open Edit Username modal
2. Change username
3. Click Cancel

**Expected Result:**
- Modal closes
- Username remains unchanged
- No API calls made

**Status:** ⬜ Pass ⬜ Fail

---

### Test Group 3: Security Settings

#### TC3.1: Open Change Password Modal
**Steps:**
1. Navigate to Security Settings tab
2. Click "Change Password" button

**Expected Result:**
- Modal opens with smooth animation
- Three password fields are visible:
  - Current Password
  - New Password
  - Confirm New Password
- All fields have eye icons for visibility toggle
- Update Password and Cancel buttons visible

**Status:** ⬜ Pass ⬜ Fail

---

#### TC3.2: Password Visibility Toggle
**Steps:**
1. Open Change Password modal
2. Enter text in any password field
3. Click eye icon
4. Click eye icon again

**Expected Result:**
- First click: password becomes visible (text)
- Second click: password becomes hidden (dots)
- Icon changes from Eye to EyeOff
- Works for all three password fields independently

**Status:** ⬜ Pass ⬜ Fail

---

#### TC3.3: Password Strength Indicator
**Steps:**
1. Open Change Password modal
2. In "New Password" field, type progressively:
   - "abc" (weak)
   - "abcABC" (fair)
   - "abcABC123" (good)
   - "abcABC123!" (strong)

**Expected Result:**
- Strength indicator appears below new password field
- Progress bar width increases
- Label changes: Weak → Fair → Good → Strong
- Color changes: Red → Yellow → Blue → Green
- Checklist items get checkmarks as requirements are met

**Status:** ⬜ Pass ⬜ Fail

---

#### TC3.4: Password Requirements Checklist
**Steps:**
1. Open Change Password modal
2. Type various passwords in new password field
3. Observe checklist

**Expected Result:**
- 5 requirements are listed:
  - At least 8 characters
  - One uppercase letter
  - One lowercase letter
  - One number
  - One special character
- Checkmark (green) appears when requirement is met
- X (gray) shows when requirement is not met

**Status:** ⬜ Pass ⬜ Fail

---

#### TC3.5: Password Validation - Empty Fields
**Steps:**
1. Open Change Password modal
2. Leave all fields empty
3. Click Update Password

**Expected Result:**
- Error messages display:
  - "Current password is required"
  - "New password is required"
  - "Please confirm your new password"
- Password is not updated

**Status:** ⬜ Pass ⬜ Fail

---

#### TC3.6: Password Validation - Passwords Don't Match
**Steps:**
1. Open Change Password modal
2. Enter current password
3. Enter new password: "TestPass123!"
4. Enter confirm password: "TestPass456!"
5. Click Update Password

**Expected Result:**
- Error message: "New passwords do not match"
- Password is not updated

**Status:** ⬜ Pass ⬜ Fail

---

#### TC3.7: Password Validation - Weak New Password
**Steps:**
1. Open Change Password modal
2. Enter current password
3. Enter weak new password: "abc"
4. Confirm password: "abc"
5. Click Update Password

**Expected Result:**
- Multiple error messages about password requirements
- Password is not updated
- Strength indicator shows "Weak"

**Status:** ⬜ Pass ⬜ Fail

---

#### TC3.8: Password Validation - Wrong Current Password
**Steps:**
1. Open Change Password modal
2. Enter incorrect current password
3. Enter valid new password
4. Confirm new password
5. Click Update Password

**Expected Result:**
- Error toast: "Current password is incorrect"
- Password is not updated
- Modal remains open

**Status:** ⬜ Pass ⬜ Fail

---

#### TC3.9: Password Update - Success
**Steps:**
1. Open Change Password modal
2. Enter correct current password
3. Enter strong new password (e.g., "NewPass123!")
4. Confirm new password
5. Click Update Password
6. Wait for operation to complete

**Expected Result:**
- Loading spinner appears
- Re-authentication occurs in background
- Success toast: "Password updated successfully!"
- Modal closes automatically
- All password fields are cleared
- User can now login with new password

**Status:** ⬜ Pass ⬜ Fail

---

#### TC3.10: Cancel Password Change
**Steps:**
1. Open Change Password modal
2. Enter data in fields
3. Click Cancel

**Expected Result:**
- Modal closes
- Password remains unchanged
- No API calls made
- Fields are cleared

**Status:** ⬜ Pass ⬜ Fail

---

### Test Group 4: Account Deletion

#### TC4.1: Open Delete Account Modal
**Steps:**
1. Navigate to Security Settings
2. Scroll to "Danger Zone"
3. Click "Delete Account" button

**Expected Result:**
- Warning modal opens with red theme
- Warning icon (AlertTriangle) is visible
- Clear warning message about permanent deletion
- Input field for typing "DELETE"
- Delete My Account and Cancel buttons visible

**Status:** ⬜ Pass ⬜ Fail

---

#### TC4.2: Delete Validation - Wrong Confirmation
**Steps:**
1. Open Delete Account modal
2. Type "delete" (lowercase) or "DEL" or anything else
3. Try to click Delete button

**Expected Result:**
- Delete button is disabled OR
- Error toast: "Please type DELETE to confirm"
- Account is not deleted

**Status:** ⬜ Pass ⬜ Fail

---

#### TC4.3: Delete Account - Success
**Steps:**
1. Open Delete Account modal
2. Type "DELETE" (uppercase)
3. Click "Delete My Account"
4. Wait for operation to complete

**Expected Result:**
- Loading spinner appears
- User document deleted from Firestore
- User deleted from Firebase Auth
- Success toast: "Account deleted successfully"
- User redirected to registration page
- User cannot log in with old credentials

**Status:** ⬜ Pass ⬜ Fail

---

#### TC4.4: Delete Account - Requires Recent Login
**Steps:**
1. Log in
2. Wait 10+ minutes
3. Try to delete account

**Expected Result:**
- Error toast: "Please log out and log in again before deleting your account"
- Account is not deleted
- Modal remains open

**Status:** ⬜ Pass ⬜ Fail

---

#### TC4.5: Cancel Account Deletion
**Steps:**
1. Open Delete Account modal
2. Type "DELETE"
3. Click Cancel

**Expected Result:**
- Modal closes
- Account is not deleted
- No API calls made
- Confirmation text is cleared

**Status:** ⬜ Pass ⬜ Fail

---

### Test Group 5: Responsive Design

#### TC5.1: Mobile View (< 640px)
**Steps:**
1. Open settings page
2. Resize browser to mobile size or use device emulation

**Expected Result:**
- Page layouts properly
- Tabs are touch-friendly
- Modals fit on screen
- Buttons are large enough to tap
- Text is readable
- No horizontal scrolling

**Status:** ⬜ Pass ⬜ Fail

---

#### TC5.2: Tablet View (640px - 1024px)
**Steps:**
1. Open settings page
2. Resize browser to tablet size

**Expected Result:**
- Layout adapts appropriately
- All features accessible
- Good use of space

**Status:** ⬜ Pass ⬜ Fail

---

#### TC5.3: Desktop View (> 1024px)
**Steps:**
1. Open settings page
2. View on large desktop screen

**Expected Result:**
- Content is centered (max-width)
- Good spacing and padding
- Professional appearance

**Status:** ⬜ Pass ⬜ Fail

---

### Test Group 6: Error Handling

#### TC6.1: Network Error
**Steps:**
1. Open browser DevTools
2. Enable offline mode
3. Try to update username or password

**Expected Result:**
- Error toast with appropriate message
- Operation fails gracefully
- No app crash
- User can retry after going online

**Status:** ⬜ Pass ⬜ Fail

---

#### TC6.2: Unauthenticated Access
**Steps:**
1. Log out
2. Try to navigate to /settings directly

**Expected Result:**
- Redirect to login page
- Settings page not accessible
- No errors in console

**Status:** ⬜ Pass ⬜ Fail

---

### Test Group 7: UI/UX

#### TC7.1: Loading States
**Steps:**
1. Perform any action (update username, password, delete account)
2. Observe button state during operation

**Expected Result:**
- Button shows loading spinner
- Button text changes (e.g., "Saving...", "Updating...", "Deleting...")
- Button is disabled during operation
- Other buttons may also be disabled
- User cannot double-submit

**Status:** ⬜ Pass ⬜ Fail

---

#### TC7.2: Toast Notifications
**Steps:**
1. Perform various actions
2. Observe toast notifications

**Expected Result:**
- Success actions show green toast
- Error actions show red toast
- Toasts appear at top-center
- Toasts auto-dismiss after 3 seconds
- Messages are clear and helpful

**Status:** ⬜ Pass ⬜ Fail

---

#### TC7.3: Animations
**Steps:**
1. Navigate between tabs
2. Open and close modals
3. Observe transitions

**Expected Result:**
- Smooth tab transitions
- Modal fade-in/out animations
- Scale animations on modal open
- No janky or broken animations
- Animations are subtle and professional

**Status:** ⬜ Pass ⬜ Fail

---

#### TC7.4: Icons and Visual Elements
**Steps:**
1. Review entire settings page
2. Check all icons and visual elements

**Expected Result:**
- All icons render correctly
- Icons are appropriate for their function
- Colors are consistent with theme
- Visual hierarchy is clear
- Spacing is consistent

**Status:** ⬜ Pass ⬜ Fail

---

### Test Group 8: Accessibility

#### TC8.1: Keyboard Navigation
**Steps:**
1. Use Tab key to navigate
2. Use Enter/Space to activate buttons
3. Use Escape to close modals

**Expected Result:**
- All interactive elements are keyboard accessible
- Focus indicators are visible
- Tab order is logical
- Escape key closes modals
- Enter key submits forms

**Status:** ⬜ Pass ⬜ Fail

---

#### TC8.2: Screen Reader
**Steps:**
1. Use screen reader (NVDA, JAWS, VoiceOver)
2. Navigate through settings page

**Expected Result:**
- All text is readable
- Buttons have descriptive labels
- Form fields have labels
- Error messages are announced
- Modal state changes are announced

**Status:** ⬜ Pass ⬜ Fail

---

## 🎯 Test Summary

### Total Test Cases: 38

**Results:**
- Pass: ___
- Fail: ___
- Blocked: ___
- Not Tested: ___

### Critical Issues Found:
1. 
2. 
3. 

### Minor Issues Found:
1. 
2. 
3. 

### Notes:


---

## 🔍 Browser Compatibility Testing

Test on the following browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 📱 Device Testing

Test on the following devices:

- [ ] Desktop (Windows)
- [ ] Desktop (Mac)
- [ ] iPhone (various sizes)
- [ ] iPad
- [ ] Android Phone
- [ ] Android Tablet

---

## ✅ Sign-off

**Tester Name:** _________________

**Date:** _________________

**Overall Status:** ⬜ Pass ⬜ Fail ⬜ Pass with Minor Issues

**Comments:**


