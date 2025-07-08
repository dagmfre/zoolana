# zoolana – Your AI Career Helper

## Problem

Finding a job can feel overwhelming. You have to write a strong resume, craft a clear cover letter, and get ready for interviews—all while trying to stand out. It’s easy to get stuck or waste time not knowing what works.

## How zoolana Helps

zoolana uses simple AI tools to guide you. It builds and improves your resume, creates cover letters, and runs practice interviews. You get quick feedback and easy tips.

## 🔍 What zoolana Offers

- **Smart Resume Designer**: Generate and refine resumes with AI-driven suggestions based on industry best practices.
- **Cover Letter Creator**: Draft compelling cover letters in one click by simply defining your target role.
- **Mock Interview Simulator**: Engage in interactive interview sessions, get instant AI feedback, and improve your answers.
- **Real-Time Career Insights**: Stay updated on market trends and job recommendations tailored to your skillset.
- **Secure User Authentication**: Seamless sign-up and login flows powered by Clerk.
- **Scalable Architecture**: Built on Next.js 15 App Router with Inngest for background task handling.

## ⚙️ Under the Hood

| Tech Component           | Description                    |
| ------------------------ | ------------------------------ |
| React 19 & Next.js 15    | Frontend framework & SSR       |
| Tailwind CSS & Shadcn UI | Styling & UI components        |
| Prisma & NeonDB          | Database modeling & storage    |
| Clerk Auth               | User management & security     |
| Inngest                  | Event-driven background jobs   |
| Gemini API               | AI-powered language processing |
| Vercel                   | Deployment & hosting platform  |

## 🚀 Quickstart Guide

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/zoolana.git
   cd zoolana
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   Create a `.env` file in the project root with the following entries:
   ```dotenv
   DATABASE_URL=
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
   GEMINI_API_KEY=
   ```
4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. **Start the development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to explore the platform.

## 🐳 Docker Usage

To run zoolana in a Docker container:

```bash
# Build the image
docker build \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_pub_key \
  --build-arg CLERK_SECRET_KEY=your_secret_key \
  --build-arg DATABASE_URL="your_db_url" \
  -t zoolana-app .

# Run the container
docker run -p 3000:3000 zoolana-app
```

## 🤝 Contributing

Got an idea or want to help improve zoolana? Feel free to open issues or submit pull requests. Please follow the [code of conduct](CODE_OF_CONDUCT.md) and review our [contribution guidelines](CONTRIBUTING.md) before getting started.

---

© 2025 zoolana • Licensed under [MIT](LICENSE.md)
