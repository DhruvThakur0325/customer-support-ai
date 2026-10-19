\# Customer Support AI



A full-stack customer support ticket management application built with Next.js, Node.js, Express, and MongoDB.



\## Live Demo



\- \*\*Frontend:\*\* https://customer-support-6pu7z148j-dhruv-s-portfolio.vercel.app/

\- \*\*Backend:\*\* https://customer-support-ai-backend-9025.onrender.com



\## Features



\- View existing customer support tickets

\- Create new support tickets

\- Update ticket statuses

\- Search tickets

\- Filter tickets

\- Persist ticket status changes after refreshing

\- Responsive dashboard interface

\- REST API connected to MongoDB



\## Tech Stack



\### Frontend

\- Next.js

\- React

\- TypeScript



\### Backend

\- Node.js

\- Express.js

\- MongoDB

\- Mongoose

\- REST API



\### Deployment

\- Vercel — frontend

\- Render — backend

\- MongoDB Atlas — database



\## Project Structure



```text

customer-support-ai/

├── backend/

│   ├── server.js

│   └── package.json

├── frontend/

│   ├── app/

│   ├── package.json

│   └── ...

├── .gitignore

└── README.md

```



\## Run Locally



\### 1. Clone the repository



```bash

git clone https://github.com/DhruvThakur0325/customer-support-ai.git

cd customer-support-ai

```



\### 2. Start the backend



```bash

cd backend

npm install

```



Create a `.env` file inside the `backend` directory:



```env

PORT=5000

MONGODB\_URI=your\_mongodb\_connection\_string

```



Start the backend:



```bash

npm start

```



\### 3. Start the frontend



Open a second terminal:



```bash

cd frontend

npm install

```



Create a `.env.local` file inside the `frontend` directory:



```env

NEXT\_PUBLIC\_API\_URL=http://localhost:5000

```



Start the frontend:



```bash

npm run dev

```



Open http://localhost:3000 in your browser.



\## Environment Variables



\- `MONGODB\_URI` — MongoDB connection string for the backend.

\- `PORT` — backend port; defaults to `5000`.

\- `NEXT\_PUBLIC\_API\_URL` — backend base URL used by the frontend.



\*\*Security:\*\* Never commit `.env` or `.env.local` files, database credentials, or other secrets to GitHub.



\## Author



\*\*Dhruv Thakur\*\*



\- GitHub: https://github.com/DhruvThakur0325

\- LinkedIn: https://linkedin.com/in/dhruvthakur0325/





