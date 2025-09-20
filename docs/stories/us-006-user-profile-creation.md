# US-006: User Profile Creation
**Story ID:** US-006  
**Epic:** EPIC-002 (User Profile Management)  
**Priority:** High  
**Story Points:** 3  
**Status:** Ready for Development

## User Story
As a new user, I want to create my profile with personal information and company association so I can be properly identified and have appropriate access to the platform.

## Acceptance Criteria
- [ ] Profile creation form is accessible after registration
- [ ] Full name field is required and validated
- [ ] Username field shows availability in real-time
- [ ] Company selection dropdown is populated
- [ ] Role selection is available (User, Admin, Company Admin)
- [ ] Profile picture upload is optional
- [ ] Form validation provides clear feedback
- [ ] Profile is saved to `user_profiles` table
- [ ] Company association is properly linked
- [ ] User is redirected to dashboard after completion
- [ ] Form uses shadcn UI components (Input, Select, Button, Form, Avatar)

## Technical Requirements
- Profile form components
- Real-time username validation
- Company data lookup
- File upload for profile pictures
- Data validation
- Database integration

## Implementation Notes
- Pre-populate email from registration
- Implement real-time username checking
- Add image upload with preview
- Validate company selection
- Handle role assignment based on company access

## Definition of Done
- [ ] Profile creation form is fully functional
- [ ] All validation rules are implemented
- [ ] Database integration is working
- [ ] File upload is functional
- [ ] Real-time validation is working
- [ ] Unit tests are written and passing
- [ ] UI/UX review is completed

## Dependencies
- User registration (US-001)
- Company data access
- File storage setup
- shadcn UI components

## Testing
- Test profile creation flow
- Test username validation
- Test company selection
- Test file upload
- Test role assignment
- Test data persistence
- Test error handling
