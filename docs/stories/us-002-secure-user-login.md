# US-002: Secure User Login
**Story ID:** US-002  
**Epic:** EPIC-001 (User Authentication)  
**Priority:** High  
**Story Points:** 2  
**Status:** Ready for Development

## User Story
As a registered user, I want to login securely with my email and password so I can access my account and the waste intelligence platform features.

## Acceptance Criteria
- [ ] User can access login form
- [ ] Email field accepts valid email format
- [ ] Password field is masked
- [ ] "Remember me" checkbox is available
- [ ] Login button is disabled while processing
- [ ] Form validation shows clear error messages
- [ ] Successful login redirects to dashboard
- [ ] Failed login shows appropriate error message
- [ ] Rate limiting prevents brute force attacks
- [ ] Session is properly established
- [ ] Form uses shadcn UI components (Input, Button, Checkbox, Form)

## Technical Requirements
- Supabase Auth integration
- shadcn form components
- Session management
- Rate limiting implementation
- Error handling
- Redirect logic

## Implementation Notes
- Use Supabase Auth `signInWithPassword` method
- Implement rate limiting on login attempts
- Add loading states and error handling
- Handle "Remember me" functionality
- Redirect based on user role and company access

## Definition of Done
- [ ] Login form is fully functional
- [ ] Authentication is working with Supabase
- [ ] Rate limiting is implemented
- [ ] Error handling is comprehensive
- [ ] Session management is working
- [ ] Unit tests are written and passing
- [ ] Security review is completed

## Dependencies
- Supabase Auth setup
- User registration (US-001)
- Dashboard implementation
- Rate limiting service

## Testing
- Test valid login flow
- Test invalid credentials
- Test rate limiting
- Test "Remember me" functionality
- Test session persistence
- Test error handling
- Test redirect logic
