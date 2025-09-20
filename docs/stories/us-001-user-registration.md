# US-001: User Registration with Email/Password
**Story ID:** US-001  
**Epic:** EPIC-001 (User Authentication)  
**Priority:** High  
**Story Points:** 3  
**Status:** Ready for Development

## User Story
As a new user, I want to register with my email and password so I can access the waste intelligence platform and start using the lead generation features.

## Acceptance Criteria
- [ ] User can access registration form
- [ ] Email field accepts valid email format
- [ ] Password field enforces strength requirements (8+ chars, mixed case, numbers, symbols)
- [ ] Username field validates uniqueness
- [ ] Company selection dropdown is available
- [ ] Form validation shows clear error messages
- [ ] Registration creates user in Supabase Auth
- [ ] User profile is created in `user_profiles` table
- [ ] Email verification is sent automatically
- [ ] User is redirected to verification page after registration
- [ ] Form uses shadcn UI components (Input, Button, Form, Label)

## Technical Requirements
- Supabase Auth integration
- shadcn form components
- Email validation
- Password strength validation
- Username uniqueness check
- Company lookup functionality
- Email verification service

## Implementation Notes
- Use Supabase Auth `signUp` method
- Implement real-time username validation
- Add loading states for form submission
- Handle registration errors gracefully
- Store company association in user profile

## Definition of Done
- [ ] Registration form is fully functional
- [ ] All validation rules are implemented
- [ ] Supabase integration is working
- [ ] Email verification is sent
- [ ] Error handling is implemented
- [ ] Unit tests are written and passing
- [ ] UI matches design specifications

## Dependencies
- Supabase project setup
- Email service configuration
- Company data access
- shadcn UI components

## Testing
- Test valid registration flow
- Test email validation
- Test password strength requirements
- Test username uniqueness
- Test company selection
- Test error handling
- Test email verification flow
