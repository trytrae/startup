# Convolens

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version 18.17 or higher)
- [Git](https://git-scm.com/)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Step-by-Step Installation Guide

1. **Clone the Repository**
   ```bash
   git clone  
   ```

2. **Navigate to Project Directory**
   ```bash
   cd 
   ```

3. **Install Dependencies**
   ```bash
   pnpm i
   ```

4. **Set Up Environment Variables**
   - Copy the example environment file:
     ```bash
     cp .env.example .env 
     ```
   - Open `.env` and fill in your environment variables:
     ```env
     # App
     NEXT_PUBLIC_APP_URL=http://localhost:3000

     # Supabase
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
 
     ```

5. **Run Development Server**
   ```bash
   pnpm dev
   ```

6. **Open Your Browser**
   Visit [http://localhost:3000](http://localhost:3000) to see your application running.

## 🔧 Configuration Guide

### Setting Up Supabase

1. Create a [Supabase](https://supabase.com/) account
2. Create a new project
3. Go to Project Settings > API
4. Copy the URL and anon key to your `.env`
 

## 📚 Project Structure

```
convolens/
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── lib/            # Utility functions
│   └── styles/         # Global styles
├── public/             # Static assets
├── prisma/            # Database schema
└── ...config files
```

## 🛠️ Development Tools

- **Code Quality**
  - ESLint for code linting
  - Prettier for code formatting
  - TypeScript for type safety

- **Git Hooks**
  - Husky for Git hooks
  - lint-staged for staged files linting

 
 
## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/) 

 