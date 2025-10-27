# Contributing to Inter-NMIMS Basketball Tournament Website

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn
- Git
- Firebase account (for testing real-time features)

### Setup Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/internmims-basketball.git
   cd internmims-basketball
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Add your admin password to .env
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

## 📋 Development Guidelines

### Code Style
- Use **functional components** with hooks
- Follow **React best practices**
- Use **meaningful variable names**
- Add **comments** for complex logic
- Keep components **small and focused**

### File Organization
```
src/
├── components/     # Reusable UI components
├── pages/          # Page-level components
├── firebase.js     # Firebase configuration
└── App.js          # Main app component
```

### Naming Conventions
- **Components**: PascalCase (e.g., `LiveScoreboard.js`)
- **Functions**: camelCase (e.g., `updateScore`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `ADMIN_PASSWORD`)
- **CSS Classes**: kebab-case (e.g., `match-card`)

## 🔧 Making Changes

### Branch Naming
- `feature/` - New features (e.g., `feature/player-stats`)
- `fix/` - Bug fixes (e.g., `fix/timer-flickering`)
- `docs/` - Documentation (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/optimize-rendering`)

### Commit Messages
Follow conventional commits:
```
type(scope): description

Examples:
feat(admin): add player substitution feature
fix(timer): resolve flickering issue
docs(readme): update installation steps
style(ui): improve button hover effects
refactor(scoring): optimize state management
```

### Pull Request Process

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write clean, documented code
   - Test thoroughly
   - Update documentation if needed

3. **Test Your Changes**
   ```bash
   npm test
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill in the template
   - Request review

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# Coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Test Checklist
- [ ] All existing tests pass
- [ ] New features have tests
- [ ] No console errors
- [ ] Works on mobile
- [ ] Works in all major browsers

## 🔒 Security

### Important Rules
- **Never commit** `.env` files
- **Never hardcode** passwords or API keys
- **Always validate** user input
- **Use environment variables** for secrets
- **Test security** before submitting PR

### Security Checklist
- [ ] No hardcoded credentials
- [ ] Input validation added
- [ ] XSS prevention considered
- [ ] Firebase rules updated if needed
- [ ] Rate limiting in place

## 📝 Documentation

### Update Documentation When:
- Adding new features
- Changing existing functionality
- Fixing bugs that affect usage
- Modifying configuration

### Documentation Files
- `README.md` - Main project documentation
- `CONTRIBUTING.md` - This file
- Code comments - Inline documentation

## 🎨 UI/UX Guidelines

### Design Principles
- **Consistency** - Follow existing design patterns
- **Accessibility** - Ensure keyboard navigation works
- **Responsiveness** - Test on mobile and desktop
- **Performance** - Optimize for speed

### Color Palette
- Primary Orange: `#F97316`
- Black: `#000000`
- White: `#FFFFFF`
- Use existing CSS variables

### Animation
- Use Framer Motion for animations
- Keep animations smooth (60fps)
- Respect user's motion preferences

## 🐛 Bug Reports

### Before Reporting
1. Check if issue already exists
2. Try to reproduce the bug
3. Test on different browsers
4. Clear cache and try again

### Bug Report Template
```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- Browser: Chrome 120
- OS: Windows 11
- Device: Desktop
```

## ✨ Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches you've thought about

**Additional Context**
Any other relevant information
```

## 🔄 Code Review Process

### What We Look For
- ✅ Code quality and readability
- ✅ Proper error handling
- ✅ Performance considerations
- ✅ Security best practices
- ✅ Documentation updates
- ✅ Test coverage

### Review Timeline
- Initial review: Within 2-3 days
- Follow-up reviews: Within 1-2 days
- Merge: After approval from maintainer

## 📞 Getting Help

### Resources
- **Documentation**: Check `README.md` and other docs
- **Issues**: Search existing issues on GitHub
- **Discussions**: Use GitHub Discussions for questions

### Contact
- Open an issue for bugs
- Start a discussion for questions
- Email for security concerns

## 🎯 Priority Areas

### High Priority
- Security improvements
- Performance optimizations
- Bug fixes
- Mobile responsiveness

### Medium Priority
- New features
- UI enhancements
- Documentation improvements

### Low Priority
- Code refactoring
- Style improvements
- Minor tweaks

## 📜 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the project
- Show empathy towards others

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Unprofessional conduct

## 🏆 Recognition

Contributors will be:
- Listed in `README.md`
- Credited in release notes
- Thanked in project documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to the Inter-NMIMS Basketball Tournament Website!** 🏀

**Questions?** Open an issue or start a discussion on GitHub.
